"use client";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React from "react";

type Props = {
  i: number;
  area: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const BentoTile = ({ i, area, href, children, className, style }: Props) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      style={{ gridArea: area, ...style }}
      className={`overflow-hidden rounded-2xl${className ? ` ${className}` : ""}`}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : {
        delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduce ? undefined : {
        scale: 1.015,
        transition: { type: "spring", stiffness: 400, damping: 28 },
      }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
    >
      {href ? (
        <Link href={href} className="block h-full w-full focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-[var(--olive)] focus-visible:ring-offset-2">
          {children}
        </Link>
      ) : children}
    </motion.div>
  );
};
