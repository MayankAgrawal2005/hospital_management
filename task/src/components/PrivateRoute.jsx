import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if user role is allowed for this route
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid user data in local storage:", error);
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
