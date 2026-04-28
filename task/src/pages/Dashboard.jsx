import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SkeletonStats, SkeletonRow } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import PasswordManager from "../components/PasswordManager";
import AISymptomChecker from "../components/AISymptomChecker";

export default function Dashboard() {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch {
      toast.error("Failed to fetch appointments");
    } finally {
      /* Simulate slightly longer load for skeleton effect */
      setTimeout(() => setLoading(false), 800);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      toast.success("Appointment successfully cancelled.");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  const total = appointments.length;
  const booked = appointments.filter(a => a.status === "booked").length;
  const completed = appointments.filter(a => a.status === "completed").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 pt-32">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Here is your latest medical schedule.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditingSecurity(true)}
              className="px-6 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              Security Settings
            </button>
            <Link
              to="/book"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all text-center inline-block"
            >
              + Book Appointment
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <SkeletonStats />
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
              <span className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Visits</span>
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{total}</span>
            </div>
            <div className="bg-blue-50/80 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex flex-col justify-center transition-all hover:bg-blue-50">
              <span className="text-blue-600 dark:text-blue-400 font-medium mb-1">Upcoming</span>
              <span className="text-4xl font-extrabold text-blue-800 dark:text-blue-300">{booked}</span>
            </div>
            <div className="bg-green-50/80 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-800/50 flex flex-col justify-center transition-all hover:bg-green-50">
              <span className="text-green-600 dark:text-green-400 font-medium mb-1">Completed</span>
              <span className="text-4xl font-extrabold text-green-800 dark:text-green-300">{completed}</span>
            </div>
            <div className="bg-red-50/80 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-800/50 flex flex-col justify-center transition-all hover:bg-red-50">
              <span className="text-red-500 dark:text-red-400 font-medium mb-1">Cancelled</span>
              <span className="text-4xl font-extrabold text-red-700 dark:text-red-300">{cancelled}</span>
            </div>
          </motion.div>
        )}

        {/* Appointments List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Appointments</h2>

          {loading ? (
            <div className="space-y-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <div className="text-7xl mb-6">🩺</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No appointments yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">You don't have any medical appointments scheduled at the moment.</p>
              <Link to="/book" className="text-blue-600 dark:text-blue-400 font-semibold text-lg hover:underline underline-offset-4">
                Book your first appointment &rarr;
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-h-[500px] overflow-y-auto pr-2 space-y-4 custom-scrollbar"
            >
              {[...appointments].sort((a, b) => b._id.localeCompare(a._id)).map((a) => (
                <motion.div
                  variants={itemVariants}
                  key={a._id}
                  className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-extrabold text-xl flex items-center justify-center shrink-0">
                      {a.doctorId?.name?.charAt(0) || "D"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl"> {a.doctorId?.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{a.doctorId?.email}</p>
                      <div className="font-semibold text-blue-700 dark:text-blue-300 flex flex-wrap items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/30 w-max px-3 py-1.5 rounded-lg">
                        📅 {new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        {a.time && ` at ${a.time}`}
                        {a.appointmentType === "Online" && <span className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-md text-xs border border-indigo-200 dark:border-indigo-800">📹 Online</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end md:gap-8 w-full md:w-auto mt-2 md:mt-0 pt-6 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-700">
                    <span className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest
                      ${a.status === 'booked' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        a.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}
                    `}>
                      {a.status}
                    </span>

                    {a.status === "booked" && (
                      <div className="flex items-center gap-2">
                        {a.appointmentType === "Online" && a.meetingLink && (
                          <a
                            href={a.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 border border-indigo-100 dark:border-indigo-800"
                          >
                            📹 Join Call
                          </a>
                        )}
                        <button
                          onClick={() => cancelAppointment(a._id)}
                          className="text-red-500 dark:text-red-400 font-bold text-sm hover:text-white hover:bg-red-500 px-4 py-2 rounded-xl transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </main>

      {/* Security Modal */}
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

      <AISymptomChecker />
    </div>
  );
}