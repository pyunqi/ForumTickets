import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-xl font-bold text-blue-600">
              管理后台
            </Link>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              返回前台
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {admin?.username}
              {admin?.role === 'super_admin' && (
                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  超级管理员
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
