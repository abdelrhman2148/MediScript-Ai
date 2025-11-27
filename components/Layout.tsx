import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string } | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <span className="text-xl font-bold text-slate-800">MediScript AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className={`text-sm font-medium ${isActive('/') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/upload')}
              className={`text-sm font-medium ${isActive('/upload') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Upload
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:block">Dr. {user.name}</span>
            <button 
              onClick={onLogout}
              className="text-sm text-slate-500 hover:text-red-600 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;