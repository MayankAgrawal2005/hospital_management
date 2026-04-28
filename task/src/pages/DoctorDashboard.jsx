import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { SkeletonStats } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import PasswordManager from "../components/PasswordManager";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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

  // Profile Update State
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [customSlot, setCustomSlot] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    fees: "",
    bio: "",
    availableSlots: []
  });

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

  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
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
      availableSlots: user.availableSlots || ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]
    });
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
      finalSlot = `${hours < 10 ? '0'+hours : hours}:${m} ${ampm}`;
    }

    if (!editForm.availableSlots.includes(finalSlot)) {
      setEditForm(prev => ({
        ...prev,
        availableSlots: [...prev.availableSlots, finalSlot]
      }));
    }
    setCustomSlot("");
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

  const events = appointments.map((a) => {
    let startDate = new Date(a.date);
    
    if (a.time) {
      const timeParts = a.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3];

        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }

        startDate.setHours(hours, minutes, 0, 0);
      }
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // assume 1hr
    return {
      id: a._id,
      title: `${a.appointmentType === "Online" ? "📹 " : ""}${a.patientId?.name || "Unknown"} (${a.status})`,
      start: startDate,
      end: endDate,
      status: a.status,
      original: a,
    };
  });

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3b82f6"; // blue
    if (event.status === "completed") {
      backgroundColor = "#22c55e"; // green
    } else if (event.status === "cancelled") {
      backgroundColor = "#ef4444"; // red
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event) => {
    if (event.original.status === "booked") {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p>
              <strong>{event.original.patientId?.name}</strong> has a booked appointment.
            </p>
            {event.original.appointmentType === "Online" && event.original.meetingLink && (
              <a 
                href={event.original.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg text-sm text-center font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors block w-full"
              >
                📹 Join Video Call
              </a>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  completeAppointment(event.original._id);
                  toast.dismiss(t.id);
                }}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm flex-1"
              >
                Mark Done
              </button>
              <button
                onClick={() => {
                  cancelAppointment(event.original._id);
                  toast.dismiss(t.id);
                }}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    } else {
      toast.error(`This appointment is already ${event.original.status}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300 relative">

      {/* Profile Edit Overlay Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-700"
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          editForm.availableSlots.includes(slot)
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
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium text-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm"
                    >
                      Add Custom
                    </button>
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


      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10 text-white font-bold text-xl">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 text-white text-base">
              C
            </div>
            CarePoint
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-3xl p-5 flex flex-col items-center text-center backdrop-blur-md border border-white/5 shadow-xl mb-8 relative"
          >
            {/* Edit Button overlay on profile card */}
            <button
              onClick={openEditModal}
              className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
              title="Edit Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </button>

            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-3xl font-bold font-serif mb-4 shadow-md border-4 border-gray-800">
              {user.name?.charAt(0)}
            </div>
            <h2 className="font-bold text-xl mb-1 truncate w-full px-2" title={user.name}> {user.name}</h2>
            <p className="text-blue-300 text-sm font-medium mb-4">{user.specialization || "General Physician"}</p>
            <div className="flex space-x-3 text-xs bg-black/30 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-gray-300">Exp: {user.experience}y</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">₹{user.fees}</span>
            </div>
            {user.bio && (
              <p className="mt-4 text-xs text-gray-400 italic line-clamp-2 px-2">"{user.bio}"</p>
            )}
          </motion.div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="bg-blue-600/20 text-blue-400 font-semibold px-4 py-3 rounded-xl border border-blue-500/20">
            Overview Dashboard
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
            Practice Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
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
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total</p>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {total}
              </h2>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/50 transition-shadow hover:shadow-md">
              <p className="text-amber-700 dark:text-amber-400 font-medium mb-1">Booked</p>
              <h2 className="text-4xl font-extrabold text-amber-900 dark:text-amber-300">
                {booked}
              </h2>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-100 dark:border-green-900/50 transition-shadow hover:shadow-md">
              <p className="text-green-700 dark:text-green-400 font-medium mb-1">Completed</p>
              <h2 className="text-4xl font-extrabold text-green-900 dark:text-green-300">
                {completed}
              </h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/50 transition-shadow hover:shadow-md">
              <p className="text-red-700 dark:text-red-400 font-medium mb-1">Cancelled</p>
              <h2 className="text-4xl font-extrabold text-red-900 dark:text-red-300">
                {cancelled}
              </h2>
            </div>
          </motion.div>
        )}

        {/* Calendar Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Interactive Schedule Calendar
          </h2>

          {loading ? (
            <div className="h-[500px] bg-slate-100 dark:bg-slate-700/50 rounded-2xl animate-pulse border border-slate-200/50 dark:border-slate-600"></div>
          ) : (
            <div className="h-[600px] dark:text-gray-200" style={{ '--rbc-today-bg': 'rgba(59, 130, 246, 0.1)' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day']}
                className="font-sans marker:text-white"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}