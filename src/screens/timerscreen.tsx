import React from "react";
import Sidebar from "../components/Sidebar";
import "../styles/App.css";
import Timer from "../components/timer";

const TimerScreen = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          <Timer />
        </div>
      </div>
    </div>
  );
};

export default TimerScreen;
