import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function PasswordManager({ onClose }) {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
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

        <div className="mt-8 flex items-center gap-3">
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
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-70 text-white rounded-xl font-bold shadow-md shadow-red-500/20 transition-all"
          >
            {loading ? "Securing..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
