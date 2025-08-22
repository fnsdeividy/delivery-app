import { Variants } from 'framer-motion'

// Tipos para configuração de animações
export interface AnimationConfig {
  duration?: number
  delay?: number
  ease?: string
  stagger?: number
  mobile?: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
}

// Presets de animação base
export const animationPresets = {
  // Fade in com opções responsivas
  fadeIn: (config: AnimationConfig = {}): Variants => ({
    hidden: { 
      opacity: 0,
      y: config.mobile ? 20 : 30
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: config.duration || 0.6,
        delay: config.delay || 0,
        ease: config.ease || 'easeOut'
      }
    }
  }),

  // Slide in com direções responsivas
  slideIn: (direction: 'up' | 'down' | 'left' | 'right' = 'up', config: AnimationConfig = {}): Variants => {
    const mobileOffset = config.mobile ? 20 : 40
    const desktopOffset = config.mobile ? 30 : 60
    
    const getOffset = () => {
      switch (direction) {
        case 'up': return { y: mobileOffset }
        case 'down': return { y: -mobileOffset }
        case 'left': return { x: mobileOffset }
        case 'right': return { x: -mobileOffset }
        default: return { y: mobileOffset }
      }
    }

    return {
      hidden: { 
        opacity: 0,
        ...getOffset()
      },
      visible: { 
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: config.duration || 0.7,
          delay: config.delay || 0,
          ease: config.ease || 'easeOut'
        }
      }
    }
  },

  // Scale in com valores responsivos
  scaleIn: (config: AnimationConfig = {}): Variants => ({
    hidden: { 
      opacity: 0,
      scale: config.mobile ? 0.9 : 0.8
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: config.duration || 0.5,
        delay: config.delay || 0,
        ease: config.ease || 'easeOut'
      }
    }
  }),

  // Rotate in com rotação responsiva
  rotateIn: (config: AnimationConfig = {}): Variants => ({
    hidden: { 
      opacity: 0,
      rotate: config.mobile ? 5 : 10
    },
    visible: { 
      opacity: 1,
      rotate: 0,
      transition: {
        duration: config.duration || 0.6,
        delay: config.delay || 0,
        ease: config.ease || 'easeOut'
      }
    }
  }),

  // Stagger para listas com delay responsivo
  stagger: (config: AnimationConfig = {}): Variants => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: config.stagger || (config.mobile ? 0.1 : 0.15),
        delayChildren: config.delay || 0
      }
    }
  }),

  // Hero section com animação especial
  hero: (config: AnimationConfig = {}): Variants => ({
    hidden: { 
      opacity: 0,
      y: config.mobile ? 30 : 50
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: config.duration || 1,
        delay: config.delay || 0,
        ease: config.ease || 'easeOut'
      }
    }
  }),

  // Card hover com efeito responsivo
  cardHover: (config: AnimationConfig = {}): Variants => ({
    initial: { 
      scale: 1,
      y: 0
    },
    hover: { 
      scale: config.mobile ? 1.02 : 1.05,
      y: config.mobile ? -2 : -5,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: { 
      scale: 0.98
    }
  }),

  // Text reveal com efeito de digitação
  textReveal: (config: AnimationConfig = {}): Variants => ({
    hidden: { 
      opacity: 0,
      y: config.mobile ? 15 : 25
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: config.duration || 0.8,
        delay: config.delay || 0,
        ease: config.ease || 'easeOut'
      }
    }
  })
}

// Hook para detectar se é mobile
export const useIsMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

// Configurações padrão responsivas
export const responsiveConfig = {
  mobile: {
    duration: 0.5,
    stagger: 0.1,
    offset: 20
  },
  desktop: {
    duration: 0.7,
    stagger: 0.15,
    offset: 40
  }
}

// Função helper para criar animações responsivas
export const createResponsiveAnimation = (
  preset: keyof typeof animationPresets,
  options: AnimationConfig = {}
) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  return animationPresets[preset]({
    ...options,
    mobile: isMobile,
    duration: isMobile ? responsiveConfig.mobile.duration : responsiveConfig.desktop.duration,
    stagger: isMobile ? responsiveConfig.mobile.stagger : responsiveConfig.desktop.stagger
  })
} 