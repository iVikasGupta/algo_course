import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { PlayCircle, CheckCircle, Lock, Clock, ArrowLeft } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import VideoPlayer from '../components/VideoPlayer';

interface Lesson {
  _id: string;
  title: string;
  order: number;
  is_free_preview: boolean;
  vimeo_video_id?: string;
}

interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
  time_spent_seconds: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  
  // Time tracking
  const startTimeRef = useRef<number>(Date.now());
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedLessonRef = useRef<string | null>(null);

  // Save time spent 
  const saveTimeSpent = useCallback(async (lessonId?: string) => {
    const lessonToSave = lessonId || lastSavedLessonRef.current;
    if (lessonToSave && isEnrolled && startTimeRef.current > 0) {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 5) { // Only save if more than 5 seconds
        try {
          console.log(`Saving ${timeSpent} seconds for lesson ${lessonToSave}`);
          await api.updateLessonProgress({
            lesson_id: lessonToSave,
            course_id: courseId!,
            time_spent_seconds: timeSpent,
          });
          startTimeRef.current = Date.now(); // Reset timer after saving
        } catch (error) {
          console.error('Error saving time:', error);
        }
      }
    }
  }, [isEnrolled, courseId]);

  // Track when user leaves page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentLesson && isEnrolled) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 5) {
          // Use sendBeacon for reliable saving on page close
          const data = JSON.stringify({
            lesson_id: currentLesson._id,
            course_id: courseId,
            time_spent_seconds: timeSpent,
          });
          navigator.sendBeacon(
            'http://localhost:5000/api/enrollments/lesson-progress-beacon',
            new Blob([data], { type: 'application/json' })
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveTimeSpent(currentLesson?._id);
    };
  }, [currentLesson, isEnrolled, courseId, saveTimeSpent]);

  useEffect(() => {
    if (user && courseId) {
      fetchCourseData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseId]);

  // Start time tracking when lesson changes
  useEffect(() => {
    if (currentLesson && isEnrolled) {
      // Save time for previous lesson before switching
      if (lastSavedLessonRef.current && lastSavedLessonRef.current !== currentLesson._id) {
        saveTimeSpent(lastSavedLessonRef.current);
      }
      
      // Start tracking new lesson
      startTimeRef.current = Date.now();
      lastSavedLessonRef.current = currentLesson._id;
      
      // Clear previous interval
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current);
      }
      
      // Save time every 30 seconds
      timeTrackingIntervalRef.current = setInterval(() => {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= 30) {
          api.updateLessonProgress({
            lesson_id: currentLesson._id,
            course_id: courseId!,
            time_spent_seconds: timeSpent,
          }).then(() => {
            console.log(`Auto-saved ${timeSpent} seconds`);
            startTimeRef.current = Date.now();
          }).catch(console.error);
        }
      }, 30000);
    }

    return () => {
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson, isEnrolled, courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseData, lessonsData, enrollmentData] = await Promise.all([
        api.getCourse(courseId!),
        api.getLessonsByCourse(courseId!),
        api.checkEnrollment(courseId!),
      ]);

      setCourse(courseData);
      setLessons(lessonsData);
      setIsEnrolled(enrollmentData.isEnrolled);

      // Fetch lesson progress if enrolled
      if (enrollmentData.isEnrolled) {
        try {
          const progress = await api.getLessonProgress(courseId!);
          setLessonProgress(progress);
        } catch (error) {
          console.error('Error fetching lesson progress:', error);
        }
      }

      if (lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
        // Load first lesson video if enrolled or free preview
        if (enrollmentData.isEnrolled || lessonsData[0].is_free_preview) {
          loadLessonVideo(lessonsData[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
    setLoading(false);
  };

  const loadLessonVideo = async (lessonId: string) => {
    // Save time for previous lesson before switching
    await saveTimeSpent();
    startTimeRef.current = Date.now();
    
    try {
      const data = await api.getLessonVideo(lessonId);
      setCurrentVideoId(data.vimeo_video_id);
    } catch (error) {
      console.error('Error loading video:', error);
      setCurrentVideoId(null);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.is_free_preview || isEnrolled) {
      setCurrentLesson(lesson);
      loadLessonVideo(lesson._id);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson || !courseId) return;
    
    try {
      await api.completeLesson(currentLesson._id, courseId);
      
      // Update local lesson progress
      setLessonProgress(prev => {
        const existing = prev.find(p => p.lesson_id === currentLesson._id);
        if (existing) {
          return prev.map(p => 
            p.lesson_id === currentLesson._id 
              ? { ...p, is_completed: true } 
              : p
          );
        }
        return [...prev, { lesson_id: currentLesson._id, is_completed: true, time_spent_seconds: 0 }];
      });

      // Move to next lesson if available
      const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        setCurrentLesson(nextLesson);
        loadLessonVideo(nextLesson._id);
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some(p => p.lesson_id === lessonId && p.is_completed);
  };

  const canAccessLesson = (lesson: Lesson) => {
    return lesson.is_free_preview || isEnrolled;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-pulse text-slate-400">Loading course...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-slate-600">Course not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentLesson ? (
              <>
                <VideoPlayer
                  lesson={currentLesson}
                  vimeoVideoId={currentVideoId}
                />
                {isEnrolled && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {isLessonCompleted(currentLesson._id) ? (
                        <span className="flex items-center text-emerald-600">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Lesson Completed
                        </span>
                      ) : (
                        <span>Mark this lesson as complete when you're done</span>
                      )}
                    </div>
                    {!isLessonCompleted(currentLesson._id) && (
                      <button
                        onClick={handleMarkComplete}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12 text-center">
                <PlayCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Select a lesson to start learning</p>
              </div>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{course.title}</h2>
              <p className="text-slate-600 leading-relaxed">{course.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Course Content</h3>

              {!isEnrolled && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Enroll in this course to access all lessons
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const accessible = canAccessLesson(lesson);
                  const completed = isLessonCompleted(lesson._id);

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => handleLessonClick(lesson)}
                      disabled={!accessible}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${currentLesson?._id === lesson._id
                        ? 'bg-emerald-50 border-emerald-200'
                        : completed
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : accessible
                            ? 'border-slate-200 hover:bg-slate-50'
                            : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : accessible ? (
                            <PlayCircle className="w-5 h-5 text-slate-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`text-sm font-semibold line-clamp-2 ${completed ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {index + 1}. {lesson.title}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Lesson {lesson.order}</span>
                            </div>
                            {lesson.is_free_preview && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
