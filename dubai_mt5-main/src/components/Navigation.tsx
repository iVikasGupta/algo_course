import { Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900">TradeAcademy</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-slate-700 hover:text-emerald-600 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('courses')} className="text-slate-700 hover:text-emerald-600 transition-colors">
              Courses
            </button>
            <button onClick={() => scrollToSection('scripts')} className="text-slate-700 hover:text-emerald-600 transition-colors">
              Scripts
            </button>
            <button onClick={() => scrollToSection('features')} className="text-slate-700 hover:text-emerald-600 transition-colors">
              Features
            </button>
            {user ? (
              <Link to="/dashboard" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Get Started
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-slate-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left text-slate-700 hover:text-emerald-600 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('courses')} className="block w-full text-left text-slate-700 hover:text-emerald-600 transition-colors">
              Courses
            </button>
            <button onClick={() => scrollToSection('scripts')} className="block w-full text-left text-slate-700 hover:text-emerald-600 transition-colors">
              Scripts
            </button>
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-slate-700 hover:text-emerald-600 transition-colors">
              Features
            </button>
            {user ? (
              <Link to="/dashboard" className="block w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="block w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center">
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
