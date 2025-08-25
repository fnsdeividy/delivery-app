"use client";

import { AnimationConfig, animationPresets } from "@/lib/animations";
import { HTMLMotionProps, motion, Variants } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

// Componente base para animações
interface AnimatedProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  animation?: keyof typeof animationPresets;
  config?: AnimationConfig;
  customVariants?: Variants;
  trigger?: "scroll" | "hover" | "mount";
  className?: string;
}

export function Animated({
  children,
  animation = "fadeIn",
  config = {},
  customVariants,
  trigger = "scroll",
  className = "",
  ...props
}: AnimatedProps) {
  // Temporariamente simplificado para evitar problemas de tipo
  const { style, ...divProps } = props as any;
  return (
    <div className={className} {...divProps}>
      {children}
    </div>
  );
}

// Componente específico para listas com stagger
interface StaggerListProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerList({
  children,
  staggerDelay = 0.1,
  className = "",
  ...props
}: StaggerListProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={animationPresets.stagger({
        stagger: isMobile ? staggerDelay * 0.7 : staggerDelay,
      })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Componente para itens de lista
interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  animation?: keyof typeof animationPresets;
  config?: AnimationConfig;
  className?: string;
}

export function StaggerItem({
  children,
  animation = "fadeIn",
  config = {},
  className = "",
  ...props
}: StaggerItemProps) {
  // Temporariamente simplificado para evitar problemas de tipo
  const { style, ...divProps } = props as any;
  return (
    <div className={className} {...divProps}>
      {children}
    </div>
  );
}

// Componente para hero sections
interface HeroProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function Hero({ children, className = "", ...props }: HeroProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animationPresets.hero({ mobile: isMobile })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Componente para cards com hover
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({
  children,
  className = "",
  ...props
}: AnimatedCardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={animationPresets.cardHover({ mobile: isMobile })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
