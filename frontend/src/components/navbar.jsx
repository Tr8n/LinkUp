import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/signup');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-title">LinkUp</h1>
        </div>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <button
                onClick={() => navigate('/')}
                className="navbar-link"
              >
                Main
              </button>
              <div className="navbar-dropdown">
                <button className="navbar-link">
                  Profile
                </button>
                <div className="navbar-dropdown-content">
                  <div className="profile-info">
                    <p className="profile-name">{user.username}</p>
                    <p className="profile-email">{user.email}</p>
                    <p className="profile-uid">UID: {user.id}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/signup')}
              className="navbar-link"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
