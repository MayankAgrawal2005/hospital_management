import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { SkeletonCard } from "../components/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";

const ALL_SPECIALIZATIONS = [
  "All", "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedist", "Pediatrician", "Psychiatrist", "Gynecologist", "Oncologist", "ENT"
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const recommendedDoctorId = searchParams.get("doctorId");

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [appointmentType, setAppointmentType] = useState("In-Person");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [maxFee, setMaxFee] = useState(5000);
  const [minExp, setMinExp] = useState(0);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctorId && date) {
      fetchBookedSlots();
    } else {
      setBookedSlots([]);
      setTime("");
    }
  }, [doctorId, date]);

  const fetchBookedSlots = async () => {
    try {
      const res = await API.get(`/appointments/doctor/${doctorId}/booked-slots?date=${date}`);
      setBookedSlots(res.data);
    } catch {
      toast.error("Failed to fetch available time slots");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/users?role=doctor");
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      // Filter out self if the user is a doctor
      let fetchedDoctors = res.data.filter(d => d._id !== currentUser?._id);

      if (recommendedDoctorId) {
        fetchedDoctors.sort((a, b) => {
          const aMatch = a._id === recommendedDoctorId;
          const bMatch = b._id === recommendedDoctorId;
          return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
        });
      }

      setDoctors(fetchedDoctors);

      if (recommendedDoctorId && fetchedDoctors.length > 0) {
        const match = fetchedDoctors.find(d => d._id === recommendedDoctorId);
        if (match) setDoctorId(match._id);
      }
    } catch {
      toast.error("Failed to load specialists. Please try again later.");
    } finally {
      setTimeout(() => setFetchLoading(false), 600);
    }
  };

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q)
      );
    }

    if (selectedSpec !== "All") {
      result = result.filter(d =>
        d.specialization?.toLowerCase() === selectedSpec.toLowerCase()
      );
    }

    result = result.filter(d => (d.fees || 0) <= maxFee);
    result = result.filter(d => (d.experience || 0) >= minExp);

    if (sortBy === "fee_asc") result.sort((a, b) => (a.fees || 0) - (b.fees || 0));
    else if (sortBy === "fee_desc") result.sort((a, b) => (b.fees || 0) - (a.fees || 0));
    else if (sortBy === "exp_desc") result.sort((a, b) => (b.experience || 0) - (a.experience || 0));

    // Always keep AI recommended at top
    if (recommendedDoctorId) {
      result.sort((a, b) => (b._id === recommendedDoctorId ? 1 : 0) - (a._id === recommendedDoctorId ? 1 : 0));
    }

    return result;
  }, [doctors, searchQuery, selectedSpec, maxFee, minExp, sortBy, recommendedDoctorId]);

  const handleBook = async () => {
    if (!doctorId || !date || !time) {
      toast.error("Please select a doctor, date, and time");
      return;
    }

    setLoading(true);
    try {
      await API.post("/appointments", { doctorId, date, time, appointmentType });
      toast.success("Appointment booked successfully!");
      localStorage.setItem("redirectToMyHealth", "true");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book appointment");
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 mt-24">

        <header className="mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/dashboard" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-2 inline-flex items-center gap-1">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
              Book Appointment
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Filter specialists and choose your preferred date.</p>
            {recommendedDoctorId && doctors.find(d => d._id === recommendedDoctorId) && (
              <div className="mt-3 inline-block bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                ✨ AI Recommended: Dr. {doctors.find(d => d._id === recommendedDoctorId).name}
              </div>
            )}
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Main List + Filters */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white px-1">1. Select a Doctor</h2>

            {/* Filter Bar */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 space-y-4">
              {/* Search + Sort Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-800 dark:text-white text-sm"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="default">Sort: Default</option>
                  <option value="fee_asc">Fee: Low to High</option>
                  <option value="fee_desc">Fee: High to Low</option>
                  <option value="exp_desc">Most Experienced</option>
                </select>
              </div>

              {/* Specialization Chips */}
              <div className="flex flex-wrap gap-2">
                {ALL_SPECIALIZATIONS.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpec(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      selectedSpec === spec
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-slate-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-slate-200 dark:border-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {/* Range Sliders Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <span>Max Fee</span>
                    <span className="text-blue-600 dark:text-blue-400">₹{maxFee.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min={0} max={5000} step={100}
                    value={maxFee}
                    onChange={e => setMaxFee(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <span>Min Experience</span>
                    <span className="text-blue-600 dark:text-blue-400">{minExp}+ yrs</span>
                  </div>
                  <input
                    type="range" min={0} max={30} step={1}
                    value={minExp}
                    onChange={e => setMinExp(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span><strong className="text-gray-800 dark:text-white">{filteredDoctors.length}</strong> doctor{filteredDoctors.length !== 1 ? "s" : ""} found</span>
                {(searchQuery || selectedSpec !== "All" || maxFee < 5000 || minExp > 0) && (
                  <button onClick={() => { setSearchQuery(""); setSelectedSpec("All"); setMaxFee(5000); setMinExp(0); setSortBy("default"); }} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>

            {/* Doctor Grid */}
            {fetchLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                <div className="text-5xl mb-4">🔎</div>
                <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">No doctors match your filters</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting the specialty, fee, or experience filters.</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants} initial="hidden" animate="show"
                className="grid sm:grid-cols-2 gap-4"
              >
                {filteredDoctors.map(d => (
                  <motion.label
                    variants={itemVariants}
                    key={d._id}
                    className={`block cursor-pointer bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 transition-all duration-200 ${doctorId === d._id
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
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 transition-colors ${doctorId === d._id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400"}`}>
                        {d.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2 flex-wrap">
                          Dr. {d.name}
                          {recommendedDoctorId && d._id === recommendedDoctorId && (
                            <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">✨ AI Pick</span>
                          )}
                        </h3>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          {d.specialization || "General Physician"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg">
                            ⭐ {d.experience || 0}+ yrs
                          </span>
                          <span className="text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-lg border border-green-100 dark:border-green-800/50">
                            ₹{d.fees || 0}
                          </span>
                          <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                            {d.availableSlots?.length || 0} slots
                          </span>
                        </div>
                        {d.clinicAddress && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-1">
                            📍 {d.clinicAddress}
                          </p>
                        )}
                        {d.bio && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 italic">{d.bio}</p>
                        )}
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
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {date && doctorId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    {doctors.find(d => d._id === doctorId)?.leaveDays?.includes(date) ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 text-center">
                        <p className="text-red-600 dark:text-red-400 font-bold text-sm">
                          🩺 Dr. {doctors.find(d => d._id === doctorId)?.name} is on leave on this date.
                        </p>
                        <p className="text-red-500/80 dark:text-red-400/80 text-xs mt-1 font-medium">Please select another date.</p>
                      </div>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Time Slots</label>
                        <div className="flex flex-wrap gap-2">
                          {doctors.find(d => d._id === doctorId)?.availableSlots?.length > 0 ? (
                            doctors.find(d => d._id === doctorId).availableSlots.map(slot => {
                              const isBooked = bookedSlots.includes(slot);
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={isBooked}
                                  onClick={() => setTime(slot)}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isBooked ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 line-through"
                                    : time === slot ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-500"
                                    }`}
                                >
                                  {slot}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">This doctor has no available time slots.</p>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Consultation Type</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer transition-all ${appointmentType === "In-Person" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-600"}`}>
                    <input type="radio" name="appointmentType" value="In-Person" className="sr-only" checked={appointmentType === "In-Person"} onChange={(e) => setAppointmentType(e.target.value)} />
                    🏥 Clinic
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer transition-all ${appointmentType === "Online" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-600"}`}>
                    <input type="radio" name="appointmentType" value="Online" className="sr-only" checked={appointmentType === "Online"} onChange={(e) => setAppointmentType(e.target.value)} />
                    📹 Video
                  </label>
                </div>
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
                    {doctors.find(d => d._id === doctorId)?.clinicAddress && (
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 font-bold">📍 {doctors.find(d => d._id === doctorId).clinicAddress}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 flex items-center justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Type</span>
                      <span className="text-gray-900 dark:text-white flex items-center gap-1">
                        {appointmentType === "Online" ? "📹 Video Call" : "🏥 In-Person"}
                      </span>
                    </div>
                    {date && (
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-400">Date</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(date).toLocaleDateString()} {time && `at ${time}`}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleBook}
                disabled={loading || !doctorId || !date || !time}
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