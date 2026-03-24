import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: 'course' | 'script';
}

export default function Checkout() {
  const { type, itemId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (itemId && type) {
      fetchItem();
    }
  }, [itemId, type]);

  const fetchItem = async () => {
    try {
      if (type === 'course') {
        const data = await api.getCourse(itemId!);
        setItem({ ...data, type: 'course' });
      } else if (type === 'script') {
        const data = await api.getScript(itemId!);
        setItem({ ...data, type: 'script' });
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    }
    setLoading(false);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      if (item?.type === 'course') {
        await api.enrollCourse(item._id);
      } else if (item?.type === 'script') {
        await api.purchaseScript(item._id);
      }

      setSuccess(true);
      setTimeout(() => {
        if (item?.type === 'course') {
          navigate(`/course/${item._id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      if (err.message.includes('Already enrolled')) {
        setError('You are already enrolled in this course');
      } else if (err.message.includes('already purchased')) {
        setError('You have already purchased this script');
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-pulse text-slate-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-slate-600">Item not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Purchase</h1>
          <p className="text-slate-600">Secure checkout powered by TradeAcademy</p>
        </div>

        {success && (
          <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-900 mb-1">Purchase Successful!</h3>
              <p className="text-sm text-emerald-800">
                {item.type === 'course'
                  ? 'You are now enrolled in this course. Redirecting...'
                  : 'Your script has been purchased. Redirecting to dashboard...'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Information</h2>

              <form onSubmit={handlePurchase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">For demo: Use 4242 4242 4242 4242</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing || success}
                  className="w-full bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Lock className="w-5 h-5" />
                  {/* <span>{processing ? 'Processing...' : `Pay $${item.price}`}</span> */}
                  <span>
                    {processing
                      ? 'Processing...'
                      : `Pay ${new Intl.NumberFormat('en-AE', {
                        style: 'currency',
                        currency: 'AED',
                      }).format(item.price)}`}
                  </span>

                </button>

                <p className="text-xs text-slate-500 text-center">
                  Your payment information is secure and encrypted
                </p>
              </form>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>
                      {new Intl.NumberFormat('en-AE', {
                        style: 'currency',
                        currency: 'AED',
                      }).format(item.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>
                      {new Intl.NumberFormat('en-AE', {
                        style: 'currency',
                        currency: 'AED',
                      }).format(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat('en-AE', {
                        style: 'currency',
                        currency: 'AED',
                      }).format(item.price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Instant access after payment</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Lifetime access to content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
