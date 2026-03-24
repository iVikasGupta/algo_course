import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const ScriptPurchaseManagement = () => {
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ user_id: "", item_id: "", amount: "" });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/purchases");
      setPurchases(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersAndScripts = async () => {
    try {
      const [usersRes, scriptsRes] = await Promise.all([api.get("/admin/users"), api.get("/admin/scripts")]);
      setUsers(usersRes.data);
      setScripts(scriptsRes.data);
    } catch (err) {
      console.error("Failed to load users/scripts:", err);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchUsersAndScripts();
  }, []);

  const handleScriptChange = (scriptId) => {
    const selectedScript = scripts.find((s) => s._id === scriptId);
    setFormData({
      ...formData,
      item_id: scriptId,
      amount: selectedScript ? selectedScript.price : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/purchases", formData);
      setShowForm(false);
      setFormData({ user_id: "", item_id: "", amount: "" });
      fetchPurchases();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign script");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this purchase?")) return;
    try {
      await api.delete(`/admin/purchases/${id}`);
      fetchPurchases();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>📜 Script Purchases</h2>
        <div>
          <Link to="/admin" style={{ marginRight: "15px" }} className="btn btn-secondary">
            Back
          </Link>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? "Cancel" : "+ Assign Script"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {/* Assign Script Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", background: "#fff3e0", borderRadius: "8px" }}>
          <h3>Assign Script to User</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}> Select User </label>
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
              <label style={{ display: "block", marginBottom: "5px" }}> Select Script </label>
              <select value={formData.item_id} onChange={(e) => handleScriptChange(e.target.value)} required style={{ padding: "10px", minWidth: "250px" }}>
                <option value="">-- Select Script --</option>
                {scripts.map((script) => (
                  <option key={script._id} value={script._id}>
                    {script.title} (₹{script.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0 for free"
                style={{ padding: "10px", width: "120px" }}
              />
            </div>

            <button type="submit" style={{ padding: "10px 20px", background: "#ff9800", color: "white", border: "none", borderRadius: "4px" }}>
              Assign Script
            </button>
          </div>
        </form>
      )}

      {/* Purchases Table */}
      {loading ? (
        <p>Loading...</p>
      ) : purchases.length === 0 ? (
        <p>No script purchases found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>User</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Script</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Amount</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Purchased On</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase._id}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{purchase.user_id?.name || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{purchase.user_id?.email || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{purchase.script?.title || "N/A"}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{purchase.amount}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: purchase.payment_status === "completed" ? "#e8f5e9" : "#ffebee",
                      color: purchase.payment_status === "completed" ? "#2e7d32" : "#c62828",
                      textTransform: "capitalize",
                    }}
                  >
                    {purchase.payment_status}
                  </span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{new Date(purchase.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => handleDelete(purchase._id)}
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

export default ScriptPurchaseManagement;
