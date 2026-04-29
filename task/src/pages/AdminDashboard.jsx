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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userFilter, setUserFilter] = useState("all");
  const [activeView, setActiveView] = useState("overview"); // "overview" | "doctors"
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { navigate("/"); return; }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== "admin") { toast.error("Unauthorized access"); navigate("/"); return; }
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
    if (!window.confirm(`Are you sure you want to delete ${name}? All associated appointments will be removed.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success(`${name} has been removed.`);
      fetchData();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Admin logged out");
    navigate("/");
  };

  const filteredUsers = usersList.filter(u => userFilter === "all" || u.role === userFilter);
  const doctors = usersList.filter(u => u.role === "doctor");

  return (
    <div className="block lg:flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300 relative">

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white text-sm">S</div>
          CareSync 360 Admin
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-72 bg-white dark:bg-slate-950 text-gray-900 dark:text-white flex flex-col fixed top-0 left-0 h-full z-50 shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-y-auto transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30 text-white text-base">S</div>
              CareSync 360 Admin
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-500/10 rounded-3xl p-5 flex flex-col items-center text-center border border-red-100 dark:border-red-500/20 shadow-sm mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-red-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold font-serif mb-4 shadow-md border-4 border-slate-100 dark:border-slate-900 text-white">
              {user.name?.charAt(0) || "A"}
            </div>
            <h2 className="font-bold text-xl mb-1 truncate w-full px-2 text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-red-500 dark:text-red-400 text-sm font-bold uppercase tracking-wider">Platform Owner</p>
          </motion.div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveView("overview")}
            className={`w-full text-left font-semibold px-4 py-3 rounded-xl transition-all ${activeView === "overview"
              ? "bg-red-600 text-white shadow-md shadow-red-500/20"
              : "text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            📊 Platform Overview
          </button>
          <button
            onClick={() => setActiveView("doctors")}
            className={`w-full text-left font-semibold px-4 py-3 rounded-xl transition-all ${activeView === "doctors"
              ? "bg-red-600 text-white shadow-md shadow-red-500/20"
              : "text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            🩺 Doctors ({doctors.length})
          </button>
        </nav>

        <div className="p-6 space-y-3">
          <button onClick={() => setIsEditingSecurity(true)}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl transition-colors border border-slate-200 dark:border-slate-700">
            Change Password
          </button>
          <button onClick={handleLogout}
            className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl transition-colors border border-red-200 dark:border-red-500/10">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 w-full overflow-x-hidden p-4 sm:p-8 lg:p-12 min-h-screen pt-20 lg:pt-8">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {activeView === "doctors" ? "Doctor Profiles" : "Admin Moderation Panel"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {activeView === "doctors" ? "Full profile details of all registered doctors." : "Complete oversight of doctors, patients, and platform appointments."}
          </p>
        </header>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW VIEW ── */}
          {activeView === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading || !stats ? <SkeletonStats /> : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Registered Doctors</p>
                    <h2 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{stats.doctors}</h2>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Registered Patients</p>
                    <h2 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.patients}</h2>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Appointments</p>
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">{stats.totalAppointments}</h2>
                  </div>
                </div>
              )}

              {/* Users Directory */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Users Directory</h2>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 w-fit">
                    {["all","doctor","patient"].map(f => (
                      <button key={f} onClick={() => setUserFilter(f)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${userFilter === f ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                        {f === "all" ? "All Users" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
                      </button>
                    ))}
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
                          <tr><td colSpan="4" className="py-8 text-center text-slate-500">No {userFilter === "all" ? "users" : userFilter + "s"} found.</td></tr>
                        ) : filteredUsers.map(u => (
                          <motion.tr key={u._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                              {u.role === "doctor" ? `Dr. ${u.name}` : u.name}
                            </td>
                            <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === "doctor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button onClick={() => handleDeleteUser(u._id, u.name)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border border-red-200 dark:border-red-800/50">
                                Delete
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Appointments Ledger */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Global Appointments Ledger</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-sm tracking-wide text-slate-500 dark:text-slate-400">
                        <th className="pb-3 px-4 font-semibold uppercase">Doctor</th>
                        <th className="pb-3 px-4 font-semibold uppercase">Patient</th>
                        <th className="pb-3 px-4 font-semibold uppercase">Scheduled</th>
                        <th className="pb-3 px-4 font-semibold uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center text-slate-500">No appointments yet.</td></tr>
                      ) : appointments.map(appt => (
                        <motion.tr key={appt._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {appt.doctorId?.name ? `Dr. ${appt.doctorId.name}` : "Unknown"}
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{appt.patientId?.name || "Unknown"}</td>
                          <td className="py-4 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(appt.date).toLocaleDateString()} {appt.time && `at ${appt.time}`}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5
                              ${(appt.status === "booked" || appt.status === "rescheduled") ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                              : appt.status === "reschedule_requested" ? "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50"
                              : appt.status === "completed" ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                              : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"}`}>
                              {(appt.status === "booked" || appt.status === "rescheduled") && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                              {(appt.status === "booked" || appt.status === "rescheduled") ? "Upcoming"
                                : appt.status === "cancelled" && appt.cancelledBy ? `Cancelled by ${appt.cancelledBy}`
                                : appt.status === "reschedule_requested" ? "Reschedule Requested"
                                : appt.status}
                            </span>
                            {appt.status === "cancelled" && appt.cancellationReason && (
                              <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={appt.cancellationReason}>
                                Reason: {appt.cancellationReason}
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── DOCTORS VIEW ── */}
          {activeView === "doctors" && (
            <motion.div key="doctors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading ? <SkeletonStats /> : doctors.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-16 text-center">
                  <div className="text-5xl mb-4">🩺</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No doctors registered yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {doctors.map(doc => (
                    <motion.div key={doc._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shrink-0 shadow-lg shadow-blue-500/20">
                          {doc.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white truncate">Dr. {doc.name}</h3>
                          <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{doc.specialization || "General Physician"}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 truncate">{doc.email}</p>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Experience</p>
                          <p className="font-extrabold text-gray-900 dark:text-white text-sm">{doc.experience || 0} yrs</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Fee</p>
                          <p className="font-extrabold text-green-700 dark:text-green-300 text-sm">₹{doc.fees || 0}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Slots</p>
                          <p className="font-extrabold text-blue-700 dark:text-blue-300 text-sm">{doc.availableSlots?.length || 0}</p>
                        </div>
                      </div>

                      {/* Bio */}
                      {doc.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-4 line-clamp-2 leading-relaxed">"{doc.bio}"</p>
                      )}

                      {/* Available Slots */}
                      {doc.availableSlots?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Available Slots</p>
                          <div className="flex flex-wrap gap-1.5">
                            {doc.availableSlots.map(slot => (
                              <span key={slot} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 px-2 py-1 rounded-lg font-medium">
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Leave Days */}
                      {doc.leaveDays?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Leave Days ({doc.leaveDays.length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {doc.leaveDays.slice(0, 4).map(day => (
                              <span key={day} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 px-2 py-1 rounded-lg font-medium">
                                {new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              </span>
                            ))}
                            {doc.leaveDays.length > 4 && (
                              <span className="text-xs text-gray-400 px-2 py-1">+{doc.leaveDays.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {appointments.filter(a => a.doctorId?._id === doc._id || a.doctorId === doc._id).length} appointments
                        </span>
                        <button onClick={() => handleDeleteUser(doc._id, doc.name)}
                          className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold transition-colors border border-red-100 dark:border-red-800/50">
                          Remove Doctor
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isEditingSecurity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700">
              <PasswordManager onClose={() => setIsEditingSecurity(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
