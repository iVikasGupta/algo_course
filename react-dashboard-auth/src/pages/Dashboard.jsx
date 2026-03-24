import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/sidebar";

const Dashboard = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <div style={{ padding: "20px" }}>
          <h1>
            {" "}
            <p>Welcome to your dashboard!</p>
          </h1>

          <div style={{ marginTop: "20px" }}>
            <h3>Quick Links</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <Link to="/admin" style={{ textDecoration: "none", color: "#1976d2" }}>
                  🔧 Admin Panel
                </Link>
              </li>
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
              </li>
              <li style={{ marginBottom: "10px" }}>
                <Link to="/admin/scripts" style={{ textDecoration: "none", color: "#1976d2" }}>
                  📜 Script Management
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
