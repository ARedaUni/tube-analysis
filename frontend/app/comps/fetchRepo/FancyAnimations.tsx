import React from "react";
import { motion } from "framer-motion";

export const FancyAnimations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};