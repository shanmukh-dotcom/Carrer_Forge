import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { generateTest } from '../services/api';
import Navbar from '../components/Navbar';
import { Swords, ShieldAlert, Heart, Zap, Award, Loader2 } from 'lucide-react';
import './Duel.css';

const Duel = () => {
    const { currentGoal, completedNodes } = useProgress();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [health, setHealth] = useState(3);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [victory, setVictory] = useState(false);
    
    // UI state
    const [selectedOption, setSelectedOption] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        if (!currentGoal || completedNodes.length === 0) {
            navigate('/choose-path');
            return;
        }

        const fetchDuel = async () => {
            try {
                // Pass the most recently completed node as the "current" boss topic
                const currentBoss = completedNodes[completedNodes.length - 1];
                const res = await generateTest(currentBoss, currentGoal);
                
                if (res && res.data && res.data.test) {
                    setTestData(res.data.test);
                } else {
                    throw new Error("Invalid duel data format");
                }
            } catch (err) {
                console.warn("AI Duel failed to generate, using fallback boss data", err);
                setTestData([
                   { question: 'What is the highest priority factor the Learning Engine considers?', options: ['Memory', 'Discipline', 'Speed', 'Knowledge'], correctAnswer: 'Discipline', explanation: 'Discipline is the sharpest blade.' },
                   { question: 'Which styling architecture does CAREER_FORGE use primarily?', options: ['Tailwind', 'Bootstrap', 'Vanilla CSS', 'SASS'], correctAnswer: 'Vanilla CSS', explanation: 'We rely on vanilla CSS for extreme pixel-perfect control.' },
                   { question: `True mastery in ${currentGoal} requires...`, options: ['Copying code', 'Relying on frameworks', 'Understanding core concepts', 'Memorizing syntax'], correctAnswer: 'Understanding core concepts', explanation: 'Concepts outlast syntax.' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDuel();
    }, [currentGoal, completedNodes, navigate]);

    const handleAnswer = (option) => {
        if (isChecking) return;
        setSelectedOption(option);
    };

    const confirmAnswer = () => {
        if (!selectedOption) return;
        
        setIsChecking(true);
        const currentQ = testData[currentIndex];
        
        // Exact match or substring handling if AI generated varying formats A/B/C/D vs string
        // We will do a generic includes check just to be safe if the model gets weird
        const isCorrect = selectedOption === currentQ.correctAnswer || currentQ.correctAnswer.includes(selectedOption);

        if (isCorrect) {
            setFeedback({ type: 'success', text: "Critical Hit! " + currentQ.explanation });
            setScore(s => s + 100);
        } else {
            setFeedback({ type: 'damage', text: "You took damage! Correct: " + currentQ.correctAnswer + ". " + currentQ.explanation });
            setHealth(h => h - 1);
        }

        setTimeout(() => {
            if (health - (isCorrect ? 0 : 1) <= 0) {
                setGameOver(true);
                setVictory(false);
            } else if (currentIndex >= testData.length - 1) {
                setGameOver(true);
                setVictory(true);
            } else {
                setCurrentIndex(i => i + 1);
                setSelectedOption(null);
                setFeedback(null);
                setIsChecking(false);
            }
        }, 3500);
    };

    if (loading) {
        return (
            <div className="duel-loading dash-bg-img">
                <div className="duel-overlay"></div>
                <div className="loading-content animate-pulse">
                    <Swords size={60} className="accent-red spinner-slow" />
                    <h2>Summoning the AI Boss...</h2>
                    <p>Recompiling your past learning memories for the ultimate test.</p>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="new-dashboard-layout dash-bg-img">
                <div className="duel-overlay"></div>
                <Navbar />
                <div className="duel-results container animate-fade-up">
                    {victory ? (
                        <div className="victory-panel">
                            <Award size={80} className="accent-gold pulse" />
                            <h1 className="accent-gold">Boss Defeated!</h1>
                            <p>You have proven your mastery over {currentGoal}.</p>
                            
                            <div className="duel-stats">
                                <div><Heart className="accent-red"/> {health} HP Left</div>
                                <div><Zap className="accent-gold"/> {score} XP Earned</div>
                            </div>
                            
                            <button className="primary-btn mt-4" onClick={() => navigate('/dashboard')}>
                                Return to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="defeat-panel">
                            <ShieldAlert size={80} color="#555" />
                            <h1>You Perished in Combat</h1>
                            <p>The AI Engine found weaknesses in your fundamental knowledge.</p>
                            <p className="text-secondary mt-2">Go back to your training and return when you are stronger.</p>
                            
                            <button className="outline-btn mt-4" onClick={() => navigate('/skill-map')}>
                                Retreat to Skill Map
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentQ = testData[currentIndex];

    return (
        <div className="new-dashboard-layout dash-bg-img">
            <div className="duel-overlay highlight-red"></div>
            <Navbar />

            <div className="duel-container container">
                
                {/* HUD */}
                <div className="duel-hud animate-fade-in">
                    <div className="health-bar">
                        {[...Array(3)].map((_, i) => (
                            <Heart key={i} size={30} fill={i < health ? '#d32f2f' : 'transparent'} color={i < health ? '#d32f2f' : '#555'} />
                        ))}
                    </div>
                    
                    <div className="boss-info">
                        <h2>Mastery Duel</h2>
                        <p>Wave {currentIndex + 1} of {testData.length}</p>
                    </div>

                    <div className="score-tracker">
                        <Zap className="accent-gold"/> {score}
                    </div>
                </div>

                {/* Arena */}
                <div className="arena-panel animate-fade-up">
                    <div className="question-box">
                        <h3>{currentQ.question}</h3>
                    </div>

                    <div className="options-grid">
                        {currentQ.options.map((opt, i) => (
                            <button 
                                key={i} 
                                className={`duel-option ${selectedOption === opt ? 'selected' : ''} ${isChecking && opt === currentQ.correctAnswer ? 'correct' : ''} ${isChecking && selectedOption === opt && opt !== currentQ.correctAnswer ? 'wrong' : ''}`}
                                onClick={() => handleAnswer(opt)}
                                disabled={isChecking}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {feedback && (
                        <div className={`duel-feedback animate-fade-in ${feedback.type}`}>
                            <p>{feedback.text}</p>
                        </div>
                    )}

                    <div className="duel-action">
                        <button 
                            className={`primary-btn strike-btn ${!selectedOption || isChecking ? 'disabled' : ''}`} 
                            onClick={confirmAnswer}
                            disabled={!selectedOption || isChecking}
                        >
                            <Swords /> STRIKE
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Duel;
