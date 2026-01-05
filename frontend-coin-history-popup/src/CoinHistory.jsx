import React from 'react';
import { Modal } from 'react-bootstrap';
import { ChevronLeft, ReceiptText, CircleDollarSign } from 'lucide-react';

const CoinHistory = ({ show, onHide }) => {
  const historyData = [
    { id: 1, date: '10/24/2023', location: 'Sm North Edsa', amount: '10' },
    { id: 2, date: '10/25/2023', location: 'Sm Megamall', amount: '15' },
    { id: 3, date: '11/02/2023', location: 'Sm Manila', amount: '20' },
  ];

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <Modal.Body className="p-4" style={{ minHeight: '550px' }}>
        
        {/* FIXED HEADER ALIGNMENT */}
        <div className="d-flex align-items-center mb-5 mt-2">
          <ChevronLeft 
            size={28} 
            style={{ cursor: 'pointer', marginRight: '16px' }} 
            onClick={onHide} 
          />
          <h1 className="history-title mb-0" style={{ lineHeight: '1' }}>
            Kapebara Coin history
          </h1>
        </div>

        {/* History List */}
        {historyData.map((item) => (
          <div key={item.id} className="history-clickable-item history-body-text">
            <div className="d-flex gap-3 align-items-center">
              <ReceiptText size={24} color="#333" strokeWidth={1.2} />
              <div>
                <p className="mb-0 fw-bold" style={{ fontSize: '14px' }}>
                  Order <span className="text-muted fw-normal">[{item.date}]</span>
                </p>
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                  [{item.location}]
                </p>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0 fw-semibold" style={{ fontSize: '13px' }}>
                -{item.amount} Kapebara Coins
              </p>
              {/* Single Coin Icon */}
              <div className="single-coin-wrapper">
                 <CircleDollarSign size={18} color="#333" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default CoinHistory;