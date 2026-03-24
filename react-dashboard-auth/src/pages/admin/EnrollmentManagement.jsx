import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ user_id: "", course_id: "" });

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/enrollments");
      setEnrollments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndCourses = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([api.get("/admin/users"), api.get("/admin/courses")]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error("Failed to load users/courses:", err);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchUsersAndCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/enrollments", formData);
      setShowForm(false);
      setFormData({ user_id: "", course_id: "" });
      fetchEnrollments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll user");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this enrollment?")) return;
    try {
      await api.delete(`/admin/enrollments/${id}`);
      fetchEnrollments();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>
          📚<b> Course Enrollments</b>
        </h2>
        <div>
          <Link to="/admin" style={{ marginRight: "15px" }} className="btn btn-secondary text-white text-decoration-none">
            Back
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? "Cancel" : "+ Enroll User"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {/* Enroll User Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", background: "#e3f2fd", borderRadius: "8px" }}>
          <h3>Enroll User in Course</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Select User </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
                style={{ padding: "10px", minWidth: "250px" }}
              >
                <option value="">-- Select User --</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Select Course </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                required
                style={{ padding: "10px", minWidth: "250px" }}
              >
                <option value="">-- Select Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} (₹{course.price})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" style={{ padding: "10px 20px", background: "#1976d2", color: "white", border: "none", borderRadius: "4px" }}>
              Enroll User
            </button>
          </div>
        </form>
      )}

      {/* Enrollments Table */}
      {loading ? (
        <p>Loading...</p>
      ) : enrollments.length === 0 ? (
        <p>No enrollments found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>User</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Course</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Progress</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Enrolled On</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment._id}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{enrollment.user_id?.name || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{enrollment.user_id?.email || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{enrollment.course_id?.title || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "100px", height: "8px", background: "#e0e0e0", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${enrollment.progress_percentage || 0}%`,
                          height: "100%",
                          background: "#4caf50",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <span>{enrollment.progress_percentage || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDelete(enrollment._id)}
                    style={{ background: "#f44336", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EnrollmentManagement;
