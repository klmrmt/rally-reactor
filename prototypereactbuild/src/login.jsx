import React from 'react';
import { useNavigate } from 'react-router-dom';
import RALLY from './RALLY-2.png'

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img 
          src={RALLY} 
          alt="RALLY" 
          style={{ 
            width: '500px', 
            height: '500px',
            marginBottom: '20px'
          }} 
        />
        <button 
          onClick={() => navigate('/main')}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginPage;