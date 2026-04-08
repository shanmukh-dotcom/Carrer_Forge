import mongoose from 'mongoose';

const ConceptSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  goalId: { type: String, required: true, index: true }, // GOAL ISOLATION KEY
  summary: [String],
  keywords: [String],
  relatedConcepts: [String],
  timestamp: { type: Date, default: Date.now }
});

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user_1' },
  currentGoal: String,
  completedConcepts: [String],
  weakAreas: [String]
});

export const Concept = mongoose.model('Concept', ConceptSchema);
export const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

// Make sure default user exists
const initUser = async () => {
    try {
        const user = await UserProgress.findOne({ userId: 'default_user_1' });
        if (!user) {
            await UserProgress.create({ userId: 'default_user_1', currentGoal: 'Learner', completedConcepts: [], weakAreas: [] });
        }
    } catch (err) {
        console.warn("Could not init default user (DB might be offline)", err.message);
    }
};

initUser();

// --- GOAL-ISOLATED FUNCTIONS ---

export const storeConcept = async (topic, summary, keywords, relatedConcepts, goalId) => {
    try {
        // Use goalId or fallback to 'general'
        await Concept.create({ topic, summary, keywords, relatedConcepts, goalId: goalId || 'general' });
        return true;
    } catch (err) {
        console.error("DB Error storing concept", err);
        return false;
    }
};

export const getAllConcepts = async (goalId) => {
    try {
        const query = goalId ? { goalId } : {};
        const concepts = await Concept.find(query).sort({ timestamp: 1 });
        return concepts.map(c => c.topic);
    } catch (err) {
        return [];
    }
};

export const getAllDetailedConcepts = async (goalId) => {
    try {
        const query = goalId ? { goalId } : {};
        const concepts = await Concept.find(query).sort({ timestamp: 1 });
        return concepts.map(c => ({
            topic: c.topic,
            summary: c.summary,
            keywords: c.keywords
        }));
    } catch (err) {
        return [];
    }
};

export const getUserProgress = async () => {
    try {
        let user = await UserProgress.findOne({ userId: 'default_user_1' });
        return user;
    } catch (err) {
        return { completedConcepts: [], weakAreas: [], currentGoal: '' };
    }
};

export const updateUserProgress = async (completed, weakArea, currentGoal) => {
    try {
        let update = {};
        if (completed) update.$addToSet = { completedConcepts: completed };
        if (weakArea) {
            update.$addToSet = update.$addToSet || {};
            update.$addToSet.weakAreas = weakArea;
        }
        if (currentGoal) update.$set = { currentGoal };

        await UserProgress.findOneAndUpdate({ userId: 'default_user_1' }, update, { new: true, upsert: true });
        return true;
    } catch (err) {
        return false;
    }
};
