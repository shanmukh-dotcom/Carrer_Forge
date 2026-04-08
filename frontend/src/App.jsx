import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import Landing from './pages/Landing';
import ChoosePath from './pages/ChoosePath';
import SkillMap from './pages/SkillMap';
import Dashboard from './pages/Dashboard';
import Train from './pages/Train';
import Profile from './pages/Profile';
import Completion from './pages/Completion';
import Duel from './pages/Duel';
import Flashcards from './pages/Flashcards';

function App() {
  return (
    <ProgressProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/choose-path" element={<ChoosePath />} />
          <Route path="/skill-map" element={<SkillMap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/train" element={<Train />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/completion" element={<Completion />} />
          <Route path="/duel" element={<Duel />} />
          <Route path="/flashcards" element={<Flashcards />} />
        </Routes>
      </Router>
    </ProgressProvider>
  );
}

export default App;
