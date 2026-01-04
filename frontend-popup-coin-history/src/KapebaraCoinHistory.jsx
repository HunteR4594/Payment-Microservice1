import React from 'react';
import './KapebaraCoinHistory.css';
import { HiChevronLeft } from "react-icons/hi2"; 
import { IoReceiptOutline } from "react-icons/io5"; 
import { RiProgress8Line } from "react-icons/ri"; 

const KapebaraCoinHistory = () => {
    const data = [
        { id: 1, date: '[date]', location: '[Order Location]', amount: '-[x]' },
        { id: 2, date: '[date]', location: '[Order Location]', amount: '-[x]' }
    ];

    return (
        <div className="history-screen">
            <div className="header-row">
                <HiChevronLeft className="back-arrow" onClick={() => window.history.back()} />
                <h1>Kapebara Coin history</h1>
            </div>

            <div className="history-list">
                {data.map((item) => (
                    <div key={item.id} className="history-card">
                        <div className="card-left">
                            <IoReceiptOutline className="receipt-icon" />
                            <div className="order-info">
                                <h3>Order {item.date}</h3>
                                <p>{item.location}</p>
                            </div>
                        </div>
                        <div className="card-right">
                            <span className="amount-text">{item.amount} Kapebara Coins</span>
                            <RiProgress8Line className="coin-logo" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KapebaraCoinHistory;