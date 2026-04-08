import { Target, BookOpen, Sword, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Background with overlay */}
      <div className="hero-bg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542050893-60fcfba1d48c?q=80&w=2672&auto=format&fit=crop')"}}>
         <div className="hero-overlay"></div>
      </div>

      {/* Hero Section */}
      <main className="hero-content container">
        <div className="hero-text-wrapper animate-fade-in">
          <p className="subtitle">THE WAY OF MASTERY</p>
          <h1 className="main-title">
            Forge Your Path <br/>
            <span className="accent-red">to Mastery</span>
          </h1>
          <p className="description">
            Transform your learning into a warrior's journey. AI-powered skill
            progression, one technique at a time.
          </p>
          <button className="primary-btn" onClick={() => navigate('/choose-path')}>
            Begin Your Journey
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section container">
        <div className="features-header animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2>The <span className="accent-gold">Warrior's</span> Training</h2>
          <div className="red-line"></div>
        </div>

        <div className="features-grid">
          <FeatureCard 
            icon={<Target size={24} color="#d32f2f" strokeWidth={1.5} />}
            title="Choose Your Path"
            description="Select a discipline to master. Every journey begins with intent."
            delay="0.3s"
          />
          <FeatureCard 
            icon={<BookOpen size={24} color="#d32f2f" strokeWidth={1.5} />}
            title="Learn Techniques"
            description="Absorb knowledge through curated video lessons and AI summaries."
            delay="0.4s"
          />
          <FeatureCard 
            icon={<Sword size={24} color="#d32f2f" strokeWidth={1.5} />}
            title="Face Duels"
            description="Test your understanding in focused challenges that sharpen your edge."
            delay="0.5s"
          />
          <FeatureCard 
            icon={<Trophy size={24} color="#d32f2f" strokeWidth={1.5} />}
            title="Earn Your Rank"
            description="Progress from Apprentice to Master as you conquer each level."
            delay="0.6s"
          />
        </div>
      </section>

      {/* Footer Mantra */}
      <section className="footer-mantra-section container animate-fade-in" style={{animationDelay: '0.8s'}}>
          <p className="subtitle">CAREER_FORGE</p>
          <h2 className="mantra-title">Discipline is the <span className="accent-red">sharpest<br/>blade</span></h2>
          <button className="outline-btn" style={{marginTop: '2rem'}} onClick={() => navigate('/choose-path')}>
              Start Training
          </button>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <div className="feature-card animate-fade-in" style={{animationDelay: delay}}>
    <div className="icon-wrapper">
      {icon}
    </div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{description}</p>
  </div>
);

export default Landing;
