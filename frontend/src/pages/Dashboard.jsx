import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import Navbar from '../components/Navbar';
import { Zap, Target, BookOpen, TrendingUp, AlertTriangle, ArrowRight, Swords } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { 
        xp, level, currentGoal,
        completedNodes, totalNodes,
        nodeXpMap, lessonsCompleted, overallProgress
    } = useProgress();
    const navigate = useNavigate();

    const calculateRank = (lvl) => {
        if (lvl === 1) return "Beginner";
        if (lvl === 2) return "Apprentice";
        if (lvl === 3) return "Warrior";
        return "Master";
    };

    // Next topic: first node not yet completed (sorted by position in nodeXpMap keys in future, for now just filter)
    const nextTopic = null; // Will rely on SkillMap's bottom panel for suggestion

    // Accuracy: simple ratio of completed to total if we have data, else 0
    const accuracy = totalNodes > 0 && lessonsCompleted > 0
        ? Math.round((lessonsCompleted / totalNodes) * 100)
        : 0;

    const hasData = lessonsCompleted > 0;

    return (
        <div className="new-dashboard-layout">
            <Navbar />
            
            <div className="dashboard-content container">
                <header className="progress-header animate-fade-in">
                    <p className="subtitle accent-gold" style={{letterSpacing: '2px'}}>DASHBOARD</p>
                    <h1 className="main-title">Your <span className="accent-red">Training</span> Progress</h1>
                </header>

                {/* Top Stat Cards — all live from ProgressContext */}
                <div className="stats-grid animate-fade-in" style={{animationDelay: '0.1s'}}>
                    <div className="stat-card">
                        <Zap className="stat-icon accent-gold" size={24} />
                        <h2>{xp}</h2>
                        <p>Total XP</p>
                    </div>
                    <div className="stat-card">
                        <Target className="stat-icon accent-red" size={24} />
                        <h2>{accuracy}%</h2>
                        <p>Completion Rate</p>
                    </div>
                    <div className="stat-card">
                        <BookOpen className="stat-icon accent-gold" size={24} />
                        <h2>{lessonsCompleted}</h2>
                        <p>Lessons Done</p>
                    </div>
                    <div className="stat-card">
                        <TrendingUp className="stat-icon accent-red" size={24} />
                        <h2>{calculateRank(level)}</h2>
                        <p>Current Rank</p>
                    </div>
                </div>

                <div className="bento-grid animate-fade-up" style={{animationDelay: '0.2s'}}>
                    {/* Left Panel - Path Progress */}
                    <div className="bento-panel path-panel">
                        <h3>Path to {currentGoal || 'your goal'}</h3>
                        
                        <div className="overall-bar-container">
                            <div className="bar-labels">
                                <span>Overall Progress</span>
                                <span className="accent-gold">{overallProgress}%</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{width: `${overallProgress}%`}}></div>
                            </div>
                            <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-1rem'}}>
                                {lessonsCompleted} of {totalNodes || '?'} techniques completed
                            </p>
                        </div>

                        <div className="completed-list">
                            <p className="list-title">Completed Techniques</p>
                            
                            {!hasData ? (
                                <div className="empty-state">
                                    <p>No techniques completed yet.</p>
                                    <button className="text-link accent-red" style={{marginTop: '0.5rem'}} onClick={() => navigate('/skill-map')}>
                                        Start your journey →
                                    </button>
                                </div>
                            ) : (
                                completedNodes.map((node, i) => (
                                    <div key={i} className="completed-item">
                                        <div className="comp-info">
                                            <h4>{node}</h4>
                                        </div>
                                        <span className="comp-xp accent-gold">
                                            <Zap size={14}/> {nodeXpMap[node] || 200} XP
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <button className="text-link accent-red" onClick={() => navigate('/skill-map')}>
                            View Skill Map &gt;
                        </button>
                    </div>

                    {/* Right Panels */}
                    <div className="side-panels">
                        {/* Progress Breakdown */}
                        <div className="bento-panel weak-areas">
                            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <TrendingUp className="accent-gold" size={20}/> Level Progress
                            </h3>
                            
                            <div className="weak-item">
                                <div className="bar-labels">
                                    <span>Level {level} → Level {level + 1}</span>
                                    <span className="accent-gold">{xp} / {level * 1000} XP</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{width: `${Math.min(100, (xp / (level * 1000)) * 100)}%`}}></div>
                                </div>
                            </div>

                            <div className="weak-item" style={{marginTop: '1rem'}}>
                                <div className="bar-labels">
                                    <span>Path Completion</span>
                                    <span className="accent-gold">{overallProgress}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{width: `${overallProgress}%`}}></div>
                                </div>
                            </div>

                            <div style={{marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                                <p>{lessonsCompleted} technique{lessonsCompleted !== 1 ? 's' : ''} mastered</p>
                                <p>{totalNodes > 0 ? totalNodes - lessonsCompleted : '?'} remaining on your path</p>
                            </div>
                        </div>

                        {/* CTA Panel */}
                        <div className="bento-panel suggestion-panel">
                            <p className="subtitle">Continue Your Journey</p>
                            {hasData ? (
                                <>
                                    <h3 className="accent-red" style={{marginBottom: '0.5rem', fontSize:'1.2rem'}}>
                                        Last completed: {completedNodes[completedNodes.length - 1]}
                                    </h3>
                                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
                                        Keep going — you're {overallProgress}% there!
                                    </p>
                                </>
                            ) : (
                                <h3 className="accent-red" style={{marginBottom: '1.5rem', fontSize:'1.2rem'}}>
                                    Your journey awaits
                                </h3>
                            )}
                            {/* Two compact utility buttons */}
                            <div style={{display: 'flex', gap: '0.75rem', marginBottom: '0.75rem'}}>
                                <button className="dash-action-btn" onClick={() => navigate('/skill-map')}>
                                    <ArrowRight size={15}/> Skill Map
                                </button>
                                <button className="dash-action-btn" onClick={() => navigate('/flashcards')}>
                                    <BookOpen size={15}/> Flashcards
                                </button>
                            </div>
                            {/* Boss Duel — the main CTA */}
                            <button className="boss-duel-btn" onClick={() => navigate('/duel')}>
                                <Swords size={20}/>
                                <span>Boss Duel</span>
                                <span className="boss-duel-sub">⚡ Final Challenge</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
