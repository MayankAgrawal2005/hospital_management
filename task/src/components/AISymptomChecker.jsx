import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AISymptomChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your AI medical assistant. Please describe your symptoms in detail, and I'll help you find the right specialist." }
  ]);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleTriage = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    const userMessage = symptoms.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setSymptoms("");
    setLoading(true);
    setResponse(null);

    try {
      const docRes = await API.get("/users?role=doctor");
      const availableDoctors = docRes.data.map(d => ({
        _id: d._id,
        name: d.name,
        specialization: d.specialization
      }));

      const res = await API.post("/ai/triage", { symptoms: userMessage, availableDoctors });
      setResponse(res.data);
      setMessages(prev => [...prev, { 
        role: "bot", 
        text: res.data.recommendation,
        isRecommendation: true,
        doctorId: res.data.recommendedDoctorId
      }]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze symptoms");
      setMessages(prev => [...prev, { role: "bot", text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (doctorId) => {
    if (doctorId) {
      navigate(`/book?doctorId=${doctorId}`);
      setIsOpen(false);
    }
  };

  const BotIcon = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
      <circle cx="50" cy="50" r="50" fill="url(#botGradient)" />
      <rect x="25" y="35" width="50" height="40" rx="12" fill="white" />
      <rect x="35" y="45" width="8" height="8" rx="4" fill="#4F46E5" />
      <rect x="57" y="45" width="8" height="8" rx="4" fill="#4F46E5" />
      <rect x="42" y="62" width="16" height="4" rx="2" fill="#E2E8F0" />
      <path d="M50 35V25M50 25L45 20M50 25L55 20" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="45" cy="20" r="3" fill="#FF4B2B" />
      <circle cx="55" cy="20" r="3" fill="#FF4B2B" />
      <defs>
        <linearGradient id="botGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-24 right-0 w-[calc(100vw-2rem)] max-w-[400px] sm:w-[400px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[600px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
               
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <BotIcon />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight">CareBot AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Always Active</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative z-10"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50 custom-scrollbar scroll-smooth">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "bot" ? -10 : 10, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  key={idx}
                  className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"} items-end gap-2`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md mb-1 transform -rotate-6">
                       <BotIcon />
                    </div>
                  )}
                  <div className="max-w-[85%] flex flex-col gap-1">
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm
                      ${msg.role === "bot" 
                        ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700" 
                        : "bg-indigo-600 text-white rounded-br-none shadow-indigo-200 dark:shadow-none"
                      }`}
                    >
                      {msg.text}
                      
                      {msg.isRecommendation && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                           <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl">
                             <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-lg shadow-sm">🩺</div>
                             <div>
                               <p className="text-[10px] font-bold text-indigo-500 uppercase">Top Match</p>
                               <p className="font-bold text-indigo-900 dark:text-indigo-100">Best Specialist Recommended</p>
                             </div>
                           </div>
                           <button
                             onClick={() => handleBook(msg.doctorId)}
                             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md active:scale-95"
                           >
                             Schedule Now &rarr;
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 transform -rotate-6">
                    <BotIcon />
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></motion.div>
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></motion.div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <form onSubmit={handleTriage} className="flex gap-2">
                <input
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !symptoms.trim()}
                  className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none active:scale-95"
                >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-4 font-medium uppercase tracking-widest">Powered by Advanced Healthcare AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
         <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
         />
         
         <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all text-white border-4 border-white dark:border-slate-900 relative z-10 cursor-pointer overflow-hidden
            ${isOpen ? "rotate-180" : ""}`}
        >
          {isOpen ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <div className="relative group-hover:scale-110 transition-transform duration-300">
               <BotIcon />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
        </motion.button>
        
        {!isOpen && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="absolute right-24 top-1/2 -translate-y-1/2 hidden md:block"
           >
             <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap">
               <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Need help? Ask CareBot! ✨</p>
               <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-r border-t border-slate-100 dark:border-slate-700 transform rotate-45"></div>
             </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
