import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const ScriptManagement = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    script_type: "forex",
    price: "",
    win_rate: "",
    total_trades: "",
    profit_percentage: "",
    max_drawdown: "",
    sharpe_ratio: "",
    features: "",
    whats_included: "",
  });
  const [performance_data, setPerformance_data] = useState([]);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/scripts");
      setScripts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load scripts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = {
        ...formData,
        price: Number(formData.price),
        win_rate: Number(formData.win_rate),
        total_trades: Number(formData.total_trades),
        profit_percentage: Number(formData.profit_percentage),
        max_drawdown: Number(formData.max_drawdown),
        sharpe_ratio: Number(formData.sharpe_ratio),
        features: formData.features.split("\n").filter((f) => f.trim()),
        whats_included: formData.whats_included.split("\n").filter((f) => f.trim()),
        performance_data: performance_data,
      };

      if (editingScript) {
        await api.put(`/admin/scripts/${editingScript._id}`, data);
      } else {
        await api.post("/admin/scripts", data);
      }
      resetForm();
      fetchScripts();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (script) => {
    setEditingScript(script);
    setFormData({
      title: script.title || "",
      description: script.description || "",
      script_type: script.script_type || "forex",
      price: script.price || "",
      win_rate: script.win_rate || "",
      total_trades: script.total_trades || "",
      profit_percentage: script.profit_percentage || "",
      max_drawdown: script.max_drawdown || "",
      sharpe_ratio: script.sharpe_ratio || "",
      features: script.features?.join("\n") || "",
      whats_included: script.whats_included?.join("\n") || "",
    });
    setPerformance_data(script.performance_data || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this script?")) return;
    try {
      await api.delete(`/admin/scripts/${id}`);
      fetchScripts();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingScript(null);
    setFormData({
      title: "",
      description: "",
      script_type: "forex",
      price: "",
      win_rate: "",
      total_trades: "",
      profit_percentage: "",
      max_drawdown: "",
      sharpe_ratio: "",
      features: "",
      whats_included: "",
    });
    setPerformance_data([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>
          <b>Script Management</b>
        </h2>
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
            {showForm ? "Cancel" : "+ Add Script"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

      {/* Add Edit Form  */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px", padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>{editingScript ? "Edit Script" : "Add New Script"}</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Title </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Script Type </label>
              <select
                value={formData.script_type}
                onChange={(e) => setFormData({ ...formData, script_type: e.target.value })}
                style={{ padding: "8px", width: "100%" }}
              >
                <option value="forex">Forex</option>
                <option value="crypto">Crypto</option>
                <option value="stocks">Stocks</option>
                <option value="algo">Algo</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Price </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Win Rate (%)</label>
              <input
                type="number"
                value={formData.win_rate}
                onChange={(e) => setFormData({ ...formData, win_rate: e.target.value })}
                min="0"
                max="100"
                step="0.1"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Total Trades</label>
              <input
                type="number"
                value={formData.total_trades}
                onChange={(e) => setFormData({ ...formData, total_trades: e.target.value })}
                min="0"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Profit Percentage (%)</label>
              <input
                type="number"
                value={formData.profit_percentage}
                onChange={(e) => setFormData({ ...formData, profit_percentage: e.target.value })}
                step="0.1"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Max Drawdown (%)</label>
              <input
                type="number"
                value={formData.max_drawdown}
                onChange={(e) => setFormData({ ...formData, max_drawdown: e.target.value })}
                min="0"
                step="0.1"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Sharpe Ratio</label>
              <input
                type="number"
                value={formData.sharpe_ratio}
                onChange={(e) => setFormData({ ...formData, sharpe_ratio: e.target.value })}
                step="0.01"
                style={{ padding: "8px", width: "100%" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              style={{ padding: "8px", width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Features (one per line)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows="4"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              style={{ padding: "8px", width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>what's_included (one per line)</label>
            <textarea
              value={formData.whats_included}
              onChange={(e) => setFormData({ ...formData, whats_included: e.target.value })}
              rows="4"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              style={{ padding: "8px", width: "100%" }}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm mb-4 p-4">
            <h3 className="text-xl font-bold mb-4">Monthly Performance</h3>

            {performance_data.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                {/* Month */}
                <input
                  type="text"
                  placeholder="Month (e.g. Jan 2024)"
                  value={item.month}
                  onChange={(e) => {
                    const data = [...performance_data];
                    data[index].month = e.target.value;
                    setPerformance_data(data);
                  }}
                  className="border p-2 rounded"
                  required
                />

                {/* Profit */}
                <input
                  type="number"
                  placeholder="Profit %"
                  value={item.profit}
                  onChange={(e) => {
                    const data = [...performance_data];
                    data[index].profit = Number(e.target.value || 0);
                    setPerformance_data(data);
                  }}
                  className="border p-2 rounded"
                  required
                />

                {/* Drawdown */}
                <input
                  type="number"
                  placeholder="Drawdown %"
                  value={item.drawdown}
                  onChange={(e) => {
                    const data = [...performance_data];
                    data[index].drawdown = Number(e.target.value || 0);
                    setPerformance_data(data);
                  }}
                  className="border p-2 rounded"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => setPerformance_data(performance_data.filter((_, i) => i !== index))}
                  className="bg-red-500 text-white rounded px-2 btn btn-danger"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setPerformance_data([...performance_data, { month: "", profit: 0, drawdown: 0 }])}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded btn btn-primary"
            >
              + Add Month
            </button>
          </div>

          <button type="submit" style={{ padding: "10px 20px" }} className="btn btn-success">
            {editingScript ? "Update Script" : "Create Script"}
          </button>
        </form>
      )}

      {/* Scripts Table */}
      {loading ? (
        <p>Loading...</p>
      ) : scripts.length === 0 ? (
        <p>No scripts found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Title</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Price</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Win Rate</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Profit %</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scripts.map((script) => (
              <tr key={script._id}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{script.title}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "#e3f2fd",
                      textTransform: "capitalize",
                    }}
                  >
                    {script.script_type}
                  </span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>₹{script.price}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{script.win_rate}%</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{script.profit_percentage}%</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <button onClick={() => handleEdit(script)} style={{ marginRight: "5px" }} className=" btn btn-primary">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(script._id)} style={{ background: "#f44336", color: "white" }} className="btn btn-danger">
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

export default ScriptManagement;
