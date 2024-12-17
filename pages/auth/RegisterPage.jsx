import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/auth/auth.scss';

const RegisterPage = () => {
 
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneno: '',
    address: '',
    password: '',
    confirmpassword: ''
  });
  const [errors, setErrors] = useState({});
  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();
  // Checking if user is exist or not 
  useEffect(()=>{
    const user=localStorage.getItem('user');
    if (user) {
      navigate('/profile');
    }
  },[])
  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match';
    }
    
    if (formData.phoneno.length !== 10) {
      newErrors.phoneno= 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log("RegisterPage data",formData);
    
    e.preventDefault();
    if (validateForm()) {
      const userRegisterResponse = await register(formData);
      console.log(userRegisterResponse);
      
      if (userRegisterResponse.success) {
        localStorage.setItem('user',userRegisterResponse.token);
        navigate('/profile');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneno"
              value={formData.phoneno}
              onChange={handleChange}
              required
              maxLength="10"
            />
            {errors.phoneno && <span className="error">{errors.phoneno}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmpassword"
              value={formData.confirmpassword}
              onChange={handleChange}
              required
            />
            {errors.confirmpassword && (
              <span className="error">{errors.confirmpassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;