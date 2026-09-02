import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, LogOut, KeyRound, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'System Admin';
      case 'STORE_OWNER':
        return 'Store Owner';
      case 'NORMAL_USER':
        return 'User';
      default:
        return role;
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Store size={20} />
          </div>
          <span>StoreRatings</span>
        </Link>

        {user && (
          <div className="nav-user-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={16} className="text-secondary" />
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.name}</span>
              <span className={`user-badge ${user.role.toLowerCase()}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <Link to="/change-password" className="nav-link" title="Change Password">
              <KeyRound size={18} />
            </Link>

            <button onClick={handleLogout} className="btn-logout" title="Log out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
