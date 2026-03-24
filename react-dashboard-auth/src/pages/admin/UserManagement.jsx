import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, formData);
      } else {
        await api.post("/admin/users", formData);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", role: user.role || "user" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>
          <b> User Management</b>
        </h2>{" "}
        <div>
          <button className="btn btn-secondary me-2">
            <Link to="/admin" className="text-white text-decoration-none">
              {" "}
              Back
            </Link>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingUser(null);
              setFormData({ name: "", email: "", password: "", role: "user" });
            }}
          >
            {showForm ? "Cancel" : "+ Add User"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ padding: "8px", width: "200px", marginRight: "10px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{ padding: "8px", width: "200px", marginRight: "10px" }}
            />
          </div>{" "}
          <div style={{ marginBottom: "10px" }}>
            <input
              type="password"
              placeholder={editingUser ? "New Password (leave blank to keep)" : "Password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              style={{ padding: "8px", width: "200px", marginRight: "10px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "10px" }}>Role:</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ padding: "8px", width: "150px" }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success">
            {editingUser ? "Update" : "Create"}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          {" "}
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Name</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Role</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Created</th>
              <th style={{ padding: "10px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: user.role === "admin" ? "#e3f2fd" : "#f5f5f5",
                      color: user.role === "admin" ? "#1565c0" : "#666",
                      fontWeight: user.role === "admin" ? "bold" : "normal",
                    }}
                  >
                    {user.role || "user"}
                  </span>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: "5px" }} className="btn btn-primary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user._id)} style={{ background: "#f44336", color: "white" }} className="btn btn-danger">
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

export default UserManagement;
