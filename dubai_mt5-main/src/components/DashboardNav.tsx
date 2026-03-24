import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, LogOut, User, BookOpen, ShoppingBag } from 'lucide-react';

export default function DashboardNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">TradeAcademy</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">My Courses</span>
            </Link>

            <Link
              to="/"
              className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Browse</span>
            </Link>

            <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700 hidden md:inline">{user?.email}</span>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-slate-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
