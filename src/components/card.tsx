interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ children, className = '', header, footer }: CardProps) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-slate-700">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-700">
          {footer}
        </div>
      )}
    </div>
  )
}
