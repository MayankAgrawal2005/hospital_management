import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "",
    experience: "",
    fees: "",
    bio: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!form.name || !form.email || !form.password) {
        toast.error("Please fill all required fields");
        return;
      }

      if (form.role === "doctor") {
        if (!form.specialization || !form.experience || !form.fees) {
          toast.error("Please fill all doctor details");
          return;
        }
      }

      setLoading(true);

      const payload = {
        ...form,
        experience: form.experience ? Number(form.experience) : null,
        fees: form.fees ? Number(form.fees) : null
      };

      await API.post("/auth/register", payload);
      toast.success("Successfully registered! Please login.");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration failed. Please check your connection.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 mt-16 pb-12">
        <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none p-8 sm:p-10 border border-slate-100 dark:border-slate-700 transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Join CarePoint today to manage your health seamlessly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type *</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            {/* Doctor Section */}
            {form.role === "doctor" && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Professional Details
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization *</label>
                    <input
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiologist"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (years) *</label>
                    <input
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      type="number"
                      placeholder="e.g. 10"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Consultation Fees *</label>
                    <input
                      name="fees"
                      value={form.fees}
                      onChange={handleChange}
                      type="number"
                      placeholder="e.g. 500"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Brief description about yourself"
                    rows="3"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}