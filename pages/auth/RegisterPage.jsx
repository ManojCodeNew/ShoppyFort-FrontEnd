import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    error,
    isLoading,
    isAuthenticated,
    userDataLoaded
  } = useAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   console.log("📄 [RegisterPage] Page Loaded:", window.location.pathname);
  //   console.log("📄 [RegisterPage] Auth state =>", {
  //     isAuthenticated,
  //     userDataLoaded,
  //     isLoading
  //   });
  // }, []);

  useEffect(() => {
    if (isAuthenticated && userDataLoaded) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, userDataLoaded, navigate]);

  useEffect(() => {
    if (isAuthenticated && userDataLoaded && !isLoading) {
      navigate('/profile');
    }
  }, [isAuthenticated, userDataLoaded, isLoading, navigate]);

  // console.log("🔍 Page Loaded:", window.location.pathname);
  // console.log("Auth state => isAuthenticated:", isAuthenticated, "userDataLoaded:", userDataLoaded, "isLoading:", isLoading);

  // Early return after all hooks have been called
  if (!userDataLoaded) {
    return <div className="auth-page"><div className="auth-container">Loading...</div></div>;
  }

  // console.log("Validate");


  // Redirect if already logged in AND user data is loaded
  // useEffect(() => {
  //   // Only redirect if user is authenticated, data is loaded, AND we're not in a loading state
  //   if (isAuthenticated && userDataLoaded && !isLoading) {
  //     console.log('User is authenticated and data is loaded, redirecting to profile');
  //     navigate('/profile');
  //   }
  // }, [isAuthenticated, userDataLoaded, isLoading, navigate]);


  const validateForm = () => {
    const newErrors = {};
    // console.log("Validate");

    // Required field validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    // Optional phone number validation (only if provided)
    if (formData.phoneno.trim() && formData.phoneno.replace(/\D/g, '').length !== 10) {
      newErrors.phoneno = 'Phone number must be exactly 10 digits';
    }

    // Optional address validation (only if provided)
    if (formData.address.trim() && formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters long';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmpassword) {
      newErrors.confirmpassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    // console.log("RegisterPage data", formData);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create registration data (exclude confirmpassword)
      const { confirmpassword, ...registrationData } = formData;

      const result = await register(registrationData);

      if (result.success) {
        // Navigation will be handled by useEffect when user state updates
        console.log('Registration successful, user will be redirected');
      } else {
        // Error handling is already done in the register function
        console.log('Registration failed:', result.error);
      }
    } catch (err) {
      console.error('Registration submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  // Show loading while checking authentication
  // if (isLoading && !userDataLoaded) {
  //   return (
  //     <div className="auth-page">
  //       <div className="auth-container">
  //         <div className="loading-container" style={{
  //           display: 'flex',
  //           justifyContent: 'center',
  //           alignItems: 'center',
  //           height: '200px'
  //         }}>
  //           <p>Checking authentication...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
              disabled={isFormDisabled}
              required
              placeholder="Enter your full name"
            />
            {errors.fullname && <span className="error">{errors.fullname}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number (Optional)</label>
            <input
              type="tel"
              name="phoneno"
              value={formData.phoneno}
              onChange={handleChange}
              disabled={isFormDisabled}
              maxLength="10"
              placeholder="Enter 10-digit phone number (optional)"
              pattern="[0-9]{10}"
            />
            {errors.phoneno && <span className="error">{errors.phoneno}</span>}
          </div>

          <div className="form-group">
            <label>Address (Optional)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isFormDisabled}
              rows="3"
              placeholder="Enter your address (optional)"
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              minLength="6"
              autoComplete="new-password"
              placeholder="Enter password (min 6 characters)"
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmpassword"
              value={formData.confirmpassword}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
            {errors.confirmpassword && (
              <span className="error">{errors.confirmpassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isFormDisabled}
          >
            {isSubmitting || isLoading ? 'Creating Account...' : 'Register'}
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