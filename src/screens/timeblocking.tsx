import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash } from "react-icons/fa";
import "../styles/TimeBlocking.css";
import CustomCalendar from "../components/calendar";

interface Event {
  id: string;
  title: string;
  description?: string;
  color?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  events: Event[];
}

//add to supabase
const TimeBlocking = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    // Generate time slots from 12 AM to 11:59 PM
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push({
        id: `${hour}-00`,
        time,
        events: [],
      });
    }
    return slots;
  });

  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");

  // Load saved time slots from localStorage
  useEffect(() => {
    const savedSlots = localStorage.getItem("timeSlots");
    if (savedSlots) {
      setTimeSlots(JSON.parse(savedSlots));
    }
  }, []);

  // Save time slots to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timeSlots", JSON.stringify(timeSlots));
  }, [timeSlots]);

  const handleAddEvent = (slotId: string) => {
    setEditingSlot(slotId);
    setNewEventTitle("");
    setNewEventDescription("");
  };

  const handleSaveEvent = (slotId: string) => {
    if (!newEventTitle.trim()) return;

    const newEvent: Event = {
      id: Date.now().toString(),
      title: newEventTitle,
      description: newEventDescription,
      color: `hsl(${Math.random() * 360}, 70%, 80%)`,
    };

    setTimeSlots((slots) =>
      slots.map((slot) =>
        slot.id === slotId
          ? { ...slot, events: [...slot.events, newEvent] }
          : slot
      )
    );
    setEditingSlot(null);
    setNewEventTitle("");
    setNewEventDescription("");
  };

  const handleDeleteEvent = (slotId: string, eventId: string) => {
    setTimeSlots((slots) =>
      slots.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              events: slot.events.filter((event) => event.id !== eventId),
            }
          : slot
      )
    );
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          <motion.h2
            className="content-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Time Blocking
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            A easy way to manage your time and get things done
          </motion.p>

          <div className="time-blocking-container">
            <AnimatePresence>
              {timeSlots.map((slot) => (
                <motion.div
                  key={slot.id}
                  className="time-slot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="time-slot-header">
                    <span className="time-label">{formatTime(slot.time)}</span>
                    <motion.button
                      className="add-event-btn"
                      onClick={() => handleAddEvent(slot.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaPlus />
                    </motion.button>
                  </div>

                  {editingSlot === slot.id ? (
                    <motion.div
                      className="event-input-container"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <input
                        type="text"
                        placeholder="Event title..."
                        className="event-input"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="Event description (optional)..."
                        className="event-input"
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                      />
                      <div className="event-input-buttons">
                        <button
                          className="save-event-btn"
                          onClick={() => handleSaveEvent(slot.id)}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-event-btn"
                          onClick={() => setEditingSlot(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : null}

                  <div className="events-container">
                    {slot.events.map((event) => (
                      <motion.div
                        key={event.id}
                        className="event-display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ backgroundColor: event.color }}
                      >
                        <div className="event-content">
                          <span className="event-title">{event.title}</span>
                          {event.description && (
                            <span className="event-description">
                              {event.description}
                            </span>
                          )}
                        </div>
                        <motion.button
                          className="delete-event-btn"
                          onClick={() => handleDeleteEvent(slot.id, event.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTrash />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="calendar-container">
        <CustomCalendar />
      </div>
    </div>
  );
};

export default TimeBlocking;
