import React from 'react';
import '../App.css'
import Sidebar from '../components/Sidebar'

function Wins() {
    return (
        <div className="app-container">
            <Sidebar />

            {/* Main Content Area */}
            <div className="main-content">
                <div className="content-container">
                    <h2 className="content-title">Daily Win's</h2>
                    <p className="content-text">Here you can track your daily wins</p>

                    {/* Physical Win */}
                    <div className="win-section">
                        <h3 className="win-section-title">Physical Win</h3>
                        <div className="win-card">
                            <span className="win-card-text">Completed a 5K run in under 25 minutes</span>
                        </div>
                        <div className="add-win-card">
                            <input className="add-win-input" placeholder="Add a new physical win..." />
                            <button className="add-win-plus">+</button>
                        </div>
                    </div>

                    {/* Mental Win */}
                    <div className="win-section">
                        <h3 className="win-section-title">Mental Win</h3>
                        <div className="win-card">
                            <span className="win-card-text">Finished reading a challenging book</span>
                        </div>
                        <div className="add-win-card">
                            <input className="add-win-input" placeholder="Add a new mental win..." />
                            <button className="add-win-plus">+</button>
                        </div>
                    </div>

                    {/* Spiritual Win */}
                    <div className="win-section">
                        <h3 className="win-section-title">Spiritual Win</h3>
                        <div className="win-card">
                            <span className="win-card-text">Meditated for 20 minutes</span>
                        </div>
                        <div className="add-win-card">
                            <input className="add-win-input" placeholder="Add a new spiritual win..." />
                            <button className="add-win-plus">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Wins