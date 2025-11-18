// checks whether current user is authenticated as per token session
import './App.css'
import AppRouter from './AppRouter'
import './components/Container.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';


function App() {
  // All hooks must be inside the component function
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios({
            method: 'get',
            url: `http://localhost:8000/user/verify-token`,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });


          setIsAuthenticated(true);
          if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/prediction');
          }
        } catch (error) {
          console.error('Verify token failed:', error.response?.data || error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          navigate('/');
        }
      } else {
        setIsAuthenticated(false);
        if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/');
        }
      }
      setIsLoading(false);
    };
   
    verifyToken();
  }, [navigate, location.pathname]);


  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <main className="page-content">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </main>
    );
  }


  return (  //return App Router
    <main className="page-content">
      <AppRouter isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </main>
  );
}


export default App;
