import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { SkeletonCard } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";

export default function BookAppointment() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/users?role=doctor");
      setDoctors(res.data);
    } catch {
      toast.error("Failed to load specialists. Please try again later.");
    } finally {
      setTimeout(() => setFetchLoading(false), 600);
    }
  };

  const handleBook = async () => {
    if (!doctorId || !date) {
      toast.error("Please select a doctor and date");
      return;
    }

    setLoading(true);
    try {
      await API.post("/appointments", {
        doctorId,
        date
      });
      toast.success("Appointment booked successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book appointment");
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 mt-24">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/dashboard" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-2 inline-flex items-center gap-1">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              Book Appointment
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select a specialist and choose your preferred date.</p>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">1. Select a Doctor</h2>
            
            {fetchLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
                 <SkeletonCard />
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                 <p className="text-gray-500 dark:text-gray-400 font-medium">No doctors available at the moment.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants} initial="hidden" animate="show"
                className="grid sm:grid-cols-2 gap-4"
              >
                {doctors.map(d => (
                  <motion.label 
                    variants={itemVariants}
                    key={d._id} 
                    className={`block cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 transition-all duration-200 ${
                      doctorId === d._id 
                      ? "border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/30 bg-blue-50/10 dark:bg-blue-900/10 shadow-md transform scale-[1.02]" 
                      : "border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="doctor" 
                      className="sr-only" 
                      value={d._id} 
                      onChange={(e) => setDoctorId(e.target.value)} 
                    />
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 transition-colors ${
                        doctorId === d._id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                      }`}>
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Dr. {d.name}</h3>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{d.specialization || "General Physician"}</p>
                        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <li>⭐ {d.experience || 0}+ years exp</li>
                          <li>💸 ₹{d.fees || 0} Consultation</li>
                        </ul>
                      </div>
                    </div>
                  </motion.label>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">2. Schedule & Confirm</h2>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 dark:shadow-none p-6">
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 dark:text-white"
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              {/* Summary */}
              <AnimatePresence>
                {doctorId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 overflow-hidden"
                  >
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Summary</h4>
                    <p className="font-semibold text-gray-900 dark:text-white">Dr. {doctors.find(d => d._id === doctorId)?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">₹{doctors.find(d => d._id === doctorId)?.fees} • {doctors.find(d => d._id === doctorId)?.specialization || "General Physician"}</p>
                    {date && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-400">Date</span>
                        <span className="text-gray-900 dark:text-white">{new Date(date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleBook}
                disabled={loading || !doctorId || !date}
                className="w-full py-4 text-center rounded-2xl font-bold border-2 transition-all shadow-lg 
                enabled:bg-gradient-to-r enabled:from-blue-600 enabled:to-indigo-600 enabled:text-white enabled:border-transparent enabled:hover:shadow-xl enabled:hover:-translate-y-0.5 enabled:shadow-blue-500/30
                disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:border-slate-200 dark:disabled:border-slate-600 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}