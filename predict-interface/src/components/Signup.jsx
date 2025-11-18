// SignupForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

// functional component on succession or cancellation of signup process
const Signup = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    //error storage
    const [errors, setErrors] = useState({});
    //check if submission is occurring to avoid double submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    //validate input fields
    const validate = (name, value) => {
        const newErrors = { ...errors };
        
        //username validation
        if (name === 'username') {
            newErrors.username = value.length < 3 ? 'Username must be at least 3 characters' : '';
        }

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            newErrors.email = !emailRegex.test(value) && value.length > 0 ? 'Invalid email address' : '';
        }
        
        //email validation
        if (name === 'password') {
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            newErrors.password = !passwordRegex.test(value) && value.length > 0
                ? 'Password must be at least 8 characters, include a number and a special character.'
                : '';
        }

        if (name === 'confirmPassword') {
            newErrors.confirmPassword =
                value !== formData.password && value.length > 0 ? 'Passwords do not match' : '';
        }

        //update errors
        setErrors(newErrors);
    };
    //validate all input fields
    const validateAll = () => {
        const newErrors = {};

        // real-time validation
        if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }


        
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters, include a number and a special character.';
        }

        
        if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        //check error after inputs are filled
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // run any input from user
    const handleChange = (e) => {
        const { name, value } = e.target;//input field to trigger changing event
        setFormData((prev) => ({ ...prev, [name]: value }));
        validate(name, value);
    };
    // prevent unnecessary page refresh
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any previous general errors
        const newErrors = { ...errors };
        delete newErrors.general;
        setErrors(newErrors);

        // Validate all fields
        const isValid = validateAll();
        
        // Check if all required fields are filled
        const allFieldsFilled = Object.values(formData).every(field => field.trim() !== '');
        
        if (!allFieldsFilled) {
            setErrors(prev => ({ ...prev, general: 'Please fill in all fields.' }));
            return;
        }

        if (!isValid) {
            setErrors(prev => ({ ...prev, general: 'Please fix the errors before submitting.' }));
            return;
        }

        setIsSubmitting(true);

        try {
            // IMPORTANT: No trailing slash in the URL
            const response = await axios.post(`http://localhost:8000/user`, {formData: formData});
            // Destructure the response data correctly
            const { username, id, email, access_token, message } = response.data;
            // Store token and user data in localStorage
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify({id,username,email}));
             console.log('User created successfully:', message);

            // check if success callback is provided
            if (onSuccess) {
                onSuccess();
            }

            //detect any error in signup
        } catch (error) {
            console.error('Signup error:', error);


            // Handle different error scenarios
            let errorMessage = 'Signup failed. Please try again.';


            if (error.response) {
                // Server responded with error status
                errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
                console.log('Error status:', error.response.status);
                console.log('Error data:', error.response.data);
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'Network error. Please check your connection.';
            } else {
                // Something else happened
                errorMessage = 'An unexpected error occurred.';
            }

            //convert error state to error message
            setErrors(prev => ({
                ...prev,
                general: errorMessage
            }));
        } finally {
            setIsSubmitting(false);//clear errors for new submission
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h1 className="auth-title">
                    <span className="icon-leaf">🌿</span>
                    Create Account
                </h1>
                <p className="auth-subtitle">Join us to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
                {errors.general && (
                    <div className="general-error">
                        {errors.general}
                    </div>
                )}
                
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                        disabled={isSubmitting}
                        className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <small className="error">{errors.username}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        required
                        disabled={isSubmitting}
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <small className="error">{errors.email}</small>}
                </div>


                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                        disabled={isSubmitting}
                        className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <small className="error">{errors.password}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        required
                        disabled={isSubmitting}
                        className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <small className="error">{errors.confirmPassword}</small>}
                </div>

                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                    <button 
                        type="button"
                        className="cancel-button" 
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Signup;