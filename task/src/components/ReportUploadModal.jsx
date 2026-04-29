import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ReportUploadModal({ onClose, onUpload, patientId: initialPatientId, appointmentId }) {
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Blood Test");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(initialPatientId || "");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role);
    
    const fetchRelated = async () => {
      try {
        const res = await API.get("/users/related");
        setRelatedUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch related users", err);
      }
    };
    fetchRelated();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !reportName) return toast.error("Please fill all fields");
    
    // For doctor, patientId is required. For patient, doctorId is optional but recommended.
    if (userRole === "doctor" && !selectedUserId) return toast.error("Please select a patient");

    const formData = new FormData();
    formData.append("report", file);
    formData.append("reportName", reportName);
    formData.append("reportType", reportType);
    
    if (userRole === "doctor") {
      formData.append("patientId", selectedUserId);
    } else if (selectedUserId) {
      formData.append("doctorId", selectedUserId);
    }
    
    if (appointmentId) formData.append("appointmentId", appointmentId);

    setLoading(true);
    try {
      await API.post("/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Report uploaded successfully!");
      if (onUpload) onUpload();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Report Name</label>
            <input
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
              placeholder="e.g. Annual Blood Work"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Report Type</label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {["Blood Test", "Sonography", "X-Ray", "MRI", "CT Scan", "Vaccination", "Other"].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              {userRole === "doctor" ? "Select Patient" : "Share with Doctor (Optional)"}
            </label>
            <select
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={!!initialPatientId}
            >
              <option value="">{userRole === "doctor" ? "Select a Patient" : "Private (No Doctor)"}</option>
              {relatedUsers.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} {u.specialization ? `(${u.specialization})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Select File (PDF or Image)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="report-file"
              />
              <label 
                htmlFor="report-file"
                className="w-full flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all"
              >
                <span className="text-3xl mb-2">📁</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {file ? file.name : "Click to browse files"}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Report"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
