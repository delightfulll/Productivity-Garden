import React, { useState, useRef, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { FaPlus, FaGripVertical, FaSave, FaTimes } from "react-icons/fa";
import "../styles/index.css";
import CustomCalendar from "../components/calendar";
import Modal from "react-modal";
import Goals from "./Goals";
import Backlog from "./Backlog";
import GoalFocus from "../components/GoalFocus";

type ActiveTab = "tasks" | "goals" | "backlog";

interface TaskItemProps {
  task: any;
  category: string;
  onComplete: (taskId: number, category: string) => void;
  taskRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const TaskItem = ({ task, category, onComplete, taskRefs }: TaskItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className={`task-item ${task.completed ? "task-completed" : ""}`}
    ref={(el) => {
      if (el) {
        taskRefs.current[task.id] = el;
      }
    }}
  >
    <motion.div
      className="drag-handle"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaGripVertical />
    </motion.div>
    <motion.input
      type="checkbox"
      className="task-checkbox"
      checked={task.completed}
      onChange={() => onComplete(task.id, category)}
      whileTap={{ scale: 0.9 }}
    />
    <span className={`task-text ${task.completed ? "completed" : ""}`}>
      {task.text}
    </span>
    <span className="task-date">{task.date}</span>
  </motion.div>
);

function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const taskRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [wateringTasks, setWateringTasks] = useState([
    {
      id: 1,
      text: "Complete project proposal",
      date: "Due Today",
      completed: false,
    },
    {
      id: 2,
      text: "Review pull requests",
      date: "Due Tomorrow",
      completed: false,
    },
    {
      id: 3,
      text: "Update documentation",
      date: "Due in 2 days",
      completed: false,
    },
  ]);

  const [sunlightTasks, setSunlightTasks] = useState([
    { id: 1, text: "Morning meditation", date: "Daily", completed: false },
    { id: 2, text: "Read for 30 minutes", date: "Daily", completed: false },
    { id: 3, text: "Evening reflection", date: "Daily", completed: false },
  ]);

  const [compostingTasks, setCompostingTasks] = useState([
    {
      id: 1,
      text: "Clean email inbox",
      date: "When possible",
      completed: false,
    },
    { id: 2, text: "Organize desk", date: "When possible", completed: false },
    { id: 3, text: "Update software", date: "When possible", completed: false },
  ]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedWateringTasks = await localStorage.getItem("wateringTasks");
        const savedSunlightTasks = await localStorage.getItem("sunlightTasks");
        const savedCompostingTasks =
          await localStorage.getItem("compostingTasks");

        if (savedWateringTasks)
          setWateringTasks(JSON.parse(savedWateringTasks));
        if (savedSunlightTasks)
          setSunlightTasks(JSON.parse(savedSunlightTasks));
        if (savedCompostingTasks)
          setCompostingTasks(JSON.parse(savedCompostingTasks));
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await localStorage.setItem(
          "wateringTasks",
          JSON.stringify(wateringTasks),
        );
        await localStorage.setItem(
          "sunlightTasks",
          JSON.stringify(sunlightTasks),
        );
        await localStorage.setItem(
          "compostingTasks",
          JSON.stringify(compostingTasks),
        );
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    };

    saveTasks();
  }, [wateringTasks, sunlightTasks, compostingTasks]);

  const handleTaskComplete = (taskId: number, category: string) => {
    // Get the position of the completed task before updating state
    const taskElement = taskRefs.current[taskId];
    if (taskElement) {
      const rect = taskElement.getBoundingClientRect();

      // Batch state updates
      const updateTasks = (tasks: any[]) =>
        tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        );

      // Update all states at once
      switch (category) {
        case "watering":
          setWateringTasks(updateTasks(wateringTasks));
          break;
        case "sunlight":
          setSunlightTasks(updateTasks(sunlightTasks));
          break;
        case "composting":
          setCompostingTasks(updateTasks(compostingTasks));
          break;
      }

      // Set confetti position and trigger after task update
      requestAnimationFrame(() => {
        setConfettiPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2 - 80,
        });
        setShowConfetti(true);

        // Clear the confetti after animation
        setTimeout(() => {
          setShowConfetti(false);
        }, 2000);
      });
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "watering" | "sunlight" | "composting" | null
  >(null);

  const handleAddTask = () => {
    if (!newTaskText.trim() || !activeCategory) return;

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      date: newTaskDate || "No date",
      completed: false,
    };

    switch (activeCategory) {
      case "watering":
        setWateringTasks([...wateringTasks, newTask]);
        break;
      case "sunlight":
        setSunlightTasks([...sunlightTasks, newTask]);
        break;
      case "composting":
        setCompostingTasks([...compostingTasks, newTask]);
        break;
    }

    // Reset form and close modal
    setNewTaskText("");
    setNewTaskDate("");
    setIsModalOpen(false);
    setActiveCategory(null);
  };

  const openAddTaskModal = (
    category: "watering" | "sunlight" | "composting",
  ) => {
    setActiveCategory(category);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      <AnimatePresence>
        {
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          ></motion.div>
        }
      </AnimatePresence>
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="content-container">
          <div className="home-header">
            <div className="welcome-section">
              <motion.h2
                className="content-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome Back, Vinay
              </motion.h2>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Let the flowers blossom today!
              </motion.p>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {new Date().toLocaleDateString()}
              </motion.p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="home-tabs">
            {(["tasks", "goals", "backlog"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                className={`home-tab-btn ${activeTab === tab ? "home-tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "tasks" && (
            <div>
              <h2 className="content-title">Watering Tasks</h2>
              <p className="content-text">These tasks move the needle</p>
              <Reorder.Group
                axis="y"
                values={wateringTasks}
                onReorder={setWateringTasks}
                className="task-box"
                layoutScroll
              >
                <AnimatePresence mode="popLayout">
                  {wateringTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <TaskItem
                        task={task}
                        category="watering"
                        onComplete={handleTaskComplete}
                        taskRefs={taskRefs}
                      />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
                <motion.div
                  className="add-task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTaskModal("watering")}
                >
                  <FaPlus className="add-task-plus" />
                  <span className="add-task-input">Add a new watering task...</span>
                </motion.div>
              </Reorder.Group>

              <h2 className="content-title" style={{ marginTop: "1.5rem" }}>Sunlight Tasks</h2>
              <p className="content-text">These tasks keep your goal alive</p>
              <Reorder.Group
                axis="y"
                values={sunlightTasks}
                onReorder={setSunlightTasks}
                className="task-box"
              >
                <AnimatePresence>
                  {sunlightTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      <TaskItem
                        task={task}
                        category="sunlight"
                        onComplete={handleTaskComplete}
                        taskRefs={taskRefs}
                      />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
                <motion.div
                  className="add-task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTaskModal("sunlight")}
                >
                  <FaPlus className="add-task-plus" />
                  <span className="add-task-input">Add a new sunlight task...</span>
                </motion.div>
              </Reorder.Group>

              <h2 className="content-title" style={{ marginTop: "1.5rem" }}>Composting</h2>
              <p className="content-text">These tasks are extraneous things not necessarily important</p>
              <Reorder.Group
                axis="y"
                values={compostingTasks}
                onReorder={setCompostingTasks}
                className="task-box"
              >
                <AnimatePresence>
                  {compostingTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                      <TaskItem
                        task={task}
                        category="composting"
                        onComplete={handleTaskComplete}
                        taskRefs={taskRefs}
                      />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
                <motion.div
                  className="add-task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTaskModal("composting")}
                >
                  <FaPlus className="add-task-plus" />
                  <span className="add-task-input">
                    Add a new composting task...
                  </span>
                </motion.div>
              </Reorder.Group>
            </div>
          )}

          {activeTab === "goals" && <Goals />}

          {activeTab === "backlog" && <Backlog />}
        </div>
      </div>
      <div className="calendar-container">
        <CustomCalendar />
        <GoalFocus />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setActiveCategory(null);
        }}
        className="task-modal-content"
        overlayClassName="task-modal"
        contentLabel="Add New Task"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="task-modal-title">
              Add New{" "}
              {activeCategory
                ? activeCategory.charAt(0).toUpperCase() +
                  activeCategory.slice(1)
                : ""}{" "}
              Task
            </h3>
            <motion.button
              className="modal-close-button"
              onClick={() => {
                setIsModalOpen(false);
                setActiveCategory(null);
              }}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="text"
              className="task-input"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task description..."
            />
            <input
              type="text"
              className="task-date-input"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              placeholder="Enter due date (optional)"
            />
            <div className="task-modal-buttons">
              <motion.button
                className="task-cancel-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setActiveCategory(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="task-save-button"
                onClick={handleAddTask}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave className="button-icon" />
                Add Task
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Home;
