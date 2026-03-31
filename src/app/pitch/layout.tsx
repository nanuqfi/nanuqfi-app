export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      {children}
    </div>
  )
}
