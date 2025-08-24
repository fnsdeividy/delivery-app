'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { animationPresets, AnimationConfig, Variants } from '@/lib/animations'

// Componente base para animações
interface AnimatedProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  animation?: keyof typeof animationPresets
  config?: AnimationConfig
  customVariants?: Variants
  trigger?: 'scroll' | 'hover' | 'mount'
  className?: string
}

export function Animated({
  children,
  animation = 'fadeIn',
  config = {},
  customVariants,
  trigger = 'scroll',
  className = '',
  ...props
}: AnimatedProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const variants = customVariants || animationPresets[animation]({
    ...config,
    mobile: isMobile
  })

  if (trigger === 'mount') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  if (trigger === 'hover') {
    return (
      <motion.div
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={variants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  // Scroll trigger (padrão)
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente específico para listas com stagger
interface StaggerListProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerList({ children, staggerDelay = 0.1, className = '', ...props }: StaggerListProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={animationPresets.stagger({
        stagger: isMobile ? staggerDelay * 0.7 : staggerDelay
      })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para itens de lista
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  animation?: keyof typeof animationPresets
  config?: AnimationConfig
  className?: string
}

export function StaggerItem({ 
  children, 
  animation = 'fadeIn', 
  config = {}, 
  className = '',
  ...props 
}: StaggerItemProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const variants = animationPresets[animation]({
    ...config,
    mobile: isMobile
  })

  return (
    <motion.div
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Componente para hero sections
interface HeroProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
}

export function Hero({ children, className = '', ...props }: HeroProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
  )
}

// Componente para cards com hover
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
}

export function AnimatedCard({ children, className = '', ...props }: AnimatedCardProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
  )
} 