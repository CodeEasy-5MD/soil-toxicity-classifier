// LandingPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import './Landing.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const toggleLogin = () => {
    setShowLogin(!showLogin);
    setShowSignup(false); 
  };

  const toggleSignup = () => {
    setShowSignup(!showSignup);
    setShowLogin(false); 
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero-section-centered">
        <div className="hero-content-centered">
          <h1>Soil Toxicity Classification</h1>
          <p>Advanced XGBoost machine learning model for accurate soil toxicity assessment</p>
          <div className="hero-buttons">
            <button className="button primary" onClick={toggleLogin}>Login</button>
            <button className="button secondary" onClick={toggleSignup}>Sign Up</button>
          </div>
        </div>
        
      </header>

      {/* System Explanation Section */}
      <section className="project-info">
        <div className="container">
          <h2>About The System</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="icon">🧪</div>
              <h3>Predictive Analytics</h3>
              <p>The system makes use of data driven and model based techniques within the context of agricultural sciences research. The use of predictive analytics ensures timely and up-to-date mechanisms of engaging with agricultural and soil research today.</p>
            </div>
            <div className="info-card">
              <div className="icon">🤖</div>
              <h3>Technique</h3>
              <p>We've trained and optimized an XGBoost classification model that accurately predicts soil toxicity levels based on various key soil parameters.</p>
            </div>
            <div className="info-card">
              <div className="icon">🌱</div>
              <h3>Impact to Science</h3>
              <p>This tool helps environmental and soil scientists and researchers to quickly assess soil health and potential toxicity concerns for agricultural and conservation purposes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <ol className="process-steps">
            <li>Create an account to access the prediction tool</li>
            <li>Input soil sample data including chemical composition</li>
            <li>Our XGBoost model analyzes the data in real-time</li>
            <li>Receive immediate toxicity classification results</li>
            <li>Get recommendations based off of results</li>
          </ol>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Analyze Soil Samples?</h2>
          <p>Sign up now to access our advanced soil toxicity classification system</p>
          <button className="button primary large" onClick={toggleSignup}>Get Started</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>Soil Toxicity Classification using XGBoost model</p>
        </div>
      </footer>

      {/* Existing Modals */}
      {showSignup && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sign Up</h3>
            <Signup 
              onSuccess={() => {
                closeModals();
                navigate('/prediction');
              }}
              onCancel={closeModals}
            />
          </div>
        </div>
      )}

      {showLogin && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Log In</h3>
            <Login
              onSuccess={() => {
                closeModals();
                navigate('/prediction');
              }}
              onCancel={closeModals}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;