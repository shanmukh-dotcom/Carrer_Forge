import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { getFlashcards } from '../services/api';
import Navbar from '../components/Navbar';
import { Loader2, ArrowLeft, ArrowRight, RotateCw, BrainCircuit } from 'lucide-react';
import './Flashcards.css';

const Flashcards = () => {
    const navigate = useNavigate();
    const { currentGoal } = useProgress();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const loadCards = async () => {
            try {
                const res = await getFlashcards(currentGoal);
                if (res && res.data && res.data.length > 0) {
                    setCards(res.data);
                } else {
                    // Fallback if DB is empty
                    setCards([
                        { front: "HTML Structure", back: "The foundation of all web pages. Focus on semantic elements.", topic: "Fundamentals" },
                        { front: "CSS Flexbox", back: "Used for 1-dimensional layouts (rows or columns).", topic: "Styling" }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load flashcards", err);
                setCards([
                    { front: "Syntax Syntax", back: "Sometimes the API fails, this is a fallback card.", topic: "System Rules" },
                    { front: "Error Logging", back: "Check the console to see why the API failed.", topic: "Debugging" }
                ]);
            } finally {
                setLoading(false);
            }
        };
        loadCards();
    }, []);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(i => (i + 1) % cards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(i => (i - 1 + cards.length) % cards.length);
        }, 150);
    };

    if (loading) {
        return (
            <div className="new-dashboard-layout dash-bg-img">
                <div className="duel-overlay"></div>
                <div style={{height: '100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <Loader2 size={40} className="spinner accent-gold" />
                </div>
            </div>
        );
    }

    if (!cards || cards.length === 0) {
        return (
            <div className="new-dashboard-layout dash-bg-img">
                <div className="duel-overlay"></div>
                <Navbar />
                <div style={{height: '80vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <h2 className="accent-red">No Flashcards Available</h2>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="new-dashboard-layout dash-bg-img">
            <div className="duel-overlay"></div>
            <Navbar />
            
            <div className="flashcards-container container animate-fade-up">
                
                <header className="fc-header">
                    <p className="subtitle accent-gold">MEMORY BANK</p>
                    <h1 className="main-title">Review <span className="accent-red">Flashcards</span></h1>
                    <p className="path-desc">Flip cards to review concepts stored deeply in your MongoDB Atlas vault before taking on the Boss Duel.</p>
                </header>

                <div className="card-viewer">
                    <div className="card-counter">
                        <BrainCircuit size={18} className="accent-red"/> 
                        Card {currentIndex + 1} of {cards.length}
                        <span className="card-topic-chip">{currentCard.topic}</span>
                    </div>

                    <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                        <div className="flip-card-inner">
                            <div className="flip-card-front">
                                <h3>{currentCard.front}</h3>
                                <div className="flip-hint">
                                    <RotateCw size={16}/> Click to reveal deeper concepts
                                </div>
                            </div>
                            <div className="flip-card-back">
                                <p>{currentCard.back}</p>
                            </div>
                        </div>
                    </div>

                    <div className="fc-controls">
                        <button className="outline-btn fc-nav-btn" onClick={handlePrev}>
                            <ArrowLeft size={20}/> Prev
                        </button>
                        <button className="primary-btn fc-nav-btn" onClick={handleNext}>
                            Next <ArrowRight size={20}/>
                        </button>
                    </div>
                </div>

                <div style={{marginTop: '4rem', textAlign: 'center'}}>
                    <button className="text-link" style={{fontSize: '1.1rem'}} onClick={() => navigate('/duel')}>
                        Ready? Enter the Boss Duel ⚔️
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default Flashcards;
