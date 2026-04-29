import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const userStr = localStorage.getItem("user");
  const isLogged = !!userStr;

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-50/50 dark:bg-slate-900/50" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-indigo-100/40 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60" />
        </div>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-8 border border-blue-200 dark:border-blue-800/50">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
            Your health, our priority
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 sm:mb-8 leading-tight">
            Healthcare made <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              simple & accessible
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Book appointments with top-rated doctors, manage your health records,
            and get the care you need instantly, entirely online.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {isLogged ? (
               <Link 
                 to="/dashboard" 
                 className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
               >
                 Go to Dashboard
               </Link>
             ) : (
               <>
                 <Link 
                   to="/register" 
                   className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                 >
                   Get Started Today
                 </Link>
                 <Link 
                   to="/login" 
                   className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-full font-bold text-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                 >
                   Log In to Account
                 </Link>
               </>
             )}
          </div>
        </motion.div>
      </div>

      {/* Statistics Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center sm:divide-x divide-white/20"
          >
            {[
              { num: "10,000+", label: "Happy Patients" },
              { num: "500+", label: "Expert Doctors" },
              { num: "50+", label: "Specialties" },
              { num: "4.9/5", label: "Average Rating" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col">
                <span className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.num}</span>
                <span className="text-blue-100 font-medium text-sm uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-3">Our Benefits</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Why choose CareSync 360?</h3>
          </motion.div>
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: "👩‍⚕️",
                title: "Expert Doctors",
                desc: "Access to highly qualified and experienced medical professionals across various specialties globally.",
                bg: "bg-blue-50/50 dark:bg-blue-900/10",
                hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                iconBg: "bg-blue-100 dark:bg-blue-900/40"
              },
              {
                icon: "📅",
                title: "Easy Booking",
                desc: "Schedule appointments effortlessly with our intuitive booking system any time, anywhere.",
                bg: "bg-indigo-50/50 dark:bg-indigo-900/10",
                hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                iconBg: "bg-indigo-100 dark:bg-indigo-900/40"
              },
              {
                icon: "⚡",
                title: "Instant Updates",
                desc: "Receive real-time notifications about your appointment status and quick digital prescriptions.",
                bg: "bg-purple-50/50 dark:bg-purple-900/10",
                hover: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
                iconBg: "bg-purple-100 dark:bg-purple-900/40"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} variants={fadeUp}
                className={`p-8 rounded-3xl ${feature.bg} ${feature.hover} transition-all border border-transparent dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 cursor-default`}
              >
                <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-3">Process</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">How it works in 3 easy steps</h3>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12 relative"
          >
            {/* Desktop Connective Line */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-1 bg-slate-200 dark:bg-slate-700 z-0"></div>

            {[
              { step: "01", title: "Find your doctor", desc: "Search by specialty, location, or name to find the perfect professional." },
              { step: "02", title: "Pick a time", desc: "Review their schedule and select an available time that works for you." },
              { step: "03", title: "Get Care", desc: "Consult with your doctor online or in-person and feel better." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-xl flex items-center justify-center mb-6 text-3xl font-black text-blue-600 dark:text-blue-400">
                  {item.step}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 px-4">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-3">Reviews</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Loved by thousands</h3>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                text: "CareSync 360 made it completely effortless to find a top pediatrician for my daughter. Highly recommended!",
                name: "Sarah Jenkins", role: "Patient"
              },
              {
                text: "The scheduling interface is brilliant. As a doctor, having this interactive calendar has saved me hours.",
                name: "Dr. Mark R.", role: "Cardiologist"
              },
              {
                text: "I was able to book a consultation within exactly 5 minutes of signing up. Truly a modern healthcare experience.",
                name: "David Chen", role: "Patient"
              }
            ].map((review, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
                <div className="text-indigo-200 dark:text-indigo-900 text-6xl absolute top-4 right-6 font-serif">"</div>
                <div className="flex gap-1 mb-4 text-amber-400 text-sm">
                   ⭐⭐⭐⭐⭐
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-6 relative z-10 line-clamp-4">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white text-sm">{review.name}</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 py-16 border-t border-slate-200 dark:border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">CareSync 360</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Modernizing healthcare accessibility by bringing the clinic directly to your screen.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Find a Doctor</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Book Consultation</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 tracking-wider">Subscribe</h4>
            <p className="text-xs text-slate-400 mb-4">Get the latest healthcare updates directly in your inbox.</p>
            <div className="flex bg-slate-900 rounded-xl overflow-hidden focus-within:ring-2 ring-blue-500 border border-slate-800">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent w-full px-4 py-3 text-sm text-white focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 font-bold text-sm transition-colors">
                &rarr;
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CareSync 360 Medical Technologies. All rights reserved.
          </p>
          <div className="flex gap-4 text-slate-500">
             <span className="cursor-pointer hover:text-white transition-colors">X</span>
             <span className="cursor-pointer hover:text-white transition-colors">IN</span>
             <span className="cursor-pointer hover:text-white transition-colors">FB</span>
          </div>
        </div>
      </footer>

    </div>
  );
}