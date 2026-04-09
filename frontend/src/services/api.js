import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:3000/api');

export const analyzeVideo = async (topic, youtubeUrl = null, transcript = null, goalId = null) => {
    const response = await axios.post(`${API_URL}/analyze`, { topic, youtubeUrl, transcript, goalId });
    return response.data;
};

export const getRoadmap = async (goal, skillLevel = "Beginner", time = null) => {
    const response = await axios.post(`${API_URL}/roadmap`, { goal, skillLevel, time });
    return response.data;
};

export const getRecommendations = async () => {
    const response = await axios.get(`${API_URL}/recommend`);
    return response.data;
};

export const generateTest = async (currentConcept, goalId = null) => {
    const response = await axios.post(`${API_URL}/test`, { currentConcept, goalId });
    return response.data;
};

export const getFlashcards = async (goalId = null) => {
    const params = goalId ? { goalId } : {};
    const response = await axios.get(`${API_URL}/flashcards`, { params });
    return response.data;
};

export const getPlaylistVideos = async (playlistUrl) => {
    const response = await axios.post(`${API_URL}/playlist`, { playlistUrl });
    return response.data;
};
