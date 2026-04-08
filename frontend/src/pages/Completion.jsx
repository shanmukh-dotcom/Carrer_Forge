import { useNavigate } from 'react-router-dom';
import { Trophy, Zap, Star, Shield } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import './Completion.css';

const Completion = () => {
    const navigate = useNavigate();
    const { xp, level } = useProgress();

    // Mock calculations based on screenshot
    const xpEarned = 125;
    const accuracy = 87;
    const currentRank = level === 1 ? "Beginner" : level === 2 ? "Apprentice" : level === 3 ? "Warrior" : "Master";
    const nextLevelXp = level * 1000;
    const currentXp = xp; // Assuming xp is already updated
    
    // Hardcoded next technique based on screenshot MVP
    const nextTechnique = "Grid Mastery";

    return (
        <div className="completion-layout">
            <div className="completion-container container animate-fade-up">
                
                <div className="trophy-glow-wrapper">
                    <Trophy size={50} color="#cba052" />
                </div>

                <h1 className="mastered-title">Technique <span className="accent-red">Mastered</span></h1>
                <p className="mastered-subtitle text-secondary">Flexbox Form &mdash; Complete</p>

                <div className="completion-stats-grid">
                    <div className="comp-stat-card">
                        <Zap size={24} className="accent-gold"/>
                        <h2 className="accent-gold">{xpEarned}</h2>
                        <span className="stat-label">XP Earned</span>
                    </div>
                    
                    <div className="comp-stat-card">
                        <Star size={24} className="accent-red"/>
                        <h2 className="accent-red">{accuracy}%</h2>
                        <span className="stat-label">Accuracy</span>
                    </div>
                    
                    <div className="comp-stat-card">
                        <Shield size={24} className="accent-gold"/>
                        <h2 className="accent-gold">{currentRank}</h2>
                        <span className="stat-label">Rank</span>
                    </div>
                </div>

                <div className="level-progress-section">
                    <div className="level-labels">
                        <span>Level {level}</span>
                        <span className="accent-gold">Level {level + 1}</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{width: `${(currentXp / nextLevelXp) * 100}%`}}></div>
                    </div>
                    <p className="xp-details">{currentXp} / {nextLevelXp} XP to next level</p>
                </div>

                <div className="next-unlock-card">
                    <span className="stat-label">Next Technique Unlocked</span>
                    <h3 className="accent-red">{nextTechnique}</h3>
                </div>

                <div className="completion-actions">
                    <button className="primary-btn" onClick={() => navigate('/skill-map')}>
                        Continue Journey <span style={{marginLeft: '0.4rem'}}>&gt;</span>
                    </button>
                    <button className="outline-btn" style={{border: 'none'}} onClick={() => navigate('/dashboard')}>
                        View Dashboard
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Completion;
