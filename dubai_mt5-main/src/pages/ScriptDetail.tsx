import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { TrendingUp, TrendingDown, Target, Activity, CheckCircle, ShoppingCart, ArrowLeft, Download, Code2, BarChart3 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

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
  whats_included: string[];
  performance_data: { month: string; profit: number }[];
}

export default function ScriptDetail() {
  const { scriptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [script, setScript] = useState<Script | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScriptData = async () => {
      try {
        if (scriptId) {
          const scriptData = await api.getScript(scriptId);
          setScript(scriptData);

          if (user) {
            try {
              const purchaseData = await api.checkScriptPurchase(scriptId);
              setIsPurchased(purchaseData.purchased);
            } catch (error) {
              console.error('Error checking purchase:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching script:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScriptData();
  }, [scriptId, user]);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/register');
    } else if (isPurchased) {
      // Download the script
      try {
        const response = await api.downloadScript(scriptId!);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${script?.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download script');
      }
    } else {
      navigate(`/checkout/script/${scriptId}`);
    }
  };

  const getScriptTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Python: 'bg-blue-100 text-blue-700',
      MT5: 'bg-green-100 text-green-700',
      TradingView: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const calculateEquityCurve = (performanceData: { month: string; profit: number }[]) => {
    let equity = 10000;
    return performanceData.map((item) => {
      equity = equity * (1 + item.profit / 100);
      return { month: item.month, equity: Math.round(equity) };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="animate-pulse text-slate-400">Loading script...</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <p className="text-slate-600">Script not found</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const equityCurve = calculateEquityCurve(script.performance_data);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center space-x-2 text-slate-300 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Scripts</span>
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4 ${getScriptTypeColor(script.script_type)}`}>
                  {script.script_type}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{script.title}</h1>
                <p className="text-xl text-slate-300 mb-6">{script.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-emerald-400 text-2xl font-bold">{script.win_rate}%</div>
                    <div className="text-sm text-slate-300">Win Rate</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-blue-400 text-2xl font-bold">+{script.profit_percentage}%</div>
                    <div className="text-sm text-slate-300">Total Profit</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-orange-400 text-2xl font-bold">{script.max_drawdown}</div>
                    <div className="text-sm text-slate-300">Max Drawdown</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-purple-400 text-2xl font-bold">{script.sharpe_ratio}</div>
                    <div className="text-sm text-slate-300">Calmar</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-xl p-6 text-slate-900">
                  {isPurchased ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Already Purchased</span>
                      </div>
                      {/* <p className="text-sm text-slate-600">You own this script</p> */}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold mb-4">
                      {Number(script.price).toLocaleString("en-AE", {
                        style: "currency",
                        currency: "AED",
                      })}
                    </div>
                  )}

                  <button
                    onClick={handlePurchase}
                    className={`w-full py-4 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mb-4 ${isPurchased
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                  >
                    {isPurchased ? (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Script</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>{user ? 'Purchase Now' : 'Sign up to Purchase'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-sm text-slate-600 mb-4">
                    Instant download after purchase
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total trades</span>
                      <span className="font-semibold">{script.total_trades}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Platform</span>
                      <span className="font-semibold">{script.script_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Updates</span>
                      <span className="font-semibold">Lifetime</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Support</span>
                      <span className="font-semibold">Included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Equity Curve</h2>
                <div className="bg-slate-50 rounded-lg p-6">
                  {(() => {
                    const maxEquity = Math.max(...equityCurve.map(e => e.equity));
                    const minEquity = Math.min(...equityCurve.map(e => e.equity), 10000);
                    const range = maxEquity - minEquity || 1;
                    const padding = range * 0.1;
                    const chartMin = minEquity - padding;
                    const chartMax = maxEquity + padding;
                    const chartRange = chartMax - chartMin;

                    // Generate points for the line
                    const points = equityCurve.map((point, index) => {
                      const x = (index / (equityCurve.length - 1)) * 100;
                      const y = 100 - ((point.equity - chartMin) / chartRange) * 100;
                      return { x, y, ...point };
                    });

                    // Create SVG path
                    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaPath = `${linePath} L 100 100 L 0 100 Z`;

                    return (
                      <div className="relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-slate-500">
                          <span>AED {Math.round(chartMax).toLocaleString()}</span>
                          <span>AED {Math.round((chartMax + chartMin) / 2).toLocaleString()}</span>
                          <span>AED {Math.round(chartMin).toLocaleString()}</span>
                        </div>

                        {/* Chart area */}
                        <div className="ml-20">
                          <div className="relative h-64">
                            <svg
                              className="w-full h-full"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              {/* Grid lines */}
                              <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.5" />
                              <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
                              <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
                              <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
                              <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="0.5" />

                              {/* Area fill */}
                              <defs>
                                <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                                </linearGradient>
                              </defs>
                              <path d={areaPath} fill="url(#equityGradient)" />

                              {/* Line */}
                              <path
                                d={linePath}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>

                            {/* Data points with tooltips */}
                            <div className="absolute inset-0">
                              {points.map((point, index) => (
                                <div
                                  key={index}
                                  className="absolute group"
                                  style={{
                                    left: `${point.x}%`,
                                    top: `${point.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                >
                                  <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-150 transition-transform" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-20 shadow-lg">
                                    <div className="font-semibold">AED {point.equity.toLocaleString()}</div>
                                    <div className="text-slate-300">{point.month}</div>
                                    <div className="text-emerald-400">
                                      {index > 0 ? (
                                        `${script.performance_data[index].profit > 0 ? '+' : ''}${script.performance_data[index].profit}%`
                                      ) : 'Start'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* X-axis labels */}
                          <div className="flex justify-between mt-2 text-xs text-slate-500">
                            {equityCurve.map((point, index) => (
                              <span key={index} className="font-medium">{point.month}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600 border-t border-slate-200 pt-4">
                    <div className="font-semibold text-emerald-600">Starting: AED 10,000</div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-0.5 bg-emerald-500"></span>
                      <span className="text-slate-500">Equity Growth</span>
                    </div>
                    <div className="font-semibold text-emerald-600">Current: AED {equityCurve[equityCurve.length - 1]?.equity.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Monthly Performance
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                  {script.performance_data?.map((item, index) => (

                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${item.profit >= 0
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                        }`}
                    >
                      <div className="text-sm text-slate-600 mb-1">
                        {item.month}
                      </div>

                      <div
                        className={`text-2xl font-bold ${item.profit >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                          }`}
                      >
                        {item.profit > 0 ? "+" : ""}
                        {item.profit}%
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        {/* Drawdown: {item.drawdown}% */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {script.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What's Included</h2>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start space-x-3">
                    <Code2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Complete source code with documentation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <BarChart3 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Backtest results and performance reports</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Installation and setup guide</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Lifetime updates and improvements</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Email support for technical issues</span>
                  </li>
                </ul>
                {/* <div className="grid md:grid-cols-2 gap-4">
                  {script.whats_included.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div> */}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-slate-600 font-medium">Win Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">{script.win_rate}%</div>
                    <div className="text-xs text-slate-600 mt-1">Based on {script.total_trades} trades</div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-slate-600 font-medium">Total Return</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">+{script.profit_percentage}%</div>
                    <div className="text-xs text-slate-600 mt-1">Over 6 month period</div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-slate-600 font-medium">Max Drawdown</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">{script.max_drawdown}%</div>
                    <div className="text-xs text-slate-600 mt-1">Peak to trough decline</div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-slate-600 font-medium">Sharpe Ratio</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{script.sharpe_ratio}</div>
                    <div className="text-xs text-slate-600 mt-1">Risk-adjusted return</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-600 space-y-2">
                    <p className="font-semibold">Disclaimer:</p>
                    <p>Past performance is not indicative of future results. Trading involves risk and may not be suitable for all investors.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
