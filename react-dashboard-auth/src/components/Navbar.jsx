import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary ">
        <div className="container-fluid ">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <span className="fw-bold fs-4  pl-5 text-decoration-none text-slate-900">TradeAcademy </span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav  ms-auto  gap-2">
              <li className="nav-item">
                <Link className="nav-link active  " to="/">
                  Home
                </Link>
              </li>

              <li className="nav-item ">
                <Link className="nav-link" to="/admin/courses">
                  Courses
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link " to="/admin/scripts">
                  Scripts
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link " to="/admin/lessons">
                  Lessons
                </Link>
              </li>
              <li className="nav-item  ">
                <button onClick={logout} className="btn btn-danger ms-auto ">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
