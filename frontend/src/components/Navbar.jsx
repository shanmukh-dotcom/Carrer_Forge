import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="career-forge-nav">
            <div className="nav-brand">CAREER_FORGE</div>
            <ul className="nav-links">
                <li>
                    <Link to="/skill-map" className={location.pathname === '/skill-map' ? 'active' : ''}>
                        <span className="nav-icon">🗺️</span> Skill Map
                    </Link>
                </li>
                <li>
                    <Link to="/train" className={location.pathname === '/train' ? 'active' : ''}>
                        <span className="nav-icon">⚔️</span> Train
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                        <span className="nav-icon">📊</span> Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                        <span className="nav-icon">👤</span> Profile
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
