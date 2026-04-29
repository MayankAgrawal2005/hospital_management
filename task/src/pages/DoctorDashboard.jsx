import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { format, startOfWeek, endOfWeek, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { SkeletonStats } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import PasswordManager from "../components/PasswordManager";

const STANDARD_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

export default function DoctorDashboard() {
  const navigate = useNavigate();

  // Initialize user state
  const [user, setUser] = useState({});

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Calendar & Advanced Scheduling State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [cancelModalData, setCancelModalData] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [rescheduleModalData, setRescheduleModalData] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [customSlot, setCustomSlot] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    fees: "",
    bio: "",
    availableSlots: [],
    leaveDays: []
  });
  const [newLeaveDate, setNewLeaveDate] = useState("");

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
      setLoading(false);
    }
  };

  const completeAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/complete`);
      toast.success("Appointment marked as completed");
      fetchAppointments();
    } catch {
      toast.error("Failed to complete appointment");
    }
  };

  const submitCancel = async () => {
    if (!cancelReason.trim()) return toast.error("Please provide a reason");
    try {
      await API.put(`/appointments/${cancelModalData}/cancel`, { reason: cancelReason });
      toast.success("Appointment cancelled");
      setCancelModalData(null);
      setCancelReason("");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  const openRescheduleModal = (appt) => {
    setRescheduleModalData(appt._id);
    if (appt.status === 'reschedule_requested' && appt.requestedDate) {
      setNewDate(new Date(appt.requestedDate).toISOString().split("T")[0]);
      setNewTime(appt.requestedTime);
    } else {
      setNewDate("");
      setNewTime("");
    }
  };

  const submitReschedule = async () => {
    if (!newDate || !newTime) return toast.error("Please select a new date and time");
    try {
      await API.put(`/appointments/${rescheduleModalData}/reschedule`, { newDate, newTime });
      toast.success("Appointment rescheduled");
      setRescheduleModalData(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch {
      toast.error("Failed to reschedule appointment");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const openEditModal = () => {
    setEditForm({
      name: user.name || "",
      specialization: user.specialization || "",
      experience: user.experience || "",
      fees: user.fees || "",
      bio: user.bio || "",
      availableSlots: user.availableSlots || ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      leaveDays: user.leaveDays || []
    });
    setNewLeaveDate("");
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const toggleSlot = (slot) => {
    setEditForm(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(slot)
        ? prev.availableSlots.filter(s => s !== slot)
        : [...prev.availableSlots, slot]
    }));
  };

  const handleAddCustomSlot = () => {
    if (!customSlot.trim()) return;

    let finalSlot = customSlot;
    if (/^\d{2}:\d{2}$/.test(customSlot)) {
      const [h, m] = customSlot.split(':');
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      finalSlot = `${hours < 10 ? '0' + hours : hours}:${m} ${ampm}`;
    }

    if (!editForm.availableSlots.includes(finalSlot)) {
      setEditForm(prev => ({
        ...prev,
        availableSlots: [...prev.availableSlots, finalSlot]
      }));
    }
    setCustomSlot("");
  };

  const handleAddLeaveDay = () => {
    if (!newLeaveDate) return;
    if (!editForm.leaveDays.includes(newLeaveDate)) {
      setEditForm(prev => ({
        ...prev,
        leaveDays: [...prev.leaveDays, newLeaveDate].sort()
      }));
    }
    setNewLeaveDate("");
  };

  const handleRemoveLeaveDay = (dateToRemove) => {
    setEditForm(prev => ({
      ...prev,
      leaveDays: prev.leaveDays.filter(d => d !== dateToRemove)
    }));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await API.put("/users/profile", editForm);
      const updatedUser = res.data.user;

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist locally!

      toast.success("Profile updated perfectly!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const total = appointments.length;
  const booked = appointments.filter((a) => a.status === "booked").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  // Calendar Helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getAppointmentsForDay = (day) => {
    return appointments.filter(appt => isSameDay(new Date(appt.date), day));
  };

  return (
    <div className="block lg:flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300 relative">

      {/* Profile Edit Overlay Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Update Your Profile</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    name="name" value={editForm.name} onChange={handleEditChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                    <input
                      name="specialization" value={editForm.specialization} onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience (Yrs)</label>
                    <input
                      name="experience" type="number" value={editForm.experience} onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consultation Fees (₹)</label>
                  <input
                    name="fees" type="number" value={editForm.fees} onChange={handleEditChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Bio</label>
                  <textarea
                    name="bio" rows="3" value={editForm.bio} onChange={handleEditChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Time Slots</label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${editForm.availableSlots.includes(slot)
                            ? "bg-blue-500 border-blue-500 text-white shadow-md"
                            : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                    {editForm.availableSlots.filter(s => !STANDARD_SLOTS.includes(s)).map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-indigo-500 border-indigo-500 text-white shadow-md"
                      >
                        {slot} (Custom)
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 max-w-xs">
                    <input
                      type="time"
                      value={customSlot}
                      onChange={(e) => setCustomSlot(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium text-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm shadow-indigo-500/20 transition-all text-sm"
                    >
                      Add Custom
                    </button>
                  </div>
                </div>

                {/* Leave Management Section */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Leave Management</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Add dates when you are on vacation or unavailable. Patients won't be able to book appointments on these days.</p>

                  <div className="flex gap-2 max-w-sm mb-4">
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={newLeaveDate}
                      onChange={(e) => setNewLeaveDate(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm font-medium text-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    <button
                      type="button"
                      onClick={handleAddLeaveDay}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-sm shadow-red-500/20 transition-all text-sm"
                    >
                      Block Date
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editForm.leaveDays && editForm.leaveDays.length > 0 ? (
                      editForm.leaveDays.map(date => (
                        <div key={date} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-lg text-sm text-red-700 dark:text-red-400">
                          <span className="font-semibold">{new Date(date).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLeaveDay(date)}
                            className="hover:text-red-900 dark:hover:text-red-200 ml-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No leave days added yet.</span>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
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
      </AnimatePresence>


      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">C</div>
          CarePoint
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col fixed h-full z-50 shadow-2xl border-r border-slate-200 dark:border-gray-800 transition-transform duration-300 overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 text-white text-base">C</div>
              CarePoint
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-100 dark:bg-white/10 rounded-3xl p-5 flex flex-col items-center text-center border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl mb-8 relative"
          >
            {/* Edit Button overlay on profile card */}
            <button
              onClick={openEditModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white transition-colors"
              title="Edit Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </button>

            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-3xl font-bold font-serif mb-4 shadow-md border-4 border-slate-200 dark:border-gray-800 text-white">
              {user.name?.charAt(0)}
            </div>
            <h2 className="font-bold text-xl mb-1 truncate w-full px-2 text-gray-900 dark:text-white" title={user.name}> Dr. {user.name}</h2>
            <p className="text-blue-600 dark:text-blue-300 text-sm font-medium mb-4">{user.specialization || "General Physician"}</p>
            <div className="flex space-x-3 text-xs bg-slate-200 dark:bg-black/30 px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10">
              <span className="text-gray-600 dark:text-gray-300">Exp: {user.experience}y</span>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <span className="text-gray-600 dark:text-gray-300">₹{user.fees}</span>
            </div>
            {user.bio && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 px-2">"{user.bio}"</p>
            )}
          </motion.div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-500/20">
            Overview Dashboard
          </p>
        </nav>

        <div className="p-6 space-y-3">
          <button
            onClick={() => setIsEditingSecurity(true)}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl transition-colors border border-red-200 dark:border-red-500/10"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 w-full overflow-x-hidden p-4 sm:p-8 lg:p-12 min-h-screen pt-20 lg:pt-8">
        <header className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Practice Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
            Manage your appointments and patients interactively.
          </p>
        </header>

        {/* Stats */}
        {loading ? (
          <SkeletonStats />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12"
          >
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1 text-sm">Total</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                {total}
              </h2>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-100 dark:border-amber-900/50 transition-shadow hover:shadow-md">
              <p className="text-amber-700 dark:text-amber-400 font-medium mb-1 text-sm">Booked</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900 dark:text-amber-300">
                {booked}
              </h2>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-green-100 dark:border-green-900/50 transition-shadow hover:shadow-md">
              <p className="text-green-700 dark:text-green-400 font-medium mb-1 text-sm">Completed</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-green-900 dark:text-green-300">
                {completed}
              </h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-100 dark:border-red-900/50 transition-shadow hover:shadow-md">
              <p className="text-red-700 dark:text-red-400 font-medium mb-1 text-sm">Cancelled</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-red-900 dark:text-red-300">
                {cancelled}
              </h2>
            </div>
          </motion.div>
        )}

        {/* Calendar Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 sm:p-6 mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Interactive Schedule
            </h2>
            <div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-700 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-inner">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500 rounded-xl shadow-sm transition-colors text-gray-600 dark:text-gray-300 font-bold text-sm">
                ←
              </button>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 w-28 sm:w-36 text-center tracking-wide">
                {format(currentMonth, 'MMM yyyy')}
              </h3>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500 rounded-xl shadow-sm transition-colors text-gray-600 dark:text-gray-300 font-bold text-sm">
                →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[300px] sm:h-[500px] bg-slate-100 dark:bg-slate-700/50 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-600"></div>
          ) : (
            <div className="overflow-x-auto -mx-1">
            <div className="min-w-[560px] grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
               {/* Days Header */}
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="bg-slate-50 dark:bg-slate-800 py-3 text-center text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">
                   {day}
                 </div>
               ))}
               
               {/* Calendar Grid */}
               {calendarDays.map((day, idx) => {
                  const dayAppts = getAppointmentsForDay(day);
                  const hasBookings = dayAppts.some(a => a.status === 'booked');
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[120px] bg-white dark:bg-slate-800 p-3 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 flex flex-col group
                        ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 bg-slate-50/50 dark:bg-slate-800/30' : 'text-gray-800 dark:text-gray-200'}
                        ${hasBookings && isCurrentMonth ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors
                          ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'group-hover:bg-slate-200 dark:group-hover:bg-slate-600'}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {dayAppts.length > 0 && (
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full shadow-sm border border-blue-200/50 dark:border-blue-800/50">
                            {dayAppts.length}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-end gap-1">
                        {hasBookings && (
                          <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wide bg-blue-50/80 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Booked
                          </div>
                        )}
                      </div>
                    </div>
                  )
               })}
            </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {/* Selected Date Appointments Modal */}
        {selectedDate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
             >
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Appointments for {format(selectedDate, 'MMMM d, yyyy')}
                   </h3>
                   <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors">&times;</button>
                </div>
                
                {getAppointmentsForDay(selectedDate).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-50">🏝️</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No appointments scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getAppointmentsForDay(selectedDate).map(a => (
                      <div key={a._id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{a.patientId?.name || "Unknown Patient"}</h4>
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                🕒 {a.time}
                                {a.appointmentType === "Online" && <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-md text-xs border border-indigo-200 dark:border-indigo-800">📹 Online</span>}
                              </p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider
                              ${a.status === 'booked' || a.status === 'rescheduled' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                a.status === 'reschedule_requested' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                a.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  'bg-red-100 text-red-800 border border-red-200'}
                            `}>
                              {a.status === 'cancelled' && a.cancelledBy ? `Cancelled by ${a.cancelledBy}` : 
                               a.status === 'reschedule_requested' ? "Reschedule Requested" :
                               a.status}
                            </span>
                         </div>
                         
                         {a.status === 'cancelled' && a.cancellationReason && (
                           <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-xl border border-red-100 dark:border-red-800/50 text-sm mb-4">
                             <strong className="font-bold">Reason:</strong> {a.cancellationReason}
                           </div>
                         )}

                         {a.status === 'reschedule_requested' && (
                           <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50 text-sm mb-4">
                             <strong className="font-bold block mb-1">Patient requested new time:</strong> 
                             {new Date(a.requestedDate).toLocaleDateString()} at {a.requestedTime}
                           </div>
                         )}

                         {(a.status === "booked" || a.status === "rescheduled" || a.status === "reschedule_requested") && (
                           <div className="flex flex-wrap gap-3 justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                             {a.appointmentType === "Online" && a.meetingLink && (
                               <a
                                 href={a.meetingLink}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white font-bold rounded-xl text-sm border border-indigo-200 transition-all duration-300"
                               >
                                 Join Call
                               </a>
                             )}
                             {a.status !== "reschedule_requested" && (
                               <button
                                 onClick={() => completeAppointment(a._id)}
                                 className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm shadow-sm transition-colors"
                               >
                                 Mark Done
                               </button>
                             )}
                             
                             {a.status === "reschedule_requested" ? (
                               <button
                                 onClick={() => openRescheduleModal(a)}
                                 className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white font-bold rounded-xl text-sm border border-purple-200 transition-colors"
                               >
                                 Review Request
                               </button>
                             ) : (
                               <button
                                 onClick={() => openRescheduleModal(a)}
                                 className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white font-bold rounded-xl text-sm border border-blue-200 transition-colors"
                               >
                                 Reschedule
                               </button>
                             )}
                             
                             <button
                               onClick={() => setCancelModalData(a._id)}
                               className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white font-bold rounded-xl text-sm border border-red-200 transition-colors"
                             >
                               Cancel
                             </button>
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                )}
             </motion.div>
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModalData && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                placeholder="Doctor unavailable, emergency, etc."
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
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
    </div>
  );
}