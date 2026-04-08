import Navbar from '../components/Navbar';
import { useProgress } from '../context/ProgressContext';
import { User, Zap, Target, BookOpen, Swords, Shield, Sword, Trophy, Check } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { xp, level, completedNodes } = useProgress();

    // Mock progress data
    const accuracy = 78;
    const lessons = 12;

    const ranks = [
        { name: "Beginner", xpReq: 0 },
        { name: "Apprentice", xpReq: 200 },
        { name: "Warrior", xpReq: 600 },
        { name: "Master", xpReq: 1200 }
    ];

    const currentRank = level === 1 ? "Beginner" : level === 2 ? "Apprentice" : level === 3 ? "Warrior" : "Master";

    return (
        <div className="new-dashboard-layout">
            <Navbar />
            
            <div className="profile-container container">
                
                {/* Header User Card */}
                <div className="profile-header-card animate-fade-in">
                    <div className="avatar-ring">
                        <User size={40} color="#d32f2f" />
                    </div>
                    
                    <h1 className="user-name">Wandering Learner</h1>
                    <p className="user-rank accent-gold">{currentRank.toUpperCase()}</p>

                    <div className="user-stats-row">
                        <div className="stat-item">
                            <Zap size={20} className="accent-gold"/>
                            <span className="stat-val accent-gold">{xp}</span>
                            <span className="stat-label">Total XP</span>
                        </div>
                        <div className="stat-item">
                            <Target size={20} className="accent-red"/>
                            <span className="stat-val accent-red">{accuracy}%</span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                        <div className="stat-item">
                            <BookOpen size={20} className="accent-gold"/>
                            <span className="stat-val accent-gold">{lessons}</span>
                            <span className="stat-label">Lessons</span>
                        </div>
                    </div>
                </div>

                {/* Profile Grid */}
                <div className="profile-grid animate-fade-up" style={{animationDelay: '0.2s'}}>
                    
                    {/* Mastered Techniques */}
                    <div className="bento-panel">
                        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
                            <Swords className="accent-red" size={24}/> Mastered Techniques
                        </h3>

                        <div className="technique-list">
                            <div className="tech-item">
                                <div className="tech-left">
                                    <Swords className="tech-icon" size={24} />
                                    <div className="tech-details">
                                        <h4>HTML</h4>
                                        <span className="accent-gold">Mastered</span>
                                    </div>
                                </div>
                                <div className="tech-xp accent-gold"><Zap size={14}/> 150</div>
                            </div>

                            <div className="tech-item">
                                <div className="tech-left">
                                    <Shield className="tech-icon blue-icon" size={24} color="#2196f3" />
                                    <div className="tech-details">
                                        <h4>CSS</h4>
                                        <span className="accent-gold">Mastered</span>
                                    </div>
                                </div>
                                <div className="tech-xp accent-gold"><Zap size={14}/> 200</div>
                            </div>

                            <div className="tech-item">
                                <div className="tech-left">
                                    <Sword className="tech-icon" size={24} />
                                    <div className="tech-details">
                                        <h4>Flexbox</h4>
                                        <span className="accent-red">Training</span>
                                    </div>
                                </div>
                                <div className="tech-xp accent-gold"><Zap size={14}/> 120</div>
                            </div>
                        </div>
                    </div>

                    {/* Rank Progression */}
                    <div className="bento-panel">
                        <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem'}}>
                            <Shield className="accent-gold" size={24}/> Rank Progression
                        </h3>

                        <div className="rank-list">
                            {ranks.map((r, i) => {
                                const isAchieved = xp >= r.xpReq;
                                const isCurrent = xp >= r.xpReq && (i === ranks.length - 1 || xp < ranks[i+1].xpReq);
                                
                                return (
                                    <div key={i} className={`rank-item ${isAchieved ? '' : 'locked'}`}>
                                        <div className={`rank-icon-wrapper ${isAchieved ? 'gold-border' : ''}`}>
                                            <Trophy size={20} color={isAchieved ? '#cba052' : '#555'} />
                                        </div>
                                        <div className="rank-details">
                                            <h4>{r.name}</h4>
                                            <span>{r.xpReq} XP required</span>
                                        </div>
                                        {isAchieved && <Check className="accent-gold check-icon" size={20} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
