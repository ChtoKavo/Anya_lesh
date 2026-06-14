import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/auth');
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <img 
        src="/welcome2.png"
        alt="Welcome"
        style={{ 
          width: '100%', 
          height: '100%',
          objectFit: 'cover',
          display: 'block' 
        }}
      />
      
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 2
      }}>
        <button 
          onClick={handleStart}
          style={{
            padding: '18px 0',
            width: '25%',
            minWidth: '150px',
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #B49DF9, #83B3E1)',
            color: '#fff',
            border: '2px dashed white',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.style.transform = 'translateY(-3px)';
            e.style.boxShadow = '0 6px 20px rgba(180, 157, 249, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.style.transform = 'translateY(0)';
            e.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          }}
        >
          Давайте начнем
        </button>
      </div>
    </div>
  );
};

export default Welcome;