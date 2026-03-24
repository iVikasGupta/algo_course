import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "basics",
    price: "",
    duration: "",
    level: "Beginner",
    what_you_learn: "",
    course_requirements: "",
    who_this_course_is_for: "",
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        what_you_learn: formData.what_you_learn.split("\n").filter((s) => s.trim()),
        course_requirements: formData.course_requirements.split("\n").filter((s) => s.trim()),
        who_this_course_is_for: formData.who_this_course_is_for.split("\n").filter((s) => s.trim()),
      };

      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse._id}`, data);
      } else {
        await api.post("/admin/courses", data);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        category: "basics",
        price: "",
        duration: "",
        level: "Beginner",
        what_you_learn: "",
        course_requirements: "",
        who_this_course_is_for: "",
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      duration: course.duration,
      level: course.level,
      what_you_learn: course.what_you_learn?.join("\n") || "",
      course_requirements: course.course_requirements?.join("\n") || "",
      who_this_course_is_for: course.who_this_course_is_for?.join("\n") || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setShowForm(!showForm);
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      category: "basics",
      price: "",
      duration: "",
      level: "Beginner",
      what_you_learn: "",
      course_requirements: "",
      who_this_course_is_for: "",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Course Management</h1>
        <div>
          <Link to="/admin" style={{ marginRight: "15px" }} className=" btn btn-secondary text-white text-decoration-none">
            Back
          </Link>
          <button className="btn btn-primary" onClick={resetForm}>
            {showForm ? "Cancel" : "+ Add Course"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>{editingCourse ? "Edit Course" : "Add New Course"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ padding: "8px" }}
            />
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ padding: "8px" }}>
              <option value="basics">Basics</option>
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="algo">Algo</option>
            </select>
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              style={{ padding: "8px" }}
            />
            <input
              type="text"
              placeholder="Duration (e.g., 10 hours)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
              style={{ padding: "8px" }}
            />
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} style={{ padding: "8px" }}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            style={{ padding: "8px", width: "100%", minHeight: "80px", marginBottom: "10px" }}
          />
          <textarea
            placeholder="What you'll learn (one per line)"
            value={formData.what_you_learn}
            onChange={(e) => setFormData({ ...formData, what_you_learn: e.target.value })}
            required
            style={{ padding: "8px", width: "100%", minHeight: "80px", marginBottom: "10px" }}
          />

          <textarea
            placeholder="Course Requirements (one per line)"
            value={formData.course_requirements}
            onChange={(e) => setFormData({ ...formData, course_requirements: e.target.value })}
            required
            style={{ padding: "8px", width: "100%", minHeight: "80px", marginBottom: "10px" }}
          />

          <textarea
            placeholder="Who This Course Is For (one per line)"
            value={formData.who_this_course_is_for}
            onChange={(e) => setFormData({ ...formData, who_this_course_is_for: e.target.value })}
            required
            style={{ padding: "8px", width: "100%", minHeight: "80px", marginBottom: "10px" }}
          />

          <button className="btn btn-primary" type="submit">
            {editingCourse ? "Update" : "Create"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Title</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Category</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Price</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Level</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.title}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.category}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>₹{course.price}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{course.level}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button onClick={() => handleEdit(course)} style={{ marginRight: "5px" }} className="btn btn-primary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(course._id)} style={{ background: "#f44336", color: "white" }} className="btn btn-danger">
                    Delete
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

export default CourseManagement;
