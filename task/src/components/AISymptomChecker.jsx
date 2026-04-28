import { useState } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AISymptomChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();

  const handleTriage = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      // 1. Fetch available doctors
      const docRes = await API.get("/users?role=doctor");
      const availableDoctors = docRes.data.map(d => ({
        _id: d._id,
        name: d.name,
        specialization: d.specialization
      }));

      // 2. Send symptoms and doctors to AI
      const res = await API.post("/ai/triage", { symptoms, availableDoctors });
      setResponse(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (response?.recommendedDoctorId) {
      navigate(`/book?doctorId=${response.recommendedDoctorId}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">AI Triage</h3>
                  <p className="text-blue-100 text-xs">Symptom Checker</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 max-h-[400px] overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
              {!response ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm text-sm text-gray-700 dark:text-gray-300">
                    Hi! I'm your AI medical assistant. Please describe your symptoms in detail, and I'll help you find the right specialist.
                  </div>
                  
                  <form onSubmit={handleTriage} className="mt-4">
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g., I have a sharp chest pain and numbness in my left arm..."
                      className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-gray-900 dark:text-white resize-none h-32 shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={loading || !symptoms.trim()}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      {loading ? "Analyzing..." : "Analyze Symptoms"}
                    </button>
                  </form>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl rounded-tr-none text-sm text-gray-800 dark:text-gray-200 ml-8 shadow-sm">
                    "{symptoms}"
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold">
                      <span>✨</span> AI Recommendation
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {response.recommendation}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-bold">Recommended Specialist</p>
                      <div className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                        🩺 AI Recommended Match
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleBook}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => {
                            setResponse(null);
                            setSymptoms("");
                          }}
                          className="px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all text-sm"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl shadow-xl shadow-blue-500/40 hover:shadow-2xl transition-all text-white border-4 border-white dark:border-slate-900 cursor-pointer"
      >
        {isOpen ? "✕" : "🤖"}
      </motion.button>
    </div>
  );
}
