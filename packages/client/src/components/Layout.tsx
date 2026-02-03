import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="bg-[#1a365d] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-serif font-bold text-[#c9a227]">
            学术论坛 2026
          </Link>
          <nav className="space-x-6">
            <Link to="/" className="text-gray-200 hover:text-[#c9a227] transition-colors text-sm">
              首页
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-[#1a365d] border-t border-[#c9a227]/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          第十二届国际学术论坛 - 注册报名系统
        </div>
      </footer>
    </div>
  );
}
