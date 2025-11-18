import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Signup from './components/Signup';
import Logout from './components/Logout';
import Login from './components/Login';
import Prediction from './components/Prediction';
import Recommendations from './components/Recommendations';
import './components/AuthForm.css';
import './components/Container.css';
import SoilRecommendations from './components/Recommendations';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/logout" element={<Logout />} />
    <Route path="/recommendations" element={<Recommendations />} />
    <Route path="/prediction" element={<Prediction />} />
    <Route path="/signup" element={<Signup onSuccess={() => window.location.href = '/prediction'} />} />
    <Route path="/login" element={<Login onSuccess={() => window.location.href = '/prediction'} />} />
  </Routes>
);

export default AppRouter;





