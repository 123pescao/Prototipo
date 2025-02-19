import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AnimatedHeader() {
  const comments = [
    "🚀 Monitor Your Websites in Real Time! 🌍⚡",
    "🔥 Get instant alerts when a site goes down!",
    "📊 View performance stats with interactive charts!",
    "⚡ Track uptime and response speed effortlessly!",
  ];

  const [index, setIndex] = useState(0);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < comments.length - 1) {
        setIndex((prevIndex) => prevIndex + 1);
      } else {
        setShowText(false); // Hides text after the last message
      }
    }, 5000); // Each message lasts 5 seconds

    return () => clearInterval(interval);
  }, [index]);

  return (
    <motion.div className="text-center mt-6">
      {showText && (
        <motion.p
          key={index} // Forces re-render for animation
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 1 }}
          className="text-6xl font-extrabold text-green-400 drop-shadow-lg font-mono"
        >
          {comments[index]}
        </motion.p>
      )}
    </motion.div>
  );
}
