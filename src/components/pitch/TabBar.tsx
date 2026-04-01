interface TabBarProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50">
      <div className="flex gap-2 justify-center py-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={
              tab === activeTab
                ? 'bg-sky-500/20 text-sky-400 px-5 py-2 rounded-full text-sm font-medium transition-all'
                : 'text-slate-400 px-5 py-2 rounded-full text-sm font-medium hover:text-slate-200 hover:bg-slate-800/50 transition-all'
            }
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
