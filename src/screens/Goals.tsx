import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSave, FaTimes, FaSeedling, FaCheck } from "react-icons/fa";
import Modal from "react-modal";

interface Goal {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  achieved: boolean;
  createdAt: string;
}

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    if (!newTitle.trim()) return;
    const goal: Goal = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      targetDate: newTargetDate,
      achieved: false,
      createdAt: new Date().toLocaleDateString(),
    };
    setGoals([...goals, goal]);
    setNewTitle("");
    setNewDescription("");
    setNewTargetDate("");
    setIsModalOpen(false);
  };

  const toggleAchieved = (id: number) => {
    setGoals(
      goals.map((g) => (g.id === id ? { ...g, achieved: !g.achieved } : g)),
    );
  };

  const deleteGoal = (id: number) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const activeGoals = goals.filter((g) => !g.achieved);
  const achievedGoals = goals.filter((g) => g.achieved);

  return (
    <div>
      <h2 className="content-title">Goals</h2>
      <p className="content-text">Plant seeds for your future</p>

      {/* Active Goals */}
      <div className="goals-section">
        <div className="goals-grid">
          <AnimatePresence>
            {activeGoals.map((goal) => (
              <motion.div
                key={goal.id}
                className="goal-card"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                layout
              >
                <div className="goal-card-header">
                  <FaSeedling className="goal-icon" />
                  <div className="goal-card-actions">
                    <motion.button
                      className="goal-achieve-btn"
                      onClick={() => toggleAchieved(goal.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Mark as achieved"
                    >
                      <FaCheck />
                    </motion.button>
                    <motion.button
                      className="goal-delete-btn"
                      onClick={() => deleteGoal(goal.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete goal"
                    >
                      <FaTimes />
                    </motion.button>
                  </div>
                </div>
                <h3 className="goal-title">{goal.title}</h3>
                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}
                <div className="goal-footer">
                  {goal.targetDate && (
                    <span className="goal-date">Target: {goal.targetDate}</span>
                  )}
                  <span className="goal-created">Added {goal.createdAt}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Goal Card */}
          <div className="goal-add-card" onClick={() => setIsModalOpen(true)}>
            <FaPlus className="goal-add-icon" />
            <span className="goal-add-text">Plant a new goal...</span>
          </div>
        </div>
      </div>

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div>
          <h3 className="goals-achieved-heading">Achieved</h3>
          <div className="goals-grid">
            <AnimatePresence>
              {achievedGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className="goal-card goal-card-achieved"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  layout
                >
                  <div className="goal-card-header">
                    <FaCheck className="goal-icon-achieved" />
                    <div className="goal-card-actions">
                      <motion.button
                        className="goal-undo-btn"
                        onClick={() => toggleAchieved(goal.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Mark as active"
                      >
                        Undo
                      </motion.button>
                      <motion.button
                        className="goal-delete-btn"
                        onClick={() => deleteGoal(goal.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTimes />
                      </motion.button>
                    </div>
                  </div>
                  <h3 className="goal-title goal-title-achieved">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="task-modal-content"
        overlayClassName="task-modal"
        contentLabel="Add New Goal"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="task-modal-title">Plant a New Goal</h3>
            <motion.button
              className="modal-close-button"
              onClick={() => setIsModalOpen(false)}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>
          <input
            type="text"
            className="task-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Goal title..."
            onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
          />
          <textarea
            className="goal-textarea"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={3}
          />
          <input
            type="text"
            className="task-date-input"
            value={newTargetDate}
            onChange={(e) => setNewTargetDate(e.target.value)}
            placeholder="Target date (optional)"
          />
          <div className="task-modal-buttons">
            <motion.button
              className="task-cancel-button"
              onClick={() => setIsModalOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              className="task-save-button"
              onClick={handleAddGoal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSave className="button-icon" />
              Plant Goal
            </motion.button>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Goals;
