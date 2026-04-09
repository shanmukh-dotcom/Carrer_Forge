import * as aiService from '../services/ai.service.js';
import * as memoryService from '../services/memory.service.js';
import { YoutubeTranscript } from 'youtube-transcript';
import { transcribeYouTubeUrl } from '../services/transcription.service.js';

export const analyzeContent = async (req, res) => {
  try {
    const { transcript, youtubeUrl, topic, goalId } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    let finalTranscript = transcript;

    if (youtubeUrl) {
       // 1. Try Deepgram first — high accuracy audio transcription
       let ytTranscriptError = null;
       if (process.env.DEEPGRAM_API_KEY) {
           console.log('[Controller] Attempting Deepgram transcription...');
           try {
               finalTranscript = await transcribeYouTubeUrl(youtubeUrl);
           } catch (err) {
               console.error('[Controller] Deepgram/yt-dlp failed:', err);
               ytTranscriptError = `Engine Error: ${err.message || String(err)}`;
           }
       }

       // 2. Fall back to youtube-transcript (auto-captions) if Deepgram fails
       if (!finalTranscript) {
           console.log('[Controller] Falling back to youtube-transcript...');
           try {
               const transcriptList = await YoutubeTranscript.fetchTranscript(youtubeUrl);
               finalTranscript = transcriptList.map(t => t.text).join(' ');
           } catch (err) {
               return res.status(400).json({ 
                   error: `Could not fetch transcript. Make sure captions are enabled. [Internal Details]: ${ytTranscriptError || err.message}` 
               });
           }
       }
    }

    if (!finalTranscript) {
        return res.status(400).json({ error: 'Either transcript or youtubeUrl is required' });
    }

    // Only look at concepts from the SAME goal for memory connections
    const pastConcepts = await memoryService.getAllDetailedConcepts(goalId);
    const aiOutput = await aiService.processTranscript(finalTranscript, pastConcepts, topic, goalId);
    
    // Store tagged with goalId so it never bleeds into other goals
    if (aiOutput) {
       await memoryService.storeConcept(topic, aiOutput.summary, aiOutput.keywords, [], goalId);
       return res.status(200).json({
          status: 'success',
          data: aiOutput,
          message: 'Content analyzed and added to Concept Memory.'
       });
    } else {
        throw new Error('AI failed to process content');
    }

  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

export const generateCustomRoadmap = async (req, res) => {
  try {
     const { goal, skillLevel, time } = req.body;
     if (!goal || !skillLevel) {
        return res.status(400).json({ error: 'Goal and skillLevel are required' });
     }

     const roadmap = await aiService.generateRoadmap(goal, skillLevel, time);
     
     // Update user goal context
     await memoryService.updateUserProgress(null, null, goal);

     return res.status(200).json({
         status: 'success',
         data: roadmap
     });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
     const progress = await memoryService.getUserProgress();
     const recommendations = await aiService.generateRecommendations(
         progress?.currentGoal || 'Learner',
         progress?.completedConcepts || [],
         progress?.weakAreas || []
     );

     return res.status(200).json({
         status: 'success',
         data: recommendations
     });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

export const takeTest = async (req, res) => {
  try {
     const { currentConcept, goalId } = req.body;
     if (!currentConcept) {
        return res.status(400).json({ error: 'currentConcept is required' });
     }

     // Only test on concepts from THIS goal
     const allPriorConcepts = await memoryService.getAllConcepts(goalId);
     const previousConcepts = allPriorConcepts.filter(c => c !== currentConcept);

     const test = await aiService.generateTest(currentConcept, previousConcepts);

     return res.status(200).json({
         status: 'success',
         data: test
     });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

export const getFlashcards = async (req, res) => {
  try {
     // Accept goalId as a query param e.g. /api/flashcards?goalId=Trading
     const { goalId } = req.query;
     const concepts = await memoryService.getAllDetailedConcepts(goalId);
     
     const flashcards = [];
     concepts.forEach(c => {
         c.summary.forEach((point, idx) => {
             flashcards.push({
                 id: `${c.topic}-${idx}`,
                 topic: c.topic,
                 front: point,
                 back: `This is a core mechanic of ${c.topic}. Try recalling related keywords: ${c.keywords ? c.keywords.join(', ') : 'None'}`
             });
         });
     });

     return res.status(200).json({
         status: 'success',
         data: flashcards
     });
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

export const getPlaylistVideos = async (req, res) => {
  try {
    const { playlistUrl } = req.body;
    if (!playlistUrl) {
      return res.status(400).json({ error: 'playlistUrl is required' });
    }

    const listMatch = playlistUrl.match(/[?&]list=([^#&?]+)/);
    if (!listMatch) {
      return res.status(400).json({ error: 'Could not extract playlist ID from URL' });
    }
    const playlistId = listMatch[1];

    const response = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await response.text();

    const match = html.match(/var ytInitialData = ({.+?});<\/script>/s);
    if (!match) {
      return res.status(500).json({ error: 'Could not parse YouTube playlist data' });
    }

    const data = JSON.parse(match[1]);
    const contents = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
      ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
      ?.itemSectionRenderer?.contents?.[0]
      ?.playlistVideoListRenderer?.contents;

    if (!contents) {
      return res.status(500).json({ error: 'Could not find playlist video content' });
    }

    const videos = contents
      .filter(c => c.playlistVideoRenderer)
      .map(c => {
        const v = c.playlistVideoRenderer;
        const videoId = v.videoId;
        const title = v.title?.runs?.[0]?.text || `Video ${videoId}`;
        return {
          videoId,
          title,
          url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}?list=${playlistId}`
        };
      });

    return res.status(200).json({ status: 'success', data: videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
