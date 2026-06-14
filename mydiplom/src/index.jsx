import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const App = () => {
  return (
    <div style={{
      background: '#0f1c2d',
      color: 'white',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h1>Goal Tracker работает!</h1>
      
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);