import { useState } from "react";
import api from "../api/axios";

const EditLesson = ({ lesson }) => {
  const [form, setForm] = useState(lesson);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.put(`/admin/lessons/${lesson._id}`, form);
    alert("Lesson updated");
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3">
      <input name="title" className="form-control mb-2" value={form.title} onChange={handleChange} />

      <input name="vimeo_video_id" className="form-control mb-2" value={form.vimeo_video_id} onChange={handleChange} />

      <input type="number" name="order" className="form-control mb-2" value={form.order} onChange={handleChange} />

      <div className="form-check mb-2">
        <input type="checkbox" name="is_free_preview" className="form-check-input" checked={form.is_free_preview} onChange={handleChange} />
        <label className="form-check-label">Free Preview</label>
      </div>

      <button className="btn btn-primary">Update Lesson</button>
    </form>
  );
};

export default EditLesson;
