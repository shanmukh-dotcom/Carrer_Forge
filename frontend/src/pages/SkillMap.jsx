import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { getRoadmap } from '../services/api';
import Navbar from '../components/Navbar';
import { Loader2, Lock, CheckCircle2, Play } from 'lucide-react';
import './SkillMap.css';

const SkillMap = () => {
    const { currentGoal, completedNodes, setRoadmapTotal, playlistVideos } = useProgress();
    const navigate = useNavigate();
    
    const [roadmap, setRoadmap] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentGoal) {
            navigate('/choose-path');
            return;
        }

        // If user uploaded a playlist, build skill map from video titles
        if (playlistVideos && playlistVideos.length > 0) {
            const rm = [{ topics: playlistVideos.map(v => v.title) }];
            setRoadmap(rm);
            setRoadmapTotal(playlistVideos.length);
            setLoading(false);
            return;
        }

        // Otherwise fall back to AI-generated roadmap
        const fetchDashboardData = async () => {
            try {
                const treeData = await getRoadmap(currentGoal);
                if (treeData && treeData.data && treeData.data.roadmap) {
                     const rm = treeData.data.roadmap;
                     setRoadmap(rm);
                     setRoadmapTotal(rm.flatMap(s => s.topics).length);
                } else {
                     throw new Error("Invalid API Data Format");
                }
            } catch (err) {
                console.warn("AI Engine fallback triggered.");
                let mockRoadmap = [];
                const goalLower = currentGoal.toLowerCase();
                
                if (goalLower.includes('backend') || goalLower.includes('engineer')) {
                    mockRoadmap = [{topics: ["Node.js Server", "Express Setup", "Routing", "REST APIs", "Middleware", "MongoDB", "PostgreSQL", "System Architecture"]}];
                } else if (goalLower.includes('cyber') || goalLower.includes('security')) {
                    mockRoadmap = [{topics: ["Network Basics", "OSI Model", "Kali Linux", "Cryptography", "Penetration Testing", "Web Exploits", "Zero Trust Design"]}];
                } else if (goalLower.includes('ai') || goalLower.includes('machine')) {
                    mockRoadmap = [{topics: ["Python Syntax", "Numpy & Pandas", "Data Prep", "Scikit-Learn", "Neural Networks", "PyTorch", "RAG Systems"]}];
                } else if (goalLower.includes('ui') || goalLower.includes('ux') || goalLower.includes('design')) {
                    mockRoadmap = [{topics: ["Color Theory", "Typography", "Spacing", "Figma Setup", "Wireframing", "Prototyping", "Design Systems"]}];
                } else if (goalLower.includes('mobile') || goalLower.includes('app')) {
                    mockRoadmap = [{topics: ["React Native", "Expo Setup", "Mobile UI", "App Navigation", "State", "Native Modules", "App Store Deploy"]}];
                } else {
                    const goalName = currentGoal.split(' ')[0];
                    mockRoadmap = [{topics: [
                        `${goalName} 101`, 
                        `Core Mechanics of ${goalName}`, 
                        "Industry Tools", 
                        `Advanced ${goalName} Patterns`, 
                        "Final Mastery Project"
                    ]}];
                }
                setRoadmap(mockRoadmap);
                setRoadmapTotal(mockRoadmap.flatMap(s => s.topics).length);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentGoal, navigate, playlistVideos]);

    if (loading) {
        return (
            <div className="dashboard-loading dash-bg-img">
                <Loader2 className="spinner" size={48} color="#d32f2f" />
                <p>Consulting the AI Engine. Forging your path to {currentGoal}...</p>
            </div>
        );
    }

    // Flatten topics to a single array for the constellation map
    const allTopics = roadmap.flatMap(stage => stage.topics);
    
    // Build a lookup of topic title → video object (if playlist mode)
    const videoByTitle = {};
    if (playlistVideos && playlistVideos.length > 0) {
        playlistVideos.forEach(v => { videoByTitle[v.title] = v; });
    }
    
    let currentTopicIndex = allTopics.findIndex(t => !completedNodes.includes(t));
    if (currentTopicIndex === -1 && allTopics.length > 0) currentTopicIndex = allTopics.length - 1;
    const currentTopic = allTopics[currentTopicIndex];
    
    const percentComplete = allTopics.length === 0 ? 0 : Math.round((completedNodes.length / allTopics.length) * 100);
    const remaining = allTopics.length - completedNodes.length;

    const handleNodeClick = (topic, isUnlocked) => {
        if (!isUnlocked) return;
        
        // If we have a playlist video for this topic, pass its URL directly to Train
        const video = videoByTitle[topic];
        if (video) {
            navigate(`/train?topic=${encodeURIComponent(topic)}&videoUrl=${encodeURIComponent(video.url)}`);
        } else {
            navigate(`/train?topic=${encodeURIComponent(topic)}`);
        }
    };

    return (
       <div className="dashboard-layout dash-bg-img">
           <div className="dash-overlay"></div>
           
           <Navbar />
           
           <div className="map-container">
               <header className="map-header animate-fade-in">
                   <p className="subtitle accent-gold" style={{letterSpacing: '3px', textTransform: 'uppercase'}}>{currentGoal}</p>
                   <h1 className="main-title">The <span className="accent-red">Warrior's</span> Map</h1>
                   
                   {playlistVideos && playlistVideos.length > 0 && (
                       <p className="subtitle" style={{fontSize: '0.9rem', marginTop: '-0.5rem'}}>
                           🎬 Playlist Mode — {playlistVideos.length} videos mapped
                       </p>
                   )}
                   
                   <div className="legend">
                       <span className="legend-item"><div className="dot mastered"></div> Mastered</span>
                       <span className="legend-item"><div className="dot current"></div> Current</span>
                       <span className="legend-item"><div className="dot locked"></div> Locked</span>
                   </div>
               </header>

               <section className="constellation-tree animate-fade-in" style={{animationDelay: '0.2s'}}>
                  {allTopics.map((topic, idx) => {
                      const isCompleted = completedNodes.includes(topic);
                      const isCurrent = idx === currentTopicIndex;
                      const isLocked = !isCompleted && !isCurrent;
                      
                      const sideClass = idx % 2 === 0 ? 'node-left' : 'node-right';
                      
                      let lineClass = 'line-future';
                      if(isCompleted && idx < currentTopicIndex) lineClass = 'line-mastered';
                      
                      return (
                          <div key={idx} className={`map-node-wrapper ${sideClass}`}>
                              <div 
                                className={`map-node ${isCompleted ? 'mastered' : isCurrent ? 'current' : 'locked'}`}
                                onClick={() => handleNodeClick(topic, !isLocked)}
                              >
                                  {isCompleted && <CheckCircle2 size={24} />}
                                  {isCurrent && <Play size={24} fill="currentColor" className="play-icon" />}
                                  {isLocked && <Lock size={20} />}
                              </div>
                              <span className="node-label">{topic}</span>
                              
                              {idx < allTopics.length - 1 && (
                                 <div className={`connector ${lineClass}`}></div>
                              )}
                          </div>
                      );
                  })}
               </section>
           </div>
       </div>
    );
};

export default SkillMap;
