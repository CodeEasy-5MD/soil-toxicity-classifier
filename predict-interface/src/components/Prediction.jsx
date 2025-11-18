import React, { useState } from 'react';


// SVG Icons as React Components for better reusability
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-leaf"><path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z"/><path d="M12 21a10 10 0 0 0 10-10h-2a7 7 0 0 1-7 7z"/><path d="M12 12a5 5 0 0 0 5-5V2h-5a5 5 0 0 0-5 5v5h5z"/></svg>
);
const BugIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-bug"><path d="M8 2l-1.41 1.41L5.17 2l1.42 1.41L8 2zM2 8h20M12 22V8M7 12h-2v4h2v-4zM17 12h2v4h-2v-4z"/></svg>
);
const BeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-beaker"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>
);
const ThermometerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-thermometer"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/></svg>
);
const AlertCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-alert"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

// 🔹 Handle Logout and remove authentication token
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = 'http://localhost:5173/'; // Redirect to login/homepage
  };
// function to redirect user to recommendations page
const handleRecommendationsRedirect = (toxicityLevel) => {
  // Convert toxicity level to lowercase for URL consistency
  const level = toxicityLevel.toLowerCase();
  
  // conduct Redirect to recommendations page with toxicity level as parameter
  window.location.href = `/recommendations?level=${level}`;
  
  // Alternative: If using React Router, you could use:
  // navigate(`/recommendations?level=${level}`);
  // or
  // navigate(`/recommendations/${level}`);
};

// included CSS directly within the component
const Style = () => (
  <style>{`
    /* General Body and Reset Styles */
    :root {
        --green-50: #f0fdf4;
        --blue-50: #eff6ff;
        --green-600: #16a34a;
        --blue-600: #2563eb;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-300: #d1d5db;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --red-500: #ef4444;
        --white: #ffffff;
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --border-radius: 0.5rem;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Inter', sans-serif;
        min-height: 100vh;
        background-image: linear-gradient(to bottom right, var(--green-50), var(--blue-50));
        color: var(--gray-800);
        padding: 1rem;
    }

    /* Layout */
    .container {
        max-width: 56rem; /* 896px */
        margin: 0 auto;
    }

    .main-content {
        width: 100%;
    }

    /* Header */
    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .title {
        font-size: 1.875rem; /* 30px */
        font-weight: 700;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .icon-leaf {
        color: var(--green-600);
    }

    .subtitle {
        color: var(--gray-600);
    }

    /* Card */
    .card {
        background-color: var(--white);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        padding: 1.5rem;
    }

    /* Form Sections */
    .form-sections {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .form-section {
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--gray-300);
    }
    .form-section.no-border {
        border-bottom: none;
        padding-bottom: 0;
    }

    .section-title {
        font-size: 1.25rem; /* 20px */
        font-weight: 600;
        color: var(--gray-700);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .section-title svg {
        width: 20px;
        height: 20px;
    }
    .icon-bug { color: #964B00; } /* Brown */
    .icon-beaker { color: #2563eb; } /* Blue */
    .icon-thermometer { color: #ea580c; } /* Orange */
    .icon-alert { color: #2563eb; } /* Blue */


    /* Grid Layout for Inputs */
    .grid {
        display: grid;
        gap: 1rem;
    }

    .grid-cols-2 {
        grid-template-columns: repeat(1, 1fr);
    }

    .grid-cols-3 {
        grid-template-columns: repeat(1, 1fr);
    }

    @media (min-width: 768px) {
        .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr);
        }
        .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
        }
    }


    /* Form Elements */
    .form-label {
        display: block;
        font-size: 0.875rem; /* 14px */
        font-weight: 500;
        color: var(--gray-700);
        margin-bottom: 0.25rem;
    }

    .form-input, .form-select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--gray-300);
        border-radius: 0.375rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:focus, .form-select:focus {
        outline: none;
        border-color: var(--green-600);
        box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.3);
    }

    .form-input.error {
        border-color: var(--red-500);
    }
    .form-input.error:focus {
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
    }

    .error-message {
        color: var(--red-500);
        font-size: 0.75rem; /* 12px */
        margin-top: 0.25rem;
        height: 1em; /* Reserve space to prevent layout shift */
    }

    /* Submit Button */
    .submit-container {
        text-align: center;
    }

    .submit-btn {
        background-image: linear-gradient(to right, var(--green-600), var(--blue-600));
        color: var(--white);
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 1.125rem; /* 18px */
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    .submit-btn:hover {
        filter: brightness(1.1);
    }

    .submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Results Section */
    .results-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background-color: var(--gray-50);
        border: 1px solid var(--gray-300);
        border-radius: var(--border-radius);
    }

    .result-card {
        padding: 1rem;
        border-radius: var(--border-radius);
    }

    #confidence-card {
        background-color: #dbeafe; /* blue-100 */
        color: #1e40af; /* blue-800 */
    }

    .result-label {
        font-size: 0.875rem; /* 14px */
        font-weight: 500;
        opacity: 0.75;
    }

    .result-value {
        font-size: 1.5rem; /* 24px */
        font-weight: 700;
    }

    /* Toxicity Level Colors */
    .toxicity-low { background-color: #dcfce7; color: #166534; }
    .toxicity-medium { background-color: #fef9c3; color: #854d0e; }
    .toxicity-high { background-color: #ffedd5; color: #9a3412; }
    .toxicity-critical { background-color: #fee2e2; color: #991b1b; }

    .interpretation-box {
        margin-top: 1rem;
        padding: 1rem;
        background-color: var(--white);
        border-radius: 0.25rem;
        border-left: 4px solid var(--blue-600);
    }

    .interpretation-title {
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 0.5rem;
    }

    .interpretation-text {
        color: var(--gray-600);
        font-size: 0.875rem; /* 14px */
    }

    /* Footer */
    .footer {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.875rem; /* 14px */
        color: var(--gray-500);
    }
    .recommendations-container {
  margin-top: 20px;
  text-align: center;
}

.recommendations-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.recommendations-btn:hover {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.recommendations-btn:active {
  transform: translateY(0);
}

.logout-container {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 1rem;
    }

    .logout-btn {
      background-color: var(--red-500);
      color: var(--white);
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    .logout-btn:hover {
      background-color: #dc2626; /* darker red */
    }
  `}</style>
);

