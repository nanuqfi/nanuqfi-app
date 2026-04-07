import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary: 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25',
  secondary: 'glass border-slate-700 text-slate-200 hover:bg-white/5',
  ghost: 'border border-slate-700 text-slate-300 hover:bg-white/5',
  danger: 'bg-red-500/15 border-red-500/30 text-red-300 hover:bg-red-500/25',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'font-semibold border backdrop-blur-md transition-all duration-150 ease-out active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
