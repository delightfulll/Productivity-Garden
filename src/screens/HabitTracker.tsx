import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import HabitList from "../components/HabitList";
import { formatLocalDayKey } from "../lib/dateUtils";
import "../styles/App.css";

function HabitTracker() {
  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="content-container">
          <div className="home-header" style={{ maxWidth: "100%", marginBottom: "1.75rem" }}>
            <div className="welcome-section">
              <motion.h2
                className="content-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Habit Tracker
              </motion.h2>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Track your habits with a clear seven-day history.
              </motion.p>
            </div>
          </div>

          <HabitList
            endDateKey={formatLocalDayKey(new Date())}
            title="Your Habits"
            subtitle="Pick a circle to mark green, red, or grey for no response."
          />
        </div>
      </div>
    </div>
  );
}

export default HabitTracker;
