import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { BookOpen, PlayCircle, Clock, Award, TrendingUp, Download, Code2, Target, BarChart3 } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

// Equity Curve Chart Component - Bar Chart
function EquityCurveChart({ performanceData }: { performanceData: { month: string; profit: number }[] }) {
  // Calculate equity curve starting from 10000
  let equity = 10000;
  const equityCurve = performanceData.map((item) => {
    equity = equity * (1 + item.profit / 100);
    return { month: item.month, equity: Math.round(equity), profit: item.profit };
  });

  const maxProfit = Math.max(...performanceData.map(p => Math.abs(p.profit)), 1);

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="h-32 flex items-end justify-between gap-2">
        {performanceData.map((item, index) => {
          const height = (Math.abs(item.profit) / maxProfit) * 100;
          const isPositive = item.profit >= 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full">
              <div className="flex-1 w-full flex items-end">
                <div
                  className={`w-full ${isPositive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} transition-all rounded-t cursor-pointer relative group`}
                  style={{ height: `${Math.max(height, 15)}%` }}
                >
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    <div className="font-semibold">AED {equityCurve[index]?.equity.toLocaleString()}</div>
                    <div className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                      {item.profit > 0 ? '+' : ''}{item.profit}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{item.month}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm border-t border-slate-200 pt-2">
        <span className="text-slate-600">Starting: AED 10,000</span>
        <span className="font-semibold text-emerald-600">
          Current: AED {equityCurve[equityCurve.length - 1]?.equity.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
}

interface Enrollment {
  _id: string;
  course_id: Course;
  progress_percentage: number;
  createdAt: string;
}

interface Script {
  _id: string;
  title: string;
  description: string;
  script_type: string;
  price: number;
  win_rate: number;
  profit_percentage: number;
  performance_data: { month: string; profit: number }[];
}

interface PurchasedScript {
  purchase_id: string;
  purchased_at: string;
  script: Script;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [purchasedScripts, setPurchasedScripts] = useState<PurchasedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScriptType, setSelectedScriptType] = useState<string>('All');
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalLearningTime: 0,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch enrollments, stats, and purchased scripts in parallel
      const [enrollmentsData, statsData, scriptsData] = await Promise.all([
        api.getMyEnrollments(),
        api.getUserStats(),
        api.getMyPurchasedScripts().catch((err) => {
          console.error('Error fetching purchased scripts:', err);
          return [];
        }),
      ]);

      console.log('Purchased scripts data:', scriptsData); // Debug log

      // Filter out enrollments where course_id is null (deleted courses)
      const validEnrollments = enrollmentsData.filter(
        (enrollment: Enrollment) => enrollment.course_id !== null
      );

      // Filter out any scripts with null script data
      const validScripts = Array.isArray(scriptsData)
        ? scriptsData.filter((item: PurchasedScript) => item.script !== null && item.script !== undefined)
        : [];

      setEnrollments(validEnrollments);
      setPurchasedScripts(validScripts);
      setStats({
        totalCourses: validEnrollments.length,
        completedLessons: statsData.completedLessons || 0,
        totalLearningTime: statsData.totalMinutes || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleDownload = async (scriptId: string, scriptTitle: string) => {
    try {
      const response = await api.downloadScript(scriptId);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scriptTitle.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download script');
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

  // Get unique script types for filter
  const scriptTypes = ['All', ...new Set(purchasedScripts.map(item => item.script?.script_type).filter(Boolean))];

  // Filter scripts by selected type
  const filteredScripts = selectedScriptType === 'All'
    ? purchasedScripts
    : purchasedScripts.filter(item => item.script?.script_type === selectedScriptType);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      basics: 'bg-blue-100 text-blue-700',
      forex: 'bg-green-100 text-green-700',
      crypto: 'bg-orange-100 text-orange-700',
      algo: 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-pulse text-slate-400">Loading your dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h1>
          <p className="text-slate-600">Continue your learning journey</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-10 h-10 text-emerald-600" />
              <span className="text-3xl font-bold text-slate-900">{enrollments.length}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Enrolled Courses</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Code2 className="w-10 h-10 text-purple-600" />
              <span className="text-3xl font-bold text-slate-900">{purchasedScripts.length}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Trading Bots</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 text-blue-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.completedLessons}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Lessons Completed</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-orange-600" />
              <span className="text-3xl font-bold text-slate-900">{stats.totalLearningTime}</span>
            </div>
            <h3 className="text-slate-600 font-medium">Minutes Learned</h3>
          </div>
        </div>

        {/* Portfolio Overview with Combined Equity Curve */}
        {/* {purchasedScripts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Portfolio Overview</h2>
                <p className="text-slate-600 text-sm mt-1">Combined performance of all your trading bots</p>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
            </div> */}

        {/* Portfolio Stats */}
        {/* <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Total Scripts</div>
                <div className="text-2xl font-bold text-emerald-600">{purchasedScripts.length}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Avg Win Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(purchasedScripts.reduce((sum, item) => sum + (item.script?.win_rate || 0), 0) / purchasedScripts.length).toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Avg Profit</div>
                <div className="text-2xl font-bold text-purple-600">
                  +{(purchasedScripts.reduce((sum, item) => sum + (item.script?.profit_percentage || 0), 0) / purchasedScripts.length).toFixed(1)}%
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Total Investment</div>
                <div className="text-2xl font-bold text-orange-600">
                  AED {purchasedScripts.reduce((sum, item) => sum + (item.script?.price || 0), 0).toLocaleString()}
                </div>
              </div>
            </div> */}

        {/* Combined Equity Curve Chart */}
        {/* <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Combined Equity Curve</h3>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="h-64 flex items-end justify-between gap-3">
                  {(() => {
                    // Calculate combined equity curve from all scripts
                    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                    let combinedEquity = 10000 * purchasedScripts.length; // Starting with 10k per script

                    const combinedCurve = months.map((month, monthIndex) => {
                      let monthlyReturn = 0;
                      purchasedScripts.forEach(item => {
                        const perfData = item.script?.performance_data;
                        if (perfData && perfData[monthIndex]) {
                          monthlyReturn += perfData[monthIndex].profit;
                        }
                      });
                      const avgReturn = monthlyReturn / purchasedScripts.length;
                      combinedEquity = combinedEquity * (1 + avgReturn / 100);
                      return { month, equity: Math.round(combinedEquity), profit: avgReturn };
                    });

                    const maxProfit = Math.max(...combinedCurve.map(e => Math.abs(e.profit)), 1);

                    return combinedCurve.map((point, index) => {
                      const height = (Math.abs(point.profit) / maxProfit) * 100;
                      const isPositive = point.profit >= 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center h-full">
                          <div className="flex-1 w-full flex items-end">
                            <div
                              className={`w-full ${isPositive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} transition-all rounded-t cursor-pointer relative group`}
                              style={{ height: `${Math.max(height, 15)}%` }}
                            >
                              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10 shadow-lg">
                                <div className="font-semibold">AED {point.equity.toLocaleString()}</div>
                                <div className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                                  {point.profit > 0 ? '+' : ''}{point.profit.toFixed(1)}% avg
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 mt-2 font-medium">{point.month}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm border-t border-slate-200 pt-4">
                  <div>
                    <span className="text-slate-600">Starting Portfolio: </span>
                    <span className="font-semibold text-slate-900">AED {(10000 * purchasedScripts.length).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Current Value: </span>
                    <span className="font-bold text-emerald-600">
                      AED {(() => {
                        let equity = 10000 * purchasedScripts.length;
                        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                        months.forEach((_, monthIndex) => {
                          let avgReturn = 0;
                          purchasedScripts.forEach(item => {
                            const perfData = item.script?.performance_data;
                            if (perfData && perfData[monthIndex]) {
                              avgReturn += perfData[monthIndex].profit;
                            }
                          });
                          avgReturn = avgReturn / purchasedScripts.length;
                          equity = equity * (1 + avgReturn / 100);
                        });
                        return Math.round(equity).toLocaleString();
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Return: </span>
                    <span className="font-bold text-emerald-600">
                      +{(() => {
                        let equity = 10000 * purchasedScripts.length;
                        const startEquity = equity;
                        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                        months.forEach((_, monthIndex) => {
                          let avgReturn = 0;
                          purchasedScripts.forEach(item => {
                            const perfData = item.script?.performance_data;
                            if (perfData && perfData[monthIndex]) {
                              avgReturn += perfData[monthIndex].profit;
                            }
                          });
                          avgReturn = avgReturn / purchasedScripts.length;
                          equity = equity * (1 + avgReturn / 100);
                        });
                        return (((equity - startEquity) / startEquity) * 100).toFixed(1);
                      })()}%
                    </span>
                  </div>
                </div>
              </div>
            </div> */}

        {/* Individual Script Performance Comparison */}
        {/* <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Script Performance Comparison</h3>
              <div className="space-y-3">
                {purchasedScripts.map((item) => (
                  <div key={item.purchase_id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getScriptTypeColor(item.script?.script_type || '')}`}>
                        {item.script?.script_type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/script/${item.script?._id}`} className="font-medium text-slate-900 hover:text-emerald-600 truncate block">
                        {item.script?.title}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-slate-500">Win Rate</div>
                        <div className="font-semibold text-emerald-600">{item.script?.win_rate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-500">Profit</div>
                        <div className="font-semibold text-blue-600">+{item.script?.profit_percentage}%</div>
                      </div>
                      <div className="w-32">
                        {/* Mini performance bar */}
        {/* <div className="flex items-end h-8 space-x-0.5">
          {item.script?.performance_data?.map((point, idx) => {
            const maxP = Math.max(...(item.script?.performance_data?.map(p => Math.abs(p.profit)) || [1]));
            const h = (Math.abs(point.profit) / maxP) * 100;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-t ${point.profit >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
                  </div >
                ))
}
              </div >
            </div >
          </div >
        )} */}

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
            <Link
              to="/#courses"
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
            >
              <span>Explore More Courses</span>
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>


          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses yet</h3>
              <p className="text-slate-600 mb-6">Start your learning journey by enrolling in a course</p>
              <Link
                to="/"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => (
                <Link
                  key={enrollment._id}
                  to={`/course/${enrollment.course_id._id}`}
                  className="group border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryColor(enrollment.course_id.category)}`}>
                        {enrollment.course_id.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {enrollment.course_id.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {enrollment.course_id.description}
                    </p>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-semibold text-emerald-600">{enrollment.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        />
                      </div>
                    </div>


                    <button className="flex items-center space-x-2 text-emerald-600 font-medium group-hover:text-emerald-700">
                      <PlayCircle className="w-5 h-5" />
                      <span>Continue Learning</span>
                    </button>
                  </div>
                </Link>
              ))}

            </div>
          )}
        </div>

        {/* Purchased Scripts Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">My Trading Scripts</h2>
            <Link
              to="/#scripts"
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
            >

              <span>Browse More Scripts </span>
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>

          {/* Filter Buttons */}
          {purchasedScripts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {scriptTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedScriptType(type)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedScriptType === type
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {type} ({type === 'All' ? purchasedScripts.length : purchasedScripts.filter(s => s.script?.script_type === type).length})
                </button>
              ))}
            </div>
          )}

          {purchasedScripts.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No scripts yet</h3>
              <p className="text-slate-600 mb-6">Purchase trading bots to automate your strategies</p>
              <Link
                to="/#scripts"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Browse Scripts
              </Link>
            </div>
          ) : filteredScripts.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No {selectedScriptType} scripts</h3>
              <p className="text-slate-600 mb-4">You don't have any {selectedScriptType} scripts yet</p>
              <button
                onClick={() => setSelectedScriptType('All')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Show all scripts
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredScripts.map((item) => (
                <div
                  key={item.purchase_id}
                  className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getScriptTypeColor(item.script.script_type)}`}>
                        {item.script.script_type}
                      </span>
                      <div className="flex items-center space-x-2 text-emerald-600">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-semibold">{item.script.win_rate}% Win Rate</span>
                      </div>
                    </div>

                    <Link to={`/script/${item.script._id}`}>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-emerald-600 transition-colors">
                        {item.script.title}
                      </h3>
                    </Link>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {item.script.description}
                    </p>

                    {/* Mini Equity Chart */}
                    <div className="mb-4 bg-slate-50 rounded-lg p-3">
                      <div className="flex items-end justify-between h-16 space-x-1">
                        {/* {item.script.performance_data?.map((point, index) => {
                          const maxProfit = Math.max(...item.script.performance_data.map(p => Math.abs(p.profit)));
                          const height = (Math.abs(point.profit) / maxProfit) * 100;
                          return (
                            <div
                              key={index}
                              className={`flex-1 rounded-t ${point.profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                              style={{ height: `${height}%` }}
                              title={`${point.month}: ${point.profit > 0 ? '+' : ''}${point.profit}%`}
                            />
                          );
                        })} */}
                      </div>
                      {item.script.performance_data && item.script.performance_data.length > 0 ? (
                        <EquityCurveChart performanceData={item.script.performance_data} />
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-500 text-sm">
                          No performance data available
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDownload(item.script._id, item.script.title)}
                        className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <br></br>
        {/* Portfolio Overview with Combined Equity Curve */}
        {purchasedScripts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Portfolio Overview</h2>
                <p className="text-slate-600 text-sm mt-1">Combined performance of all your trading bots</p>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Total Scripts</div>
                <div className="text-2xl font-bold text-emerald-600">{purchasedScripts.length}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Avg Win Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {(purchasedScripts.reduce((sum, item) => sum + (item.script?.win_rate || 0), 0) / purchasedScripts.length).toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Avg Profit</div>
                <div className="text-2xl font-bold text-purple-600">
                  +{(purchasedScripts.reduce((sum, item) => sum + (item.script?.profit_percentage || 0), 0) / purchasedScripts.length).toFixed(1)}%
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Total Investment</div>
                <div className="text-2xl font-bold text-orange-600">
                  AED {purchasedScripts.reduce((sum, item) => sum + (item.script?.price || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Combined Equity Curve Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Combined Equity Curve</h3>
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="h-64 flex items-end justify-between gap-3">
                  {(() => {
                    // Calculate combined equity curve from all scripts
                    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                    let combinedEquity = 10000 * purchasedScripts.length; // Starting with 10k per script

                    const combinedCurve = months.map((month, monthIndex) => {
                      let monthlyReturn = 0;
                      purchasedScripts.forEach(item => {
                        const perfData = item.script?.performance_data;
                        if (perfData && perfData[monthIndex]) {
                          monthlyReturn += perfData[monthIndex].profit;
                        }
                      });
                      const avgReturn = monthlyReturn / purchasedScripts.length;
                      combinedEquity = combinedEquity * (1 + avgReturn / 100);
                      return { month, equity: Math.round(combinedEquity), profit: avgReturn };
                    });

                    const maxProfit = Math.max(...combinedCurve.map(e => Math.abs(e.profit)), 1);

                    return combinedCurve.map((point, index) => {
                      const height = (Math.abs(point.profit) / maxProfit) * 100;
                      const isPositive = point.profit >= 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center h-full">
                          <div className="flex-1 w-full flex items-end">
                            <div
                              className={`w-full ${isPositive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'} transition-all rounded-t cursor-pointer relative group`}
                              style={{ height: `${Math.max(height, 15)}%` }}
                            >
                              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap z-10 shadow-lg">
                                <div className="font-semibold">AED {point.equity.toLocaleString()}</div>
                                <div className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                                  {point.profit > 0 ? '+' : ''}{point.profit.toFixed(1)}% avg
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 mt-2 font-medium">{point.month}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm border-t border-slate-200 pt-4">
                  <div>
                    <span className="text-slate-600">Starting Portfolio: </span>
                    <span className="font-semibold text-slate-900">AED {(10000 * purchasedScripts.length).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Current Value: </span>
                    <span className="font-bold text-emerald-600">
                      AED {(() => {
                        let equity = 10000 * purchasedScripts.length;
                        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                        months.forEach((_, monthIndex) => {
                          let avgReturn = 0;
                          purchasedScripts.forEach(item => {
                            const perfData = item.script?.performance_data;
                            if (perfData && perfData[monthIndex]) {
                              avgReturn += perfData[monthIndex].profit;
                            }
                          });
                          avgReturn = avgReturn / purchasedScripts.length;
                          equity = equity * (1 + avgReturn / 100);
                        });
                        return Math.round(equity).toLocaleString();
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Return: </span>
                    <span className="font-bold text-emerald-600">
                      +{(() => {
                        let equity = 10000 * purchasedScripts.length;
                        const startEquity = equity;
                        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                        months.forEach((_, monthIndex) => {
                          let avgReturn = 0;
                          purchasedScripts.forEach(item => {
                            const perfData = item.script?.performance_data;
                            if (perfData && perfData[monthIndex]) {
                              avgReturn += perfData[monthIndex].profit;
                            }
                          });
                          avgReturn = avgReturn / purchasedScripts.length;
                          equity = equity * (1 + avgReturn / 100);
                        });
                        return (((equity - startEquity) / startEquity) * 100).toFixed(1);
                      })()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Script Performance Comparison */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Script Performance Comparison</h3>
              <div className="space-y-3">
                {purchasedScripts.map((item) => (
                  <div key={item.purchase_id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getScriptTypeColor(item.script?.script_type || '')}`}>
                        {item.script?.script_type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/script/${item.script?._id}`} className="font-medium text-slate-900 hover:text-emerald-600 truncate block">
                        {item.script?.title}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-slate-500">Win Rate</div>
                        <div className="font-semibold text-emerald-600">{item.script?.win_rate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-500">Profit</div>
                        <div className="font-semibold text-blue-600">+{item.script?.profit_percentage}%</div>
                      </div>
                      <div className="w-32">
                        {/* Mini performance bar */}
                        <div className="flex items-end h-8 space-x-0.5">
                          {item.script?.performance_data?.map((point, idx) => {
                            const maxP = Math.max(...(item.script?.performance_data?.map(p => Math.abs(p.profit)) || [1]));
                            const h = (Math.abs(point.profit) / maxP) * 100;
                            return (
                              <div
                                key={idx}
                                className={`flex-1 rounded-t ${point.profit >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                                style={{ height: `${h}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div >
                ))
                }
              </div >
            </div >
          </div >
        )}


        <div>
          {/* <a><b className='text-emerald-600 shadow-md border border-slate-200'>More courses</b> </a> */}
        </div>
      </div >
    </div >
  );
}
