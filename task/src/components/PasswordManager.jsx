import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function PasswordManager({ onClose }) {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await API.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Password secured and updated");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    try {
      await API.delete("/users/account");
      toast.success("Account deleted successfully");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
      
      {!showDeleteConfirm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input 
              type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (Min 6 chars)</label>
            <input 
              type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} required minLength="6"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input 
              type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required minLength="6"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white transition-all"
            />
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {onClose && (
                <button 
                  type="button" onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" disabled={loading}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-70 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                {loading ? "Securing..." : "Update Password"}
              </button>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 text-red-500 dark:text-red-400 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-dashed border-red-200 dark:border-red-800/40 transition-all"
            >
              Dangerous: Delete My Account Forever
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800/50">
            <h3 className="text-red-800 dark:text-red-300 font-bold mb-2 flex items-center gap-2">
              <span>⚠️</span> Final Warning
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
              This action is <strong>irreversible</strong>. Deleting your account will permanently remove all your medical records, appointments, and prescriptions from CareSync 360.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type "DELETE" to confirm</label>
            <input 
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-800 focus:border-red-500 outline-none font-bold tracking-widest text-center"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
              className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              Nevermind, Go Back
            </button>
            <button 
              onClick={handleDeleteAccount}
              disabled={loading || deleteInput !== "DELETE"}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all"
            >
              {loading ? "Deleting..." : "Confirm Deletion"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
