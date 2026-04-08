import { createContext, useState, useContext, useEffect } from 'react';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [xp, setXp] = useState(() => {
    const stored = localStorage.getItem('career_forge_xp');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [level, setLevel] = useState(() => {
    const stored = localStorage.getItem('career_forge_level');
    return stored ? parseInt(stored, 10) : 1;
  });
  const [currentGoal, setCurrentGoal] = useState(() => localStorage.getItem('career_forge_goal') || null);
  const [completedNodes, setCompletedNodes] = useState(() => {
     const stored = localStorage.getItem('career_forge_completed');
     return stored ? JSON.parse(stored) : [];
  });
  const [totalNodes, setTotalNodes] = useState(() => {
     const stored = localStorage.getItem('career_forge_total_nodes');
     return stored ? parseInt(stored, 10) : 0;
  });
  // Track per-node XP earned: { [nodeId]: xpAmount }
  const [nodeXpMap, setNodeXpMap] = useState(() => {
     const stored = localStorage.getItem('career_forge_node_xp');
     return stored ? JSON.parse(stored) : {};
  });
  // Store playlist URL and videos [{title, url, videoId}]
  const [playlistUrl, setPlaylistUrl] = useState(() => localStorage.getItem('career_forge_playlist') || null);
  const [playlistVideos, setPlaylistVideos] = useState(() => {
     const stored = localStorage.getItem('career_forge_playlist_videos');
     return stored ? JSON.parse(stored) : [];
  });
  
  // Persist everything to localStorage
  useEffect(() => {
     if (currentGoal) localStorage.setItem('career_forge_goal', currentGoal);
     if (playlistUrl) localStorage.setItem('career_forge_playlist', playlistUrl);
     localStorage.setItem('career_forge_completed', JSON.stringify(completedNodes));
     localStorage.setItem('career_forge_xp', String(xp));
     localStorage.setItem('career_forge_level', String(level));
     localStorage.setItem('career_forge_total_nodes', String(totalNodes));
     localStorage.setItem('career_forge_node_xp', JSON.stringify(nodeXpMap));
     localStorage.setItem('career_forge_playlist_videos', JSON.stringify(playlistVideos));
  }, [currentGoal, completedNodes, xp, level, totalNodes, nodeXpMap, playlistUrl, playlistVideos]);

  const addXp = (amount) => {
    setXp(prev => {
        const newXp = prev + amount;
        if (newXp >= level * 1000) {
            setLevel(l => l + 1);
        }
        return newXp;
    });
  };

  const markNodeComplete = (nodeId, xpAmount = 200) => {
      if (!completedNodes.includes(nodeId)) {
          setCompletedNodes(prev => [...prev, nodeId]);
          setNodeXpMap(prev => ({ ...prev, [nodeId]: xpAmount }));
          addXp(xpAmount);
      }
  };

  // Called by SkillMap when it loads a roadmap — to know total nodes count for % calc
  const setRoadmapTotal = (count) => {
      setTotalNodes(count);
      localStorage.setItem('career_forge_total_nodes', String(count));
  };

  // Derived live stats (no fake numbers)
  const lessonsCompleted = completedNodes.length;
  const overallProgress = totalNodes > 0
      ? Math.round((lessonsCompleted / totalNodes) * 100)
      : 0;
  const nextNode = null; // Will be resolved by SkillMap and passed through navigation state if needed

  return (
    <ProgressContext.Provider value={{ 
        xp, level, currentGoal, setCurrentGoal,
        completedNodes, markNodeComplete,
        totalNodes, setRoadmapTotal,
        nodeXpMap,
        lessonsCompleted,
        overallProgress,
        playlistUrl, setPlaylistUrl,
        playlistVideos, setPlaylistVideos,
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