// begin prediction function component
const Prediction = () => {
  //state management for sample input fields
  const [formData, setFormData] = useState({
    // Soil fauna
    earthworms: '', springtails: '', mites: '', nematodes: '',
    // Chemical properties
    ph: '', organic_matter: '', lead_concentration: '', cadmium_concentration: '',
    nitrogen: '', phosphorus: '', potassium: '',
    // Environmental conditions
    temperature: '', moisture: '',
    // Categorical features
    soil_type: 'loam', land_use: 'agricultural', climate_zone: 'temperate'
  });

  // hold prediction value returned from model
  //boolean indicating system is currently handling request
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});//track form validation errors

  //handle realtime updates of prediction form input values 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear any existing error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  //define minimum and maximum values for soil sample inputs
  const validateForm = () => {
    const newErrors = {};
    const validations = {
        ph: { min: .0, max: 14.0, label: 'pH' },
        organic_matter: { min: 0.1, max: 15.0, label: 'Organic Matter' },
        nitrogen: { min: 5, max: 50, label: 'Nitrogen' },
        phosphorus: { min: 5, max: 40, label: 'Phosphorus' },
        potassium: { min: 10, max: 60, label: 'Potassium' },
        temperature: { min: -5, max: 35, label: 'Temperature' },
        moisture: { min: 5, max: 95, label: 'Moisture' },
        earthworms: { min: 0, max: 100, label: 'Earthworms' },
        springtails: { min: 0, max: 100, label: 'Springtails' },
        mites: { min: 0, max: 200, label: 'Mites' },
        nematodes: { min: 0, max: 500, label: 'Nematodes' },
        lead_concentration: { min: 0, max: 50, label: 'Lead Concentration' },
        cadmium_concentration: { min: 0, max: 10, label: 'Cadmium Concentration' }
    };
    //loop through validation rules for all 16 input fields,,9
    for (const field in validations) {
        const rules = validations[field];
        const valueStr = formData[field]; //user entered value
        const value = parseFloat(valueStr); //convert string fo float for min max confirmation

        // check if field is empty, valid number or numeric value is outside range
        if (valueStr === '') {
            newErrors[field] = `${rules.label} is required`;
        } else if (isNaN(value)) {
            newErrors[field] = `${rules.label} must be a valid number`;
        } else if (value < rules.min || value > rules.max) {
            newErrors[field] = `${rules.label} must be between ${rules.min} and ${rules.max}`;
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
// handle prediction submission form
 const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsLoading(true);
  setPrediction(null);
  setErrors(null);

  try {
    // Prepare data to match backend's expected format
    const requestData = {
      // Soil Fauna
      earthworms: parseInt(formData.earthworms) || 0,
      springtails: parseInt(formData.springtails) || 0,
      mites: parseInt(formData.mites) || 0,
      nematodes: parseInt(formData.nematodes) || 0,
      
      // Chemical Properties
      ph: parseFloat(formData.ph) || 6.5,
      organic_matter: parseFloat(formData.organic_matter) || 0,
      lead_concentration: parseFloat(formData.lead_concentration) || 0,
      cadmium_concentration: parseFloat(formData.cadmium_concentration) || 0,
      nitrogen: parseFloat(formData.nitrogen) || 20,
      phosphorus: parseFloat(formData.phosphorus) || 15,
      potassium: parseFloat(formData.potassium) || 25,
      
      // Environmental Conditions
      temperature: parseFloat(formData.temperature) || 15,
      moisture: parseFloat(formData.moisture) || 50,
      
      // Site Characteristics (categorical)
      soil_type: formData.soil_type || 'loam',
      land_use: formData.land_use || 'agricultural',
      climate_zone: formData.climate_zone || 'temperate'
    };
    
    //check authentication token
    const token = localStorage.getItem('token');
      if (!token) {
        setErrors('Please log in and try again');
        window.location.href = "http://localhost:5173/";
        return;
      }

    console.log('Sending data:', requestData); // Debug log
    console.log('Sending data:', requestData); 
      var url = "http://localhost:8000/predict"
      
      //make post request to prediction API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          //confirm request is from verified user
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log(response)

    console.log(response)
    //handle and update prediction response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result)
    
    setPrediction({
      toxicity_level: result.toxicity_level,
      confidence: result.confidence
    });

  } catch (error) {
    console.error('Prediction error:', error);
    setErrors(error.message || 'Failed to get prediction. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
  //css classname for toxicity colours
  const getToxicityColorClass = (level) => {
    if (!level) return '';
    return `toxicity-${level.toLowerCase()}`;
  };

  const getInterpretationText = (level) => {
    const interpretations = {
        Low: 'This soil sample shows minimal toxicity concerns and is generally suitable for most applications.',
        Medium: 'This soil sample shows moderate toxicity levels. Consider monitoring and potential remediation measures.',
        High: 'This soil sample shows elevated toxicity levels. Remediation efforts should be considered before use.',
        Critical: 'This soil sample shows critical toxicity levels. Immediate remediation is strongly recommended before any use.'
    };
    return interpretations[level] || '';
  }

  // Helper to create input fields to reduce repetition
  const renderInputField = (name, label, placeholder, type = 'number', step = 'any') => (
    <div key={name}>
        <label htmlFor={name} className="form-label">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={formData?.[name] || ""}
            onChange={handleInputChange}
            className={`form-input ${errors?.[name] ? 'error' : ''}`}
            placeholder={placeholder}
            step={step}
        />
        {errors?.[name] && <p className="error-message">{errors?.[name]}</p>}
    </div>
  );
return (
    <>
      <Style />
      <div className="container">
      <div className="logout-container">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        <div className="main-content">
          <div className="header">
            <h1 className="title">
              <LeafIcon />
              Soil Toxicity XGBoost  Classifier
            </h1>
            <p className="subtitle">AI-powered soil health assessment system</p>
          </div>

          <div className="card">
            <div className="form-sections">
              {/* Soil Fauna Section */}
              <div className="form-section">
                <h3 className="section-title"><BugIcon /> Soil Fauna (organisms per sample)</h3>
                <div className="grid grid-cols-2">
                  {renderInputField('earthworms', 'Earthworms', '0 - 100')}
                  {renderInputField('springtails', 'Springtails', '0 - 100')}
                  {renderInputField('mites', 'Mites', '0 - 200')}
                  {renderInputField('nematodes', 'Nematodes', '0 - 500')}
                </div>
              </div>

              {/* Chemical Properties Section */}
              <div className="form-section">
                  <h3 className="section-title"><BeakerIcon /> Chemical Properties</h3>
                  <div className="grid grid-cols-3">
                      {renderInputField('ph', 'pH Level', '3.0 - 10.0', 'number', '0.1')}
                      {renderInputField('organic_matter', 'Organic Matter (%)', '0.1 - 15.0', 'number', '0.1')}
                      {renderInputField('lead_concentration', 'Lead (mg/kg)', '0 - 50', 'number', '0.1')}
                      {renderInputField('cadmium_concentration', 'Cadmium (mg/kg)', '0 - 10', 'number', '0.01')}
                      {renderInputField('nitrogen', 'Nitrogen (mg/kg)', '5 - 50', 'number', '0.1')}
                      {renderInputField('phosphorus', 'Phosphorus (mg/kg)', '5 - 40', 'number', '0.1')}
                      {renderInputField('potassium', 'Potassium (mg/kg)', '10 - 60', 'number', '0.1')}
                  </div>
              </div>
              
              {/* Environmental Conditions */}
              <div className="form-section">
                  <h3 className="section-title"><ThermometerIcon /> Environmental Conditions</h3>
                  <div className="grid grid-cols-2">
                      {renderInputField('temperature', 'Temperature (°C)', '-5 to 35', 'number', '0.1')}
                      {renderInputField('moisture', 'Moisture (%)', '5 - 95', 'number', '0.1')}
                  </div>
              </div>

              {/* Categorical Features */}
              <div className="form-section no-border">
                  <h3 className="section-title">Site Characteristics</h3>
                  <div className="grid grid-cols-3">
                      <div>
                          <label htmlFor="soil_type" className="form-label">Soil Type</label>
                          <select id="soil_type" name="soil_type" value={formData.soil_type} onChange={handleInputChange} className="form-select">
                              <option value="loam">Loam</option>
                              <option value="clay">Clay</option>
                              <option value="sand">Sand</option>
                              <option value="silt">Silt</option>
                          </select>
                      </div>
                      <div>
                          <label htmlFor="land_use" className="form-label">Land Use</label>
                          <select id="land_use" name="land_use" value={formData.land_use} onChange={handleInputChange} className="form-select">
                              <option value="agricultural">Agricultural</option>
                              <option value="forest">Forest</option>
                              <option value="urban">Urban</option>
                              <option value="industrial">Industrial</option>
                          </select>
                      </div>
                      <div>
                          <label htmlFor="climate_zone" className="form-label">Climate Zone</label>
                          <select id="climate_zone" name="climate_zone" value={formData.climate_zone} onChange={handleInputChange} className="form-select">
                              <option value="temperate">Temperate</option>
                              <option value="tropical">Tropical</option>
                              <option value="arid">Arid</option>
                              <option value="continental">Continental</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* Submit Button */}
              <div className="submit-container">
                <button type="button" onClick={handleSubmit} disabled={isLoading} className="submit-btn">
                  {isLoading ? 'Analyzing Soil Sample...' : 'Classify Soil Toxicity'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {prediction && (
              <div className="results-section">
                <h3 className="section-title"><AlertCircleIcon /> Classification Results</h3>
                <div className="grid grid-cols-2">
                  <div className={`result-card ${getToxicityColorClass(prediction.toxicity_level)}`}>
                    <div className="result-label">Toxicity Level</div>
                    <div className="result-value">{prediction.toxicity_level}</div>
                  </div>
                  <div className="result-card" id="confidence-card">
                    <div className="result-label">Confidence</div>
                    <div className="result-value">{prediction.confidence}%</div>
                  </div>
                </div>
                <div className="interpretation-box">
                  <h4 className="interpretation-title">Interpretation:</h4>
                  <p className="interpretation-text">{getInterpretationText(prediction.toxicity_level)}</p>
                </div>
                
                {/* Recommendations Button */}
                <div className="recommendations-container">
                  <button 
                    type="button" 
                    onClick={() => handleRecommendationsRedirect(prediction.toxicity_level)}
                    className="recommendations-btn"
                  >
                    
                    View Treatment Recommendations
                  </button>
                </div>
              </div>
            )}
          </div>
          <footer className="footer">
            <p>Research Project - XGBoost Soil Toxicity Classifier</p>
          </footer>
          
        </div>
      </div>
    </>
  );
};

export default Prediction;
