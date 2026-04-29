import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// We dynamically route users based on role
const DashboardRouter = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return user.role === "doctor" ? <DoctorDashboard /> : <Dashboard />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: '!bg-white !text-slate-900 dark:!bg-slate-800 dark:!text-white border dark:border-slate-700 shadow-xl',
            duration: 3000,
            success: { duration: 2000 },
            error: { duration: 2000 }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Patient Only Routes */}
          <Route element={<PrivateRoute allowedRoles={["patient"]} />}>
            <Route path="/book" element={<BookAppointment />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;