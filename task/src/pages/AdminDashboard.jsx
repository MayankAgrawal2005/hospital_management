import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonStats } from "../components/SkeletonLoader";
import PasswordManager from "../components/PasswordManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [stats, setStats] = useState(null);
  
  const [usersList, setUsersList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditingSecurity, setIsEditingSecurity] = useState(false);

  // Filter state for Users
  const [userFilter, setUserFilter] = useState("all");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/");
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/");
      return;
    }
    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, apptsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/appointments")
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
      setAppointments(apptsRes.data);
    } catch {
      toast.error("Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This action cannot be reversed, and all associated appointments will be lost.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${id}`);
      toast.success(`${name} has been securely removed.`);
      fetchData(); // Refresh list and stats natively
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Admin logged out successfully");
    navigate("/");
  };

  const filteredUsers = usersList.filter(u => userFilter === "all" || u.role === userFilter);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300 relative">
      
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col fixed h-full z-20 shadow-2xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30 text-white text-base">
              A
            </div>
            Super Admin
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 rounded-3xl p-5 flex flex-col items-center text-center border border-red-500/20 shadow-xl mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-red-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold font-serif mb-4 shadow-md border-4 border-slate-900">
              {user.name?.charAt(0) || "A"}
            </div>
            <h2 className="font-bold text-xl mb-1 truncate w-full px-2" title={user.name}>{user.name}</h2>
            <p className="text-red-400 text-sm font-bold uppercase tracking-wider mb-2">Platform Owner</p>
          </motion.div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="bg-red-600/20 text-red-100 font-semibold px-4 py-3 rounded-xl border border-red-500/20">
            Platform Overview
          </p>
        </nav>

        <div className="p-6 space-y-3">
          <button
            onClick={() => setIsEditingSecurity(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition-colors border border-slate-700"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 rounded-xl transition-colors border border-red-500/10"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 lg:p-12 min-h-screen">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Moderation Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Complete oversight of doctors, patients, and platform appointments.
          </p>
        </header>

        {loading || !stats ? (
          <SkeletonStats />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Registered Doctors</p>
              <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                {stats.doctors}
              </h2>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Registered Patients</p>
              <h2 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.patients}
              </h2>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Appointments</p>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalAppointments}
              </h2>
            </div>
            {/* <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-emerald-700 dark:text-emerald-400 font-medium mb-1">Platform Revenue</p>
              <h2 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{stats.platformRevenue || 0}
              </h2>
            </div> */}
          </motion.div>
        )}

        {/* Users Directory */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Platform Users Directory
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 w-fit">
              <button 
                onClick={() => setUserFilter("all")} 
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${userFilter === "all" ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >All Users</button>
              <button 
                onClick={() => setUserFilter("doctor")} 
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${userFilter === "doctor" ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >Doctors</button>
              <button 
                onClick={() => setUserFilter("patient")} 
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${userFilter === "patient" ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >Patients</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="pb-3 px-4 font-semibold uppercase">Name</th>
                  <th className="pb-3 px-4 font-semibold uppercase">Email</th>
                  <th className="pb-3 px-4 font-semibold uppercase">Role</th>
                  <th className="pb-3 px-4 font-semibold uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">No {userFilter === 'all' ? 'users' : userFilter + 's'} found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key={u._id}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                          {u.role === "doctor" ? " " : ""}{u.name}
                        </td>
                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                          {u.email}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            u.role === "doctor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-red-200 dark:border-red-800/50"
                          >
                            Delete {u.role === "doctor" ? "Doctor" : "Patient"}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Appointments Ledger */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Global Appointments Ledger
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="pb-3 px-4 font-semibold uppercase">Doctor</th>
                  <th className="pb-3 px-4 font-semibold uppercase">Patient</th>
                  <th className="pb-3 px-4 font-semibold uppercase">Scheduled Time</th>
                  <th className="pb-3 px-4 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">No appointments scheduled globally yet.</td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={appt._id}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                         {appt.doctorId?.name || "Unknown"}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {appt.patientId?.name || "Unknown"}
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(appt.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5
                          ${appt.status === "booked" ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" 
                          : appt.status === "completed" ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                          : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"}`}
                        >
                          {appt.status === "booked" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                          {appt.status === "booked" ? "Upcoming" : appt.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isEditingSecurity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <PasswordManager onClose={() => setIsEditingSecurity(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
