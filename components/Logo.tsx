interface LogoProps {
  className?: string
  showBadge?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', showBadge = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <h1 className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
        Cardap.IO
      </h1>
      {showBadge && (
        <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
          Multi-Tenant
        </span>
      )}
    </div>
  )
} 