import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside style={{ width: "200px", background: "#1a1a2e", color: "white", minHeight: "100vh", padding: "22px" }}>
      <h3 style={{ marginBottom: "30px" }}>Unfluke</h3>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {/* <li style={{ marginBottom: "15px" }}>
            <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
              🏠 Dashboard
            </Link>
          </li> */}
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
              🏠 Admin Dashboard
            </Link>
          </li>
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin/users" style={{ color: "white", textDecoration: "none" }}>
              👥 Users
            </Link>
          </li>{" "}
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin/courses" style={{ color: "white", textDecoration: "none" }}>
              📚 Courses
            </Link>
          </li>{" "}
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin/lessons" style={{ color: "white", textDecoration: "none" }}>
              🎬 Lessons
            </Link>
          </li>{" "}
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin/scripts" style={{ color: "white", textDecoration: "none" }}>
              📜 Scripts
            </Link>
          </li>
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin/enrollments" style={{ color: "white", textDecoration: "none" }}>
              🎓 Enrollments
            </Link>
          </li>
          <li style={{ marginBottom: "15px" }}>
            <Link to="/admin/script-purchases" style={{ color: "white", textDecoration: "none" }}>
              💰 Purchases
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
