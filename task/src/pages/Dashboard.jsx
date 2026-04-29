import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SkeletonStats, SkeletonRow } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import PasswordManager from "../components/PasswordManager";
import AISymptomChecker from "../components/AISymptomChecker";
import { generatePrescriptionPDF } from "../utils/pdfGenerator";
import ReportUploadModal from "../components/ReportUploadModal";
import ReportPreviewModal from "../components/ReportPreviewModal";

export default function Dashboard() {
  const userStr = localStorage.getItem("user");
  const [user, setUser] = useState(userStr ? JSON.parse(userStr) : {});

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", dateOfBirth: "", bloodGroup: "", gender: ""
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments"); // appointments, prescriptions, reports
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [reportFilter, setReportFilter] = useState({ search: "", type: "All" });

  // Advanced Scheduling State
  const [cancelModalData, setCancelModalData] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [rescheduleModalData, setRescheduleModalData] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptions();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/my");
      setReports(res.data);
    } catch {
      console.error("Failed to fetch reports");
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report? This will also remove it from Cloudinary.")) return;
    try {
      await API.delete(`/reports/${id}`);
      toast.success("Report deleted");
      fetchReports();
    } catch {
      toast.error("Failed to delete report");
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/reports/${editingReport._id}`, {
        reportName: editingReport.reportName,
        reportType: editingReport.reportType
      });
      toast.success("Report updated");
      setEditingReport(null);
      fetchReports();
    } catch {
      toast.error("Failed to update report");
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await API.get("/prescriptions/my");
      setPrescriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch prescriptions");
    }
  };

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

  const submitCancel = async () => {
    if (!cancelReason.trim()) return toast.error("Please provide a reason");
    try {
      await API.put(`/appointments/${cancelModalData}/cancel`, { reason: cancelReason });
      toast.success("Appointment successfully cancelled.");
      setCancelModalData(null);
      setCancelReason("");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment record?")) return;
    try {
      await API.delete(`/appointments/${id}`);
      toast.success("Appointment deleted");
      fetchAppointments();
    } catch {
      toast.error("Failed to delete appointment");
    }
  };

  const submitReschedule = async () => {
    if (!newDate || !newTime) return toast.error("Please select a new date and time");
    try {
      await API.put(`/appointments/${rescheduleModalData}/request-reschedule`, { requestedDate: newDate, requestedTime: newTime });
      toast.success("Reschedule request sent to doctor.");
      setRescheduleModalData(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch {
      toast.error("Failed to request reschedule");
    }
  };

  const openProfileModal = () => {
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      dateOfBirth: user.dateOfBirth || "",
      bloodGroup: user.bloodGroup || "",
      gender: user.gender || ""
    });
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await API.put("/users/profile", profileForm);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const total = appointments.length;
  const booked = appointments.filter(a => ["booked", "rescheduled", "reschedule_requested"].includes(a.status)).length;
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

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 pt-28 sm:pt-32">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">Here is your latest medical schedule.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openProfileModal}
              className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-sm sm:text-base"
            >
              My Profile
            </button>
            <button
              onClick={() => setIsEditingSecurity(true)}
              className="px-5 py-3 sm:px-6 sm:py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-sm sm:text-base"
            >
              Security
            </button>
            <Link
              to="/book"
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all text-center inline-block text-sm sm:text-base"
            >
              + Book Appointment
            </Link>
          </div>
        </motion.div>

        {/* Patient Profile Summary Card */}
        {(user.phone || user.bloodGroup || user.dateOfBirth || user.gender) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/50 p-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                {user.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              {user.bloodGroup && <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800/50">🩸 {user.bloodGroup}</span>}
              {user.dateOfBirth && <span className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">🎂 {new Date(user.dateOfBirth).toLocaleDateString()}</span>}
              {user.gender && <span className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">👤 {user.gender}</span>}
              {user.phone && <span className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">📞 {user.phone}</span>}
            </div>
            <button onClick={openProfileModal} className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline shrink-0">Edit →</button>
          </motion.div>
        )}

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

        {/* Tabs */}
        <div className="flex gap-6 mb-10 border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab("appointments")}
            className={`pb-4 px-2 font-bold text-lg transition-all relative ${activeTab === "appointments" ? "text-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
          >
            My Appointments
            {activeTab === "appointments" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("prescriptions")}
            className={`pb-4 px-2 font-bold text-lg transition-all relative ${activeTab === "prescriptions" ? "text-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
          >
            Prescriptions
            {activeTab === "prescriptions" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            className={`pb-4 px-2 font-bold text-lg transition-all relative ${activeTab === "reports" ? "text-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
          >
            Medical Reports
            {activeTab === "reports" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
          </button>
        </div>

        {activeTab === "appointments" ? (
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
                  className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-extrabold text-lg sm:text-xl flex items-center justify-center shrink-0">
                      {a.doctorId?.name?.charAt(0) || "D"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl truncate"> Dr. {a.doctorId?.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-2 truncate">{a.doctorId?.email}</p>
                      <div className="font-semibold text-blue-700 dark:text-blue-300 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                        📅 {new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {a.time && ` at ${a.time}`}
                        {a.appointmentType === "Online" ? (
                          <span className="ml-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-lg text-xs border border-indigo-200 dark:border-indigo-800 font-bold">📹 Online</span>
                        ) : (
                          a.doctorId?.clinicAddress && (
                            <span className="ml-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs border border-emerald-200 dark:border-emerald-800/50 font-bold flex items-center gap-1">
                              📍 {a.doctorId.clinicAddress}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-6 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-700">
                    <span className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest
                      ${a.status === 'booked' || a.status === 'rescheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        a.status === 'reschedule_requested' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                        a.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}
                    `}>
                      {a.status === 'cancelled' && a.cancelledBy ? `Cancelled by ${a.cancelledBy}` : 
                       a.status === 'reschedule_requested' ? "Waiting for Approval" : 
                       a.status}
                    </span>

                    {a.status === 'cancelled' && a.cancellationReason && (
                       <p className="text-xs text-red-600 dark:text-red-400 font-medium max-w-[200px] text-right truncate" title={a.cancellationReason}>
                         Reason: {a.cancellationReason}
                       </p>
                    )}

                    {a.status === 'reschedule_requested' && (
                       <p className="text-xs text-purple-600 dark:text-purple-400 font-medium max-w-[200px] text-right mt-1">
                         Requested: {new Date(a.requestedDate).toLocaleDateString()} at {a.requestedTime}
                       </p>
                    )}

                    {(a.status === "booked" || a.status === "rescheduled") && (
                      <div className="flex flex-wrap items-center justify-end gap-2 mt-2">
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
                          onClick={() => setRescheduleModalData(a._id)}
                          className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:text-white hover:bg-blue-600 px-4 py-2 rounded-xl transition-all duration-300 border border-blue-200 dark:border-blue-800/50"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancelModalData(a._id)}
                          className="text-red-600 dark:text-red-400 font-bold text-sm hover:text-white hover:bg-red-600 px-4 py-2 rounded-xl transition-all duration-300 border border-red-200 dark:border-red-800/50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {(a.status === "completed" || a.status === "cancelled") && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => deleteAppointment(a._id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>🗑️</span> Delete Record
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
          </div>
        ) : activeTab === "prescriptions" ? (
          <div className="space-y-6 mb-20">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Prescriptions & Reports</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Access your medical history and digital prescriptions.</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="text-6xl mb-6">📄</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No prescriptions yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Your digital prescriptions will appear here after your appointments.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {prescriptions.map((pres) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={pres._id}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                        📝
                      </div>
                      <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Finalized
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Dr. {pres.doctorId?.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{new Date(pres.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    
                    <div className="space-y-2 mb-6 flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">"{pres.notes}"</p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                        {pres.medicines?.length} Medicines prescribed
                      </p>
                    </div>

                    <button 
                      onClick={() => generatePrescriptionPDF(pres)}
                      className="w-full py-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 rounded-2xl font-bold text-sm transition-all border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2"
                    >
                      📥 Download PDF
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 mb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Medical Reports</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and upload your test results.</p>
              </div>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <span>➕</span> Upload New Report
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <input 
                placeholder="Search reports..."
                className="flex-1 min-w-[200px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                value={reportFilter.search}
                onChange={(e) => setReportFilter({...reportFilter, search: e.target.value})}
              />
              <select 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
                value={reportFilter.type}
                onChange={(e) => setReportFilter({...reportFilter, type: e.target.value})}
              >
                {["All", "Blood Test", "Sonography", "X-Ray", "MRI", "CT Scan", "Vaccination", "Other"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {reports.filter(r => (reportFilter.type === "All" || r.reportType === reportFilter.type) && r.reportName.toLowerCase().includes(reportFilter.search.toLowerCase())).length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="text-6xl mb-6">📂</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No reports found</h3>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports
                  .filter(r => (reportFilter.type === "All" || r.reportType === reportFilter.type) && r.reportName.toLowerCase().includes(reportFilter.search.toLowerCase()))
                  .map((report) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={report._id}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-2xl flex items-center justify-center">
                        {report.fileUrl.toLowerCase().endsWith(".pdf") ? "📄" : "🖼️"}
                      </div>
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {report.reportType}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate" title={report.reportName}>{report.reportName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex justify-between items-center">
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                      {report.uploadedBy === "doctor" && <span className="italic">By Dr. {report.doctorId?.name}</span>}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button 
                        onClick={() => setPreviewReport(report)}
                        className="py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all"
                      >
                        Preview
                      </button>
                      <a 
                        href={report.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs text-center transition-all"
                      >
                        Download
                      </a>
                    </div>

                    {report.uploadedBy === "patient" && (
                      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                        <button 
                          onClick={() => setEditingReport(report)}
                          className="flex-1 py-2 text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <span>✏️</span> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report._id)}
                          className="flex-1 py-2 text-[10px] font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <span>🗑️</span> Delete
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {showUploadModal && (
            <ReportUploadModal 
              onClose={() => setShowUploadModal(false)} 
              onUpload={fetchReports}
            />
          )}
          {previewReport && (
            <ReportPreviewModal 
              report={previewReport} 
              onClose={() => setPreviewReport(null)} 
            />
          )}
          {editingReport && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl"
              >
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Edit Report Details</h2>
                <form onSubmit={handleUpdateReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Report Name</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                      value={editingReport.reportName}
                      onChange={(e) => setEditingReport({...editingReport, reportName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Report Type</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
                      value={editingReport.reportType}
                      onChange={(e) => setEditingReport({...editingReport, reportType: e.target.value})}
                    >
                      {["Blood Test", "Sonography", "X-Ray", "MRI", "CT Scan", "Vaccination", "Other"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditingReport(null)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Health Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Keep your details updated for accurate medical care.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={e => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                    <select
                      value={profileForm.bloodGroup}
                      onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white"
                    >
                      <option value="">Select blood group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-900 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button onClick={saveProfile} disabled={savingProfile} className="px-7 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

        {/* Cancel Modal */}
        {cancelModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cancel Appointment</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please provide a reason for cancelling this appointment.</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="I am feeling better, etc."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-red-500/50 text-gray-900 dark:text-white mb-6 min-h-[100px]"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setCancelModalData(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Back</button>
                <button onClick={submitCancel} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md">Confirm Cancel</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reschedule Modal */}
        {rescheduleModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Reschedule Appointment</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setRescheduleModalData(null)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Back</button>
                <button onClick={submitReschedule} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md">Confirm Reschedule</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AISymptomChecker />
    </div>
  );
}