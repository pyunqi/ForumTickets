import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Forum Tickets
          </Link>
          <nav className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              首页
            </Link>
            <Link to="/admin/login" className="text-gray-600 hover:text-gray-900">
              管理后台
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          Forum Tickets - 票务预定系统
        </div>
      </footer>
    </div>
  );
}
