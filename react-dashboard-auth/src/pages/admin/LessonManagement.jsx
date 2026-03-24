import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    vimeo_video_id: "",
    order: 1,
    is_free_preview: false,
  });

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const url = filterCourse ? `/admin/lessons/course/${filterCourse}` : "/admin/lessons";
      const res = await api.get(url);
      setLessons(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const loadLessons = async () => {
      setLoading(true);
      try {
        const url = filterCourse ? `/admin/lessons/course/${filterCourse}` : "/admin/lessons";
        const res = await api.get(url);
        setLessons(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, [filterCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = {
        ...formData,
        order: Number(formData.order),
      };

      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson._id}`, data);
      } else {
        await api.post("/admin/lessons", data);
      }
      resetForm();
      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      course_id: lesson.course_id?._id || lesson.course_id,
      title: lesson.title,
      vimeo_video_id: lesson.vimeo_video_id,
      order: lesson.order,
      is_free_preview: lesson.is_free_preview,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/admin/lessons/${id}`);
      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLesson(null);
    setFormData({
      course_id: "",
      title: "",
      vimeo_video_id: "",
      order: 1,
      is_free_preview: false,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Lesson Management</h1>
        <div>
          <Link to="/admin" style={{ marginRight: "15px" }} className="btn btn-secondary text-white text-decoration-none">
            Back
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              showForm ? resetForm() : setShowForm(true);
            }}
          >
            {showForm ? "Cancel" : "+ Add Lesson"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {/* Filter by Course */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Filter by Course:</label>
        <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} style={{ padding: "8px", minWidth: "200px" }}>
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Course *</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                required
                style={{ padding: "8px", width: "100%" }}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Title *</label>
              <input
                type="text"
                placeholder="Lesson Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Vimeo Video ID *</label>
              <input
                type="text"
                placeholder="e.g., 123456789"
                value={formData.vimeo_video_id}
                onChange={(e) => setFormData({ ...formData, vimeo_video_id: e.target.value })}
                required
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Order *</label>
              <input
                type="number"
                placeholder="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                required
                min="1"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="is_free_preview"
                checked={formData.is_free_preview}
                onChange={(e) => setFormData({ ...formData, is_free_preview: e.target.checked })}
              />
              <label htmlFor="is_free_preview">Free Preview</label>
            </div>
          </div>

          <button type="submit" style={{ padding: "10px 20px" }} className="btn btn-success">
            {editingLesson ? "Update Lesson" : "Create Lesson"}
          </button>
        </form>
      )}

      {/* Lessons Table */}
      {loading ? (
        <p>Loading...</p>
      ) : lessons.length === 0 ? (
        <p>No lessons found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Order</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Title</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Course</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Vimeo ID</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Free Preview</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson._id}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{lesson.order}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{lesson.title}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{lesson.course_id?.title || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <code>{lesson.vimeo_video_id}</code>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: lesson.is_free_preview ? "#e8f5e9" : "#ffebee",
                      color: lesson.is_free_preview ? "#2e7d32" : "#c62828",
                    }}
                  >
                    {lesson.is_free_preview ? "Yes" : "No"}
                  </span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <button onClick={() => handleEdit(lesson)} style={{ marginRight: "5px" }} className=" btn btn-primary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(lesson._id)} style={{ background: "#f44336", color: "white" }} className="btn btn-danger">
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

export default LessonManagement;
