import { TrendingUp, TrendingDown, Target, Activity, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Script {
  _id: string;
  title: string;
  description: string;
  script_type: string;
  price: number;
  win_rate: number;
  total_trades: number;
  profit_percentage: number;
  max_drawdown: number;
  sharpe_ratio: number;
  features: string[];
  performance_data: { month: string; profit: number }[];
}

interface ScriptsProps {
  scripts: Script[];
  loading: boolean;
  purchasedScriptIds?: string[];
}

const getScriptTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Python: 'bg-blue-100 text-blue-700',
    MT5: 'bg-green-100 text-green-700',
    TradingView: 'bg-orange-100 text-orange-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

function PerformanceChart({ data }: { data: { month: string; profit: number }[] }) {
  const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)));
  const chartHeight = 120;

  return (
    <div className="relative h-32 bg-slate-50 rounded-lg p-4">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => {
          const height = (Math.abs(item.profit) / maxProfit) * chartHeight;
          const isPositive = item.profit >= 0;

          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end group relative">
              <div
                className={`w-full rounded-t transition-all ${isPositive ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-red-500 group-hover:bg-red-600'
                  }`}
                style={{ height: `${height}px` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.month}: {item.profit > 0 ? '+' : ''}{item.profit}%
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">{item.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Scripts({ scripts, loading, purchasedScriptIds = [] }: ScriptsProps) {
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Python', 'MT5', 'TradingView'];
  const filteredScripts = selectedType === 'All'
    ? scripts
    : scripts.filter(s => s.script_type === selectedType);

  if (loading) {
    return (
      <section id="scripts" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse text-slate-400">Loading scripts...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="scripts" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            High-Performance Trading Bots
          </h2>
          <p className="text-xl text-slate-600">
            Battle-tested algorithms with proven track records and transparent performance metrics
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${selectedType === type
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {filteredScripts.map((script) => (
            <div
              key={script._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group border border-slate-200"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getScriptTypeColor(script.script_type)}`}>
                    {script.script_type}
                  </span>
                  <div className="text-right">
                    {purchasedScriptIds.includes(script._id) ? (
                      <div className="flex items-center space-x-2 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Purchased</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-slate-900">
                        {Number(script.price).toLocaleString("en-AE", {
                          style: "currency",
                          currency: "AED",
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <Link to={`/script/${script._id}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {script.title}
                  </h3>
                </Link>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  {script.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-slate-600 font-medium">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{script.win_rate}%</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-slate-600 font-medium">Total Profit</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">+{script.profit_percentage}%</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-slate-600 font-medium">Max Drawdown</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{script.max_drawdown}%</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-slate-600 font-medium">Calmar</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{script.sharpe_ratio}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                    <span>6-Month Performance</span>
                  </h4>
                  <PerformanceChart data={script.performance_data} />
                  <div className="text-xs text-slate-500 mt-2 text-center">
                    {script.total_trades} total trades executed
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {script.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={`/script/${script._id}`}
                  className={`w-full px-6 py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg ${purchasedScriptIds.includes(script._id)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                  <span>{purchasedScriptIds.includes(script._id) ? 'View & Download' : 'View Details'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
