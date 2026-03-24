import { Clock, BarChart, CheckCircle2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  level: string;
  what_you_learn: string[];
}

interface CoursesProps {
  courses: Course[];
  loading: boolean;
  enrolledCourseIds?: string[];
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    basics: 'bg-blue-100 text-blue-700',
    forex: 'bg-green-100 text-green-700',
    crypto: 'bg-orange-100 text-orange-700',
    algo: 'bg-purple-100 text-purple-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    Beginner: 'text-green-600',
    Intermediate: 'text-orange-600',
    Advanced: 'text-red-600',
  };
  return colors[level] || 'text-gray-600';
};

export default function Courses({ courses, loading, enrolledCourseIds = [] }: CoursesProps) {
  if (loading) {
    return (
      <section id="courses" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse text-slate-400">Loading courses...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Premium Trading Courses
          </h2>
          <p className="text-xl text-slate-600">
            Learn from industry experts and master the art of trading across multiple markets
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group border border-slate-200"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryColor(course.category)}`}>
                      {course.category}
                    </span>
                    <span className={`text-sm font-semibold ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>

                  <Link to={`/course-preview/${course._id}`}>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center space-x-6 mb-6 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart className="w-4 h-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3">What you'll learn:</h4>
                    <ul className="space-y-2">
                      {course.what_you_learn.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div>
                      {enrolledCourseIds.includes(course._id) ? (
                        <div className="flex items-center space-x-2 text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Already Enrolled</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-slate-900">
                          {new Intl.NumberFormat("en-AE", {
                            style: "currency",
                            currency: "AED",
                          }).format(course.price)}
                        </div>
                      )}
                    </div>

                    <Link 
                      to={enrolledCourseIds.includes(course._id) ? `/course/${course._id}` : `/course-preview/${course._id}`} 
                      className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg ${
                        enrolledCourseIds.includes(course._id) 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <span>{enrolledCourseIds.includes(course._id) ? 'Continue Learning' : 'View Details'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section >
  );
}
