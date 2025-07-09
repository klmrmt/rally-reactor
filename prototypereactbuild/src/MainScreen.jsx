import React from 'react';
import { useNavigate } from 'react-router-dom';
import RALLY from './RALLY-2.png'
import './MainScreen.css'

function MainScreen() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'relative', minHeight: '100vh', margin: 0, padding: 0 }}>
      <img 
        src={RALLY} 
        alt="RALLY" 
        onClick={() => navigate('/')}
        style={{ 
          position: 'fixed',
          top: '10px',
          left: '10px',
          width: '100px', 
          height: '100px',
          zIndex: 1000,
          cursor: 'pointer'
        }} 
      />
              <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <h1>WELCOME TO RALLY!!</h1>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            <button
              onClick={() => navigate('/main')}
              className="rally-button"
            >
              RALLY UP!
            </button>
            
            <button
              onClick={() => navigate('/main')}
              className="rally-button"
            >
              JOIN THE RALLY!
            </button>
          </div>

        </div>
    </div>
  );
}

export default MainScreen; 