export function Header() {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-white/20">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gabay-teal to-gabay-blue flex items-center justify-center">
                        <span className="text-xl">🏥</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            MyNaga Gabay
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Bikolano Health Assistant
                        </p>
                    </div>
                </div>

                <nav className="flex items-center gap-4">
                    <button className="p-2 rounded-lg hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </nav>
            </div>
        </header>
    );
}
