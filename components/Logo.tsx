interface LogoProps {
  className?: string
  showBadge?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', showBadge = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg sm:text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <h1 className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
        Cardap.IO
      </h1>
    </div>
  )
} 