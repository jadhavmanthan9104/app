import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, type }) => {
  const token = localStorage.getItem(`${type}_admin_token`);
  
  if (!token) {
    return <Navigate to={`/${type}/admin/auth`} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
