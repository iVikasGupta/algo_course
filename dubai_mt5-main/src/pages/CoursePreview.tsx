import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PlayCircle, Lock, CheckCircle2, Clock, BarChart, Users, Award, Star, ArrowLeft, ShoppingCart } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  level: string;
  what_you_learn: string[];
  course_requirements: string[];
  who_this_course_is_for: string[];
}

interface Lesson {
  _id: string;
  title: string;
  order: number;
  is_free_preview: boolean;
}

export default function CoursePreview() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
    fetchLessons();
  }, [courseId]);

  useEffect(() => {
    if (user && courseId) {
      checkEnrollmentStatus();
    }
  }, [user, courseId]);

  const fetchCourseData = async () => {
    try {
      const courseData = await api.getCourse(courseId!);
      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
    setLoading(false);
  };

  const fetchLessons = async () => {
    try {
      const lessonsData = await api.getLessonsByCourse(courseId!);
      setLessons(lessonsData);
      // Select first free lesson by default
      const firstFree = lessonsData.find((l: Lesson) => l.is_free_preview);
      if (firstFree) setSelectedLesson(firstFree);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const { isEnrolled: enrolled } = await api.checkEnrollment(courseId!);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/register');
    } else if (isEnrolled) {
      navigate(`/course/${courseId}`);
    } else {
      navigate(`/checkout/course/${courseId}`);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      basics: 'bg-blue-100 text-blue-700',
      forex: 'bg-green-100 text-green-700',
      crypto: 'bg-orange-100 text-orange-700',
      algo: 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const totalLessons = lessons.length;
  const freeLessons = lessons.filter(l => l.is_free_preview).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="animate-pulse text-slate-400">Loading course...</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <p className="text-slate-600">Course not found</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="pt-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center space-x-2 text-slate-300 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Courses</span>
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4 ${getCategoryColor(course.category)}`}>
                  {course.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-slate-300 mb-6">{course.description}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span>4.8 rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>1,243 students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-xl p-6 text-slate-900">
                  {selectedLesson && selectedLesson.is_free_preview && (
                    <div className="aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  {isEnrolled ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Already Enrolled</span>
                      </div>
                      <p className="text-sm text-slate-600">You have access to this course</p>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold mb-4">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(course.price)}
                    </div>
                  )}

                  <button
                    onClick={handleEnroll}
                    className={`w-full py-4 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mb-4 ${isEnrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                  >
                    {isEnrolled ? (
                      <>
                        <PlayCircle className="w-5 h-5" />
                        <span>Continue Learning</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>{user ? 'Enroll Now' : 'Sign up to Enroll'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center text-sm text-slate-600 mb-4">
                    30-day money-back guarantee
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total lessons</span>
                      <span className="font-semibold">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-semibold">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Free previews</span>
                      <span className="font-semibold">{freeLessons} lessons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Access</span>
                      <span className="font-semibold">Lifetime</span>
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
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.what_you_learn.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Requirements</h2>
                {/* <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-slate-400">•</span>
                    <span>No prior trading experience required</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-slate-400">•</span>
                    <span>Computer with internet connection</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-slate-400">•</span>
                    <span>Willingness to learn and practice</span>
                  </li>
                </ul> */}
                {/* <div className="grid md:grid-cols-2 gap-4">
                  {course.course_requirements.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {/* <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> */}
                {/* <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div> */}
                {course.course_requirements && course.course_requirements.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <li className="flex items-start space-x-3">
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  </div>
                ))}

              </div>


              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Who This Course Is For</h2>
                {/* <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Beginner traders looking to build a solid foundation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Anyone interested in financial markets and trading</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Professionals looking to develop algorithmic trading skills</span>
                  </li>
                </ul> */}
                {course.who_this_course_is_for && course.who_this_course_is_for.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <li className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  </div>
                ))}

              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Course Content</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson._id}
                      className={`p-4 rounded-lg border transition-all ${lesson.is_free_preview
                        ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                        : 'border-slate-200 bg-slate-50'
                        }`}
                      onClick={() => lesson.is_free_preview && setSelectedLesson(lesson)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {lesson.is_free_preview ? (
                            <PlayCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                              {index + 1}. {lesson.title}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Lesson {lesson.order}</span>
                            {lesson.is_free_preview && (
                              <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full font-medium">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
