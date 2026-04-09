import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { analyzeVideo } from '../services/api';
import Navbar from '../components/Navbar';
import { Loader2, Zap, BookOpen, Scroll, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import './Train.css';

const Train = () => {
   const [searchParams] = useSearchParams();
   const topic = searchParams.get('topic') || 'Training';
   const preloadedVideoUrl = searchParams.get('videoUrl') || '';
   const navigate = useNavigate();
   const { markNodeComplete, currentGoal } = useProgress();

   const [analyzing, setAnalyzing] = useState(false);
   const [videoInput, setVideoInput] = useState(preloadedVideoUrl);
   const [embedUrl, setEmbedUrl] = useState(() => {
       // Auto-embed if we got a videoUrl from SkillMap (playlist mode)
       if (!preloadedVideoUrl) return '';
       const val = preloadedVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
       return val && val[1] ? `https://www.youtube.com/embed/${val[1]}` : '';
   });
   const [summary, setSummary] = useState(null);
   const [error, setError] = useState('');

   // Parse YouTube URL to embed format
   const loadYoutubeVideo = () => {
       if (!videoInput) return;
       let finalEmbed = '';
       
       // Playlist check
       const listMatch = videoInput.match(/[?&]list=([^#\&\?]+)/);
       if (listMatch) {
           finalEmbed = `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
       } else {
           // Standard video check
           const val = videoInput.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
           if (val && val[1]) {
               finalEmbed = `https://www.youtube.com/embed/${val[1]}`;
           }
       }
       
       if (finalEmbed) {
           setEmbedUrl(finalEmbed);
           setSummary(null); // Reset summary when loading new video
           setError('');
       } else {
           alert("Please enter a valid YouTube Video or Playlist URL!");
       }
   };

   const handleAnalyze = async () => {
       if (!videoInput) {
           setError("Please paste a YouTube URL first so we can fetch the transcript!");
           return;
       }
       
       setAnalyzing(true);
       setError('');
       setSummary(null);
       
       try {
           // Backend uses youtube-transcript npm package to:
           // 1. Fetch the full video transcript from YouTube
           // 2. Send it to Gemini AI for summarization & MCQ generation
           // Pass goalId so this knowledge gets stored in the Trading/Frontend/etc. vault
           const response = await analyzeVideo(topic, videoInput, null, currentGoal);
           
           if (response && response.data) {
               setSummary(response.data);
           } else {
               throw new Error("Empty response from AI");
           }
       } catch (err) {
            console.error("AI summary failed:", err);
            const apiError = err.response?.data?.error || err.message || "Unknown error";
            setError(`Analysis failed: ${apiError}`);
       } finally {
           setAnalyzing(false);
       }
   };

   const handleComplete = () => {
       markNodeComplete(topic);
       navigate('/completion');
   };

   return (
       <div className="new-dashboard-layout">
           <Navbar />
           
           <div className="train-container container">
                
                <header className="train-header animate-fade-in">
                    <div className="train-title-row">
                        <div className="train-titles">
                            <h1 className="accent-gold" style={{textTransform: 'uppercase'}}>{topic}</h1>
                            <p className="lesson-count">AI-Powered Training Session</p>
                        </div>
                        <div className="train-xp accent-gold">
                            <Zap size={20}/> 0 XP
                        </div>
                    </div>
                    
                    <div className="video-progress-track">
                        <div className="video-progress-fill" style={{width: summary ? '100%' : embedUrl ? '60%' : '10%', transition: 'width 0.8s ease'}}></div>
                    </div>
                </header>

                {/* YouTube URL input always visible at top if no video loaded */}
                {!embedUrl && (
                    <div className="video-placeholder-box animate-fade-up">
                        <div className="glowing-book-icon">
                            <BookOpen size={40} color="#d32f2f" />
                        </div>
                        <h2>Load a Class for {topic}</h2>
                        
                        <div className="youtube-input-wrapper">
                            <input 
                                type="text" 
                                className="youtube-url-input" 
                                placeholder="Paste YouTube Video or Playlist URL here..." 
                                value={videoInput}
                                onChange={(e) => setVideoInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadYoutubeVideo()}
                            />
                            <button className="primary-btn load-btn" onClick={loadYoutubeVideo}>
                                Load Video
                            </button>
                        </div>
                    </div>
                )}

                {/* Video Player */}
                {embedUrl && (
                    <div className="animate-fade-in">
                        <div className="video-player-container" style={{width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(211, 47, 47, 0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'}}>
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={embedUrl} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* URL input below player (to swap videos) */}
                        <div className="change-video-bar">
                            <input 
                                type="text" 
                                className="youtube-url-input" 
                                placeholder="Load a different video..." 
                                value={videoInput}
                                onChange={(e) => setVideoInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && loadYoutubeVideo()}
                            />
                            <button className="outline-btn load-btn" onClick={loadYoutubeVideo}>Swap</button>
                        </div>

                        {/* Summarize Button */}
                        {!summary && (
                            <div className="analyze-cta">
                                <div className="cta-text">
                                    <Scroll size={20} className="accent-gold"/>
                                    <div>
                                        <h4>Ready to learn from this video?</h4>
                                        <p className="text-secondary" style={{fontSize: '0.9rem'}}>Our AI will fetch the transcript and generate a personalized summary + quiz</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        className="primary-btn"
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        style={{padding: '1rem 2.5rem', whiteSpace: 'nowrap', width: '100%'}}
                                    >
                                        {analyzing 
                                            ? <><Loader2 className="spinner" size={18}/> Analyzing...</> 
                                            : <><Brain size={18}/> Summarize Video</>
                                        }
                                    </button>
                                    <span className="text-secondary" style={{ fontSize: '0.75rem', opacity: 0.6, letterSpacing: '0.02em' }}>
                                        (This may take a while since this is an MVP)
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && <p className="error-text">{error}</p>}
                    </div>
                )}

                {/* AI Summary Results */}
                {summary && (
                    <div className="summary-results animate-fade-up">

                        {/* 1. Deep Summary */}
                        <div className="summary-panel">
                            <h3 className="panel-title">
                                <Scroll size={22} className="accent-gold"/> Wisdom Scroll
                            </h3>
                            <ul className="summary-bullets">
                                {summary.summary?.map((point, i) => (
                                    <li key={i}>
                                        <span className="bullet-dot accent-red">▸</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 2. Important Notes */}
                        {summary.important_notes?.length > 0 && (
                            <div className="summary-panel" style={{borderColor: 'rgba(203,160,82,0.3)', background: 'rgba(203,160,82,0.04)'}}>
                                <h3 className="panel-title accent-gold">
                                    <span style={{fontSize:'1.1rem'}}>⭐</span> Important Notes
                                </h3>
                                <ul className="summary-bullets">
                                    {summary.important_notes.map((note, i) => (
                                        <li key={i}>
                                            <span className="bullet-dot accent-gold">⭐</span>
                                            {note.replace(/^⭐\s*/, '')}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 3. Keywords */}
                        {summary.keywords?.length > 0 && (
                            <div className="keywords-row" style={{marginBottom: '1.5rem'}}>
                                {summary.keywords.map((kw, i) => (
                                    <span key={i} className="keyword-chip">{kw}</span>
                                ))}
                            </div>
                        )}

                        {/* 4. Conceptual Questions */}
                        {summary.conceptual_questions?.length > 0 && (
                            <div className="summary-panel">
                                <h3 className="panel-title">
                                    <Brain size={22} className="accent-red"/> Conceptual Challenges
                                </h3>
                                <ol className="questions-list">
                                    {summary.conceptual_questions.map((q, i) => (
                                        <li key={i} className="question-item">
                                            <span className="q-num accent-red">{i + 1}</span>
                                            {q}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* 5. Practical Questions */}
                        {summary.practical_questions?.length > 0 && (
                            <div className="summary-panel" style={{borderColor: 'rgba(211,47,47,0.3)', background: 'rgba(211,47,47,0.04)'}}>
                                <h3 className="panel-title accent-red">
                                    <Zap size={22}/> Practical Missions
                                </h3>
                                <ol className="questions-list">
                                    {summary.practical_questions.map((q, i) => (
                                        <li key={i} className="question-item mission-item">
                                            <span className="q-num">⚔️</span>
                                            {q}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* 6. Mind Challenge — Interactive MCQs */}
                        {summary.mcqs?.length > 0 && (
                            <div className="summary-panel">
                                <h3 className="panel-title">
                                    <Brain size={22} className="accent-red"/> Mind Challenge
                                </h3>
                                {summary.mcqs.map((mcq, i) => (
                                    <MCQCard key={i} mcq={mcq} index={i} />
                                ))}
                            </div>
                        )}

                        {/* 7. Memory Links */}
                        {summary.connections?.length > 0 && (
                            <div className="summary-panel" style={{borderColor: 'rgba(203,160,82,0.3)'}}>
                                <h3 className="panel-title accent-gold">
                                    <Brain size={22}/> Memory Links
                                </h3>
                                <ul className="summary-bullets">
                                    {summary.connections.map((conn, i) => (
                                        <li key={i}>
                                            <span className="bullet-dot accent-gold">⚡</span>
                                            {conn}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{display: 'flex', justifyContent: 'center', marginTop: '3rem'}}>
                            <button className="primary-btn" onClick={handleComplete} style={{padding: '1.2rem 4rem', fontSize: '1.1rem'}}>
                                <CheckCircle size={20}/> Complete Training <ArrowRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}

           </div>
       </div>
   );
};

// Interactive MCQ card — shows correct answer and explanation on selection
const MCQCard = ({ mcq, index }) => {
    const [selected, setSelected] = useState(null);
    const isAnswered = selected !== null;

    return (
        <div className="mcq-card">
            <p className="mcq-question">
                <span className="accent-gold" style={{fontFamily: 'var(--font-mono)', marginRight: '0.5rem'}}>Q{index + 1}.</span>
                {mcq.question}
            </p>
            <div className="mcq-options">
                {mcq.options?.map((opt, i) => {
                    const isCorrect = opt === mcq.correctAnswer;
                    const isSelected = selected === i;
                    let btnClass = 'mcq-option-btn';
                    if (isAnswered) {
                        if (isCorrect) btnClass += ' correct';
                        else if (isSelected) btnClass += ' wrong';
                    } else if (isSelected) {
                        btnClass += ' selected';
                    }
                    return (
                        <button
                            key={i}
                            className={btnClass}
                            onClick={() => !isAnswered && setSelected(i)}
                            disabled={isAnswered}
                        >
                            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                            {opt}
                            {isAnswered && isCorrect && <span style={{marginLeft: 'auto', fontSize: '1rem'}}>✓</span>}
                            {isAnswered && isSelected && !isCorrect && <span style={{marginLeft: 'auto', fontSize: '1rem'}}>✗</span>}
                        </button>
                    );
                })}
            </div>
            {isAnswered && mcq.explanation && (
                <div className="mcq-explanation animate-fade-up">
                    <span className="accent-gold">💡</span> {mcq.explanation}
                </div>
            )}
        </div>
    );
};

export default Train;

