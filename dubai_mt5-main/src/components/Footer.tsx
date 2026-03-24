import { TrendingUp, Mail, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">TradeAcademy</span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Empowering traders worldwide with expert education and cutting-edge algorithmic trading solutions.
              Join thousands of successful traders on their journey to financial freedom.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#courses" className="hover:text-emerald-500 transition-colors">Courses</a></li>
              <li><a href="#scripts" className="hover:text-emerald-500 transition-colors">Trading Bots</a></li>
              <li><a href="#features" className="hover:text-emerald-500 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} TradeAcademy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-400 hover:text-emerald-500 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-emerald-500 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-emerald-500 text-sm transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
