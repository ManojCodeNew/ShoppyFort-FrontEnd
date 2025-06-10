import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/profile-page.scss';
import sendPostRequestToBackend from '@/components/Request/Post';
const ProfilePage = () => {
  const { user, setUser, token, logout } = useAuth();
  console.log(user);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phoneno: '',
    address: ''
  });

  useEffect(() => {
        console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        phoneno: user.phoneno || '',
        address: user.address || ''
      });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }
  const isInComplete = !user.phoneno || !user.address;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleCompleteProfile = async () => {
    const response = await sendPostRequestToBackend('auth/complete-profile', formData, token);
    if (response.success) {
      setUser(response.user); // Update AuthContext
      setEditing(false);
    }
  };


  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card">
          <h1>My Profile</h1>
          <div className="profile-info">
            <div className="info-group">
              <label>Full Name</label>
              <p>{user.fullname}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            {editing ? (<>
              <div className="info-group">
                <label>Phone</label>
                <input name="phoneno" value={formData.phoneno} onChange={handleChange} className='phoneno-input' />
              </div>
              <div className="info-group">
                <label>Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className='address-input' />
              </div>
              <button className="btn-primary" onClick={handleCompleteProfile}>Save</button>

            </>) : (
              <>
                {user.phoneno && (
                  <div className="info-group">
                    <label>Phone</label>
                    <p>{user.phoneno}</p>
                  </div>
                )}
                {user.address && (
                  <div className="info-group">
                    <label>Address</label>
                    <p>{user.address}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="profile-actions">
            {isInComplete && !editing && (
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Complete Profile
              </button>
            )}
            {!isInComplete && (
              <>
                <p className="logout" onClick={logout}>Logout</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;