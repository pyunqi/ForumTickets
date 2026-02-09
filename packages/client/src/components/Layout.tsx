import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useEmbed } from '../context/EmbedContext';
import { useLanguage } from '../i18n';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isEmbed } = useEmbed();
  const { language, setLanguage, t } = useLanguage();

  if (isEmbed) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="bg-[#1a365d] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-serif font-bold text-[#c9a227]">
            {t.footer.forumName}
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-gray-200 hover:text-[#c9a227] transition-colors text-sm">
              {t.common.home}
            </Link>
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="px-3 py-1 border border-[#c9a227]/50 text-[#c9a227] text-xs rounded hover:bg-[#c9a227]/10 transition-colors"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-[#1a365d] border-t border-[#c9a227]/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          {t.hero.title} - {t.tickets.label}
        </div>
      </footer>
    </div>
  );
}
