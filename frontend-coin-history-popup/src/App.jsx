import { useState } from 'react';
import { Button } from 'react-bootstrap';
import CoinHistory from './CoinHistory';
import './App.css';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="temporary-page">
      <div className="p-5 bg-white rounded-4 shadow-sm text-center">
        <h2 style={{ fontFamily: 'DM Sans', fontWeight: '700' }}>Kapebara Wallet</h2>
        <p style={{ fontFamily: 'Plus Jakarta Sans', color: '#666' }}>Manage your coins here.</p>
        
        <Button 
          variant="dark" 
          size="lg"
          onClick={() => setIsOpen(true)}
          style={{ fontFamily: 'DM Sans', borderRadius: '15px', marginTop: '10px' }}
        >
          Open History
        </Button>
      </div>

      <CoinHistory 
        show={isOpen} 
        onHide={() => setIsOpen(false)} 
      />
    </div>
  );
}

export default App;