import { ExternalLink, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Wordmark */}
        <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
          Nanuq<span className="text-sky-500">Fi</span>
        </span>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a
            href="https://github.com/nanuqfi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://x.com/nanuqfi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
          >
            <Twitter className="w-4 h-4" />
            X
            <ExternalLink className="w-3 h-3" />
          </a>

          <span className="inline-flex items-center gap-1.5 text-slate-600">
            Built on{' '}
            <span className="text-slate-400 font-medium">Solana</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
