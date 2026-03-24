import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "/src/components/Navbar";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalLessons: 0, totalScripts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ padding: "40px" }}>
        <h1>
          <b>Admin Dashboard</b>
        </h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div style={{ padding: "20px", background: "#e3f2fd", borderRadius: "8px", minWidth: "150px" }}>
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div style={{ padding: "20px", background: "#e8f5e9", borderRadius: "8px", minWidth: "150px" }}>
              <h3>{stats.totalCourses}</h3>
              <p>Total Courses</p>
            </div>
            <div style={{ padding: "20px", background: "#fff3e0", borderRadius: "8px", minWidth: "150px" }}>
              <h3>{stats.totalLessons}</h3>
              <p>Total Lessons</p>
            </div>
            <div style={{ padding: "20px", background: "#fff3e0", borderRadius: "8px", minWidth: "150px" }}>
              <h3>{stats.totalScripts}</h3>
              <p>Total Scripts</p>
            </div>
          </div>
        )}{" "}
        <nav>
          <h3>Quick Links</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/users" style={{ textDecoration: "none", color: "#1976d2" }}>
                👥 User Management
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/courses" style={{ textDecoration: "none", color: "#1976d2" }}>
                📚 Course Management
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/lessons" style={{ textDecoration: "none", color: "#1976d2" }}>
                🎬 Lesson Management
              </Link>
            </li>{" "}
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/scripts" style={{ textDecoration: "none", color: "#1976d2" }}>
                📜 Script Management
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/enrollments" style={{ textDecoration: "none", color: "#1976d2" }}>
                🎓 Course Enrollments
              </Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/admin/script-purchases" style={{ textDecoration: "none", color: "#1976d2" }}>
                💰 Script Purchases
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default AdminDashboard;
