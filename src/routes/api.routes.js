import express from 'express';
import {
  analyzeContent,
  generateCustomRoadmap,
  getRecommendations,
  takeTest,
  getFlashcards,
  getPlaylistVideos
} from '../controllers/learning.controller.js';

const router = express.Router();

router.post('/analyze', analyzeContent);
router.post('/roadmap', generateCustomRoadmap);
router.get('/recommend', getRecommendations);
router.post('/test', takeTest);
router.get('/flashcards', getFlashcards);
router.post('/playlist', getPlaylistVideos);

export default router;
