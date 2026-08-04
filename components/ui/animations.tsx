"use client";

import React from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";

interface AnimationProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, delay = 0, duration = 0.5, ...props }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0, duration = 0.6, yOffset = 24, ...props }: AnimationProps & { yOffset?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -yOffset }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScrollReveal({ children, delay = 0, duration = 0.6, yOffset = 30, ...props }: AnimationProps & { yOffset?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
};

export const popInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
};

export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export function PopIn({ children, delay = 0, ...props }: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ type: "spring", damping: 18, stiffness: 260, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedSection({ children, className = "", delay = 0, yOffset = 30, ...props }: AnimationProps & { yOffset?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function HoverCard({ children, className = "", ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
