import { BookOpen, Bot, LineChart, Shield, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Comprehensive Courses',
    description: 'From basics to advanced strategies. Master candlesticks, forex, crypto, and algorithmic trading.',
  },
  {
    icon: Bot,
    title: 'Proven Trading Bots',
    description: 'Access high-performance scripts with verified backtests and live trading results.',
  },
  {
    icon: LineChart,
    title: 'Real Performance Data',
    description: 'Transparent metrics including win rates, profit percentages, and drawdown statistics.',
  },
  {
    icon: Zap,
    title: 'Quick Deployment',
    description: 'Easy-to-use scripts for Python, MT5, and TradingView. Start trading in minutes.',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Learn professional risk management techniques to protect your capital.',
  },
  {
    icon: Users,
    title: 'Active Community',
    description: 'Join thousands of traders sharing strategies, tips, and success stories.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-slate-600">
            Powerful tools and resources designed to help you master trading and achieve consistent profitability
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-all duration-300 border border-slate-200 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-emerald-600 transition-colors">
                  <Icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
