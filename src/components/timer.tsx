import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "react-timer-hook";
import { FaPlay, FaPause, FaRedo, FaTimes, FaLeaf } from "react-icons/fa";
import { tasksApi, type Task } from "../lib/api";
import "../styles/timer.css";

const PRESETS = [
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
  { label: "25 min", seconds: 1500 },
  { label: "45 min", seconds: 2700 },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const Timer = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activePreset, setActivePreset] = useState(1500);

  useEffect(() => {
    tasksApi
      .list()
      .then((all) => setTasks(all.filter((t) => !t.completed)))
      .catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  const getExpiryTimestamp = (durationSeconds: number) => {
    const t = new Date();
    t.setSeconds(t.getSeconds() + durationSeconds);
    return t;
  };

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    autoStart: false,
    expiryTimestamp: getExpiryTimestamp(activePreset),
  });

  const handlePreset = (secs: number) => {
    setActivePreset(secs);
    restart(getExpiryTimestamp(secs), false);
  };

  const handleReset = () => {
    restart(getExpiryTimestamp(activePreset), false);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(false);
    restart(getExpiryTimestamp(activePreset), false);
  };

  const totalSeconds = activePreset;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference * (1 - progress);

  const categoryColors: Record<string, string> = {
    watering: "#22c55e",
    sunlight: "#f59e0b",
    composting: "#a78bfa",
  };

  const wateringTasks = tasks.filter((t) => t.category === "watering");
  const sunlightTasks = tasks.filter((t) => t.category === "sunlight");
  const compostingTasks = tasks.filter((t) => t.category === "composting");

  return (
    <>
      {/* Header */}
      <div className="home-header" style={{ maxWidth: "100%", marginBottom: "1.5rem" }}>
        <div className="welcome-section">
          <motion.h2
            className="content-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Focus Timer
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Stay in the zone and let your garden grow
          </motion.p>
        </div>
      </div>

      {/* Preset Durations */}
      <motion.div
        className="timer-presets"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {PRESETS.map((preset) => (
          <button
            key={preset.seconds}
            className={`timer-preset-btn ${activePreset === preset.seconds ? "timer-preset-active" : ""}`}
            onClick={() => handlePreset(preset.seconds)}
            disabled={isRunning}
          >
            {preset.label}
          </button>
        ))}
      </motion.div>

      {/* Timer Card */}
      <motion.div
        className="timer-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Circular Progress */}
        <div className="timer-ring-wrapper">
          <svg className="timer-ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" className="timer-ring-bg" />
            <motion.circle
              cx="100"
              cy="100"
              r="88"
              className="timer-ring-progress"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ stroke: isRunning ? "#22c55e" : "#d1d5db" }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          <div className="timer-display">
            <motion.span
              className="timer-digits"
              key={`${minutes}:${seconds}`}
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              {pad(minutes)}:{pad(seconds)}
            </motion.span>
            <span className={`timer-status-label ${isRunning ? "timer-status-running" : ""}`}>
              {isRunning ? "Focusing" : "Ready"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <motion.button
            className="timer-reset-btn"
            onClick={handleReset}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Reset"
          >
            <FaRedo />
          </motion.button>

          <motion.button
            className={`timer-play-btn ${isRunning ? "timer-play-btn-pause" : ""}`}
            onClick={isRunning ? pause : start}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isRunning ? (
                <motion.span
                  key="pause"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <FaPause />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <FaPlay />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div style={{ width: "40px" }} />
        </div>
      </motion.div>

      {/* Task Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <h3 className="content-title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Focusing on
        </h3>

        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div
              key="selected"
              className="timer-task-card timer-task-card-selected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="timer-task-info">
                <span
                  className="timer-task-category-dot"
                  style={{ background: categoryColors[selectedTask.category] ?? "#22c55e" }}
                />
                <div>
                  <p className="timer-task-text">{selectedTask.text}</p>
                  <span className="timer-task-category">
                    {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                  </span>
                </div>
              </div>
              <motion.button
                className="timer-change-task-btn"
                onClick={() => setIsTaskModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Change
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="add-win-card"
              onClick={() => setIsTaskModalOpen(true)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ cursor: "pointer" }}
            >
              <div className="add-win-plus">
                <FaLeaf />
              </div>
              <span className="add-win-input">Select a task to focus on...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task Selection Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <motion.div
            className="task-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTaskModalOpen(false)}
          >
            <motion.div
              className="timer-modal-content"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="journal-modal-title">Select a Task</h3>
                <motion.button
                  className="modal-close-button"
                  onClick={() => setIsTaskModalOpen(false)}
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes />
                </motion.button>
              </div>

              {[
                { label: "Watering", tasks: wateringTasks, color: "#22c55e" },
                { label: "Sunlight", tasks: sunlightTasks, color: "#f59e0b" },
                { label: "Composting", tasks: compostingTasks, color: "#a78bfa" },
              ].map(({ label, tasks: catTasks, color }) =>
                catTasks.length > 0 ? (
                  <div key={label} className="timer-modal-section">
                    <p className="timer-modal-section-label" style={{ color }}>
                      {label}
                    </p>
                    {catTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        className={`timer-modal-task-item ${selectedTask?.id === task.id ? "timer-modal-task-selected" : ""}`}
                        onClick={() => handleTaskSelect(task)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span
                          className="timer-task-category-dot"
                          style={{ background: color, flexShrink: 0 }}
                        />
                        <div>
                          <p className="timer-modal-task-text">{task.text}</p>
                          {task.date && task.date !== "No date" && (
                            <small className="timer-modal-task-date">{task.date}</small>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : null
              )}

              {tasks.length === 0 && (
                <div className="journal-empty-state">
                  <span className="journal-empty-icon">🌱</span>
                  <p>No tasks yet. Add some from the home page.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Timer;
