import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { getPlaylistVideos } from '../services/api';
import { Code, Palette, BrainCircuit, Database, Smartphone, ShieldCheck, ListVideo, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import './ChoosePath.css';

const paths = [
  { id: 'frontend', title: 'Frontend Developer', desc: 'The Art of Interfaces', icon: <Code size={20} color="#d32f2f" /> },
  { id: 'uiux', title: 'UI/UX Designer', desc: 'The Way of Experience', icon: <Palette size={20} color="#cba052" /> },
  { id: 'ai', title: 'AI & Machine Learning', desc: "The Mind's Edge", icon: <BrainCircuit size={20} color="#d32f2f" /> },
  { id: 'backend', title: 'Backend Engineer', desc: 'The Hidden Foundation', icon: <Database size={20} color="#cba052" /> },
  { id: 'mobile', title: 'Mobile Developer', desc: 'The Swift Strike', icon: <Smartphone size={20} color="#d32f2f" /> },
  { id: 'cyber', title: 'Cybersecurity', desc: 'The Shadow Guard', icon: <ShieldCheck size={20} color="#cba052" /> },
];

const recommendedPlaylists = {
  frontend: [
    { title: "Frontend Web Development Full Course", url: "https://www.youtube.com/playlist?list=PLWKjhJtqVAbmMuZ3saqRIBimAKIMYkt0E" },
    { title: "HTML & CSS for Beginners", url: "https://youtube.com/playlist?list=PLr6-GrHUlVf_ZNmuQSXdS197Oyr1L9sPB" }
  ],
  uiux: [
    { title: "UI/UX Design Full Course", url: "https://www.youtube.com/playlist?list=PLdvOfoe7PXT0ouChAnR1nHlT8BJIo5hP_" },
    { title: "UX Design Fundamentals", url: "https://youtube.com/playlist?list=PLM-OxsL-wU7Z3sD_A_V0B7mJgX0X9QY_N" }
  ],
  ai: [
    { title: "Machine Learning for Beginners", url: "https://youtube.com/playlist?list=PL9ooVrP1hQOHUfd-g8GUpKI3hHOwM_9Dn" },
    { title: "Deep Learning Crash Course", url: "https://youtube.com/playlist?list=PLtBw6njQRU-rwp5__7C0oIVt26ZgjG9NI" }
  ],
  backend: [
    { title: "Backend Web Development Course", url: "https://www.youtube.com/playlist?list=PLWKjhJtqVAbn21gs5UnLhCQ82f923WCgM" },
    { title: "Python Backend Development", url: "https://youtube.com/playlist?list=PL-osiE80TeTs4UjLw5MM6OjgkjFeUxCYH" }
  ],
  mobile: [
    { title: "Mobile App Development Course", url: "https://www.youtube.com/playlist?list=PLTjRvDozrdlxzQet01qZBt-sRG8bbDggv" },
    { title: "Flutter for Beginners", url: "https://youtube.com/playlist?list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ" }
  ],
  cyber: [
    { title: "Cyber Security Full Course", url: "https://www.youtube.com/playlist?list=PLOspHqNVtKADkWLFt9OcziQF7EatuANSY" },
    { title: "Cybersecurity Fundamentals", url: "https://youtube.com/playlist?list=PLBf0hzazHTGOptlA2AOL1XyP_Z9iQ8hps" }
  ],
};


const ChoosePath = () => {
  const [step, setStep] = useState(1); // 1 = pick goal, 2 = paste playlist
  const [selectedId, setSelectedId] = useState(null);
  const [customPath, setCustomPath] = useState('');
  const [playlistInput, setPlaylistInput] = useState('');
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState('');
  const [fetchedVideos, setFetchedVideos] = useState([]);

  const { setCurrentGoal, setPlaylistUrl, setPlaylistVideos } = useProgress();
  const navigate = useNavigate();

  const finalGoal = customPath || paths.find(p => p.id === selectedId)?.title;

  const handleGoalNext = () => {
    if (finalGoal) setStep(2);
  };

  const handleLoadPlaylist = async () => {
    if (!playlistInput.trim()) return;
    setLoadingPlaylist(true);
    setPlaylistError('');
    
    // Detect single video URLs and show a helpful message immediately
    const isPlaylist = playlistInput.includes('list=') || playlistInput.includes('/playlist');
    const isSingleVideo = playlistInput.includes('youtu.be/') || playlistInput.includes('watch?v=');
    
    if (!isPlaylist && isSingleVideo) {
      setLoadingPlaylist(false);
      setPlaylistError('That looks like a single video link. Please paste a YouTube PLAYLIST URL (it must contain "list=" in the URL). Go to a playlist page on YouTube and copy the link from your browser\'s address bar.');
      return;
    }

    try {
      const res = await getPlaylistVideos(playlistInput);
      if (res && res.data && res.data.length > 0) {
        setFetchedVideos(res.data);
      } else {
        setPlaylistError('No videos found. Make sure the playlist is public and try again!');
      }
    } catch (err) {
      setPlaylistError('Could not load playlist. Make sure the URL contains "list=" and the playlist is set to public on YouTube.');
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const handleBeginTraining = () => {
    setCurrentGoal(finalGoal);
    if (fetchedVideos.length > 0) {
      setPlaylistUrl(playlistInput);
      setPlaylistVideos(fetchedVideos);
    }
    navigate('/skill-map');
  };

  const handleSkipPlaylist = () => {
    setCurrentGoal(finalGoal);
    setPlaylistUrl(null);
    setPlaylistVideos([]);
    navigate('/skill-map');
  };

  return (
    <div className="choose-path-container animate-fade-in">
      <div className="container">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <header className="path-header">
              <p className="subtitle">STEP 1 OF 2</p>
              <h1 className="main-title">Choose Your <span className="accent-red">Path</span></h1>
              <p className="path-desc">What discipline do you wish to master? Select a path or forge your own.</p>
            </header>

            <div className="custom-input-wrapper">
              <input 
                type="text" 
                className="custom-path-input" 
                placeholder="Or type your own path..." 
                value={customPath}
                onChange={(e) => {
                  setCustomPath(e.target.value);
                  setSelectedId(null);
                }}
              />
            </div>

            <div className="paths-grid">
              {paths.map(path => (
                <div 
                  key={path.id}
                  className={`path-card ${selectedId === path.id && !customPath ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedId(path.id);
                    setCustomPath('');
                  }}
                >
                  <div className="path-icon">{path.icon}</div>
                  <div className="path-info">
                    <h3>{path.title}</h3>
                    <p>{path.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="action-footer">
               <button 
                 className={`start-btn ${finalGoal ? 'active' : ''}`}
                 onClick={handleGoalNext}
                 disabled={!finalGoal}
               >
                 Next: Upload Playlist <ArrowRight size={18} style={{marginLeft: '0.5rem'}}/>
               </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <header className="path-header">
              <p className="subtitle accent-gold">STEP 2 OF 2</p>
              <h1 className="main-title">Upload Your <span className="accent-red">Playlist</span></h1>
              <p className="path-desc">
                Paste a YouTube playlist URL and we'll build your Skill Map directly from its videos.
                <br/>
                Your goal: <strong className="accent-gold">{finalGoal}</strong>
              </p>
            </header>

            {selectedId && recommendedPlaylists[selectedId] && (
              <div className="recommendations-box">
                <h3 className="accent-gold mb-4" style={{fontSize: '1.1rem', marginBottom: '1rem'}}>
                  Recommended for {finalGoal}
                </h3>
                <div className="recommendations-grid">
                  {recommendedPlaylists[selectedId].map((rec, i) => (
                    <div 
                      key={i} 
                      className="rec-card"
                      onClick={() => {
                        setPlaylistInput(rec.url);
                      }}
                    >
                      <h4>{rec.title}</h4>
                      <p>Click to select this path</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="playlist-upload-box">
              <ListVideo size={32} className="accent-red" style={{marginBottom: '1rem'}}/>
              
              <div className="playlist-input-row">
                <input 
                  type="text"
                  className="custom-path-input"
                  placeholder="https://youtube.com/playlist?list=PL..."
                  value={playlistInput}
                  onChange={e => setPlaylistInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLoadPlaylist()}
                />
                <button 
                  className={`start-btn active`} 
                  style={{whiteSpace: 'nowrap', padding: '1rem 2rem'}}
                  onClick={handleLoadPlaylist}
                  disabled={loadingPlaylist}
                >
                  {loadingPlaylist ? <Loader2 size={18} className="spinner"/> : 'Load Playlist'}
                </button>
              </div>

              {playlistError && <p className="accent-red" style={{marginTop: '1rem'}}>{playlistError}</p>}

              {fetchedVideos.length > 0 && (
                <div className="playlist-preview animate-fade-in">
                  <p className="subtitle accent-gold" style={{marginBottom: '1rem'}}>
                    <CheckCircle size={16}/> {fetchedVideos.length} videos found! Your Skill Map is ready.
                  </p>
                  <div className="playlist-video-list">
                    {fetchedVideos.slice(0, 5).map((v, i) => (
                      <div key={v.videoId} className="playlist-video-item">
                        <span className="video-index accent-gold">{i + 1}</span>
                        <span>{v.title}</span>
                      </div>
                    ))}
                    {fetchedVideos.length > 5 && (
                      <p className="text-secondary" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
                        ...and {fetchedVideos.length - 5} more videos
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="action-footer" style={{gap: '1rem', flexDirection: 'row', justifyContent: 'center'}}>
              <button 
                className={`start-btn ${fetchedVideos.length > 0 ? 'active' : ''}`}
                onClick={handleBeginTraining}
                disabled={fetchedVideos.length === 0}
                style={{padding: '1rem 2.5rem'}}
              >
                ⚔️ Build Map
              </button>
              <button 
                className="start-btn active"
                onClick={handleSkipPlaylist}
                style={{padding: '1rem 2.5rem', background: 'rgba(211,47,47,0.2)', boxShadow: 'none', border: '1px solid var(--accent-red)'}}
              >
                🎲 AI Roadmap
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ChoosePath;
