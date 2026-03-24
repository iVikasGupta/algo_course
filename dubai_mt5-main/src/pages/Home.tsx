import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Courses from '../components/Courses';
import Scripts from '../components/Scripts';
import Footer from '../components/Footer';

export default function Home() {
  const location = useLocation();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [purchasedScriptIds, setPurchasedScriptIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [coursesData, scriptsData] = await Promise.all([
        api.getCourses(),
        api.getScripts(),
      ]);
      setCourses(coursesData);
      setScripts(scriptsData);

      // Fetch user's enrolled courses and purchased scripts if logged in
      if (user) {
        try {
          const [enrollments, purchases] = await Promise.all([
            api.getMyEnrollments(),
            api.getMyPurchasedScripts(),
          ]);
          
          // Extract course IDs from enrollments
          const enrolledIds = enrollments
            .filter((e: { course_id: { _id: string } | null }) => e.course_id)
            .map((e: { course_id: { _id: string } }) => e.course_id._id);
          setEnrolledCourseIds(enrolledIds);
          
          // Extract script IDs from purchases
          const purchasedIds = purchases
            .filter((p: { script: { _id: string } | null }) => p.script)
            .map((p: { script: { _id: string } }) => p.script._id);
          setPurchasedScriptIds(purchasedIds);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setEnrolledCourseIds([]);
        setPurchasedScriptIds([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle hash navigation (scroll to section)
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash, loading]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <Hero />
      <Features />
      <Courses courses={courses} loading={loading} enrolledCourseIds={enrolledCourseIds} />
      <Scripts scripts={scripts} loading={loading} purchasedScriptIds={purchasedScriptIds} />
      <Footer />
    </div>
  );
}
