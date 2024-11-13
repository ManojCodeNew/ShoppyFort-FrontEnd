import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/profile-page.scss';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card">
          <h1>My Profile</h1>
          <div className="profile-info">
            <div className="info-group">
              <label>Full Name</label>
              <p>{user.name}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            {user.phone && (
              <div className="info-group">
                <label>Phone</label>
                <p>{user.phone}</p>
              </div>
            )}
            {user.address && (
              <div className="info-group">
                <label>Address</label>
                <p>{user.address}</p>
              </div>
            )}
          </div>
          <div className="profile-actions">
            <button className="btn-primary">Edit Profile</button>
            <button className="btn-secondary">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;