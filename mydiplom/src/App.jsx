import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './Welcome';
import Auth from './Auth';
import Register from './Register';
import GoalSelection from './GoalSelection';
// import Onboarding from './Onboarding'; 
import Dashboard from './Dashboard';
import Tasks from './Tasks';
import Pet from './Pet';
import Profile from './Profile';
import Friends from './Friends';
import GamePage from './GamePage';
import AdminPanel from './AdminPanel';
import TeacherPanel from './TeacherPanel';
import InitialAssessment from './InitialAssessment';
import PracticePage from './PracticePage';
import OnboardingTour from './OnboardingTour';
import TermsOfUse from './TermsOfUse';
import PrivacyPolicy from './PrivacyPolicy';
import ScrollToTop from './ScrollToTop';
import './App.css';

function App() {
  return (
    <BrowserRouter 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}
    >
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/goal-selection" element={<GoalSelection />} />
        <Route path="/assessment" element={<InitialAssessment />} />
        <Route path="/create-first-goal" element={<GoalSelection />} />
        <Route path="/onboarding-tour" element={<OnboardingTour />} /> 
        {/* <Route path="/onboarding" element={<Onboarding />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/main" element={<Dashboard />} /> 
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/pet" element={<Pet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/game" element={<GamePage />} />
        <Route
          path="/admin"
          element={
            localStorage.getItem('userRole') === 'admin' ? (
              <AdminPanel />
            ) : (
              <Navigate to="/profile" replace />
            )
          }
        />
        <Route
          path="/teacher"
          element={
            localStorage.getItem('userRole') === 'teacher' ? (
              <TeacherPanel />
            ) : (
              <Navigate to="/profile" replace />
            )
          }
        />
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
}

export default App;