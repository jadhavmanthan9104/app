import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./pages/LandingPage";
import RoleSelection from "./pages/RoleSelection";
import LabComplaintForm from "./pages/LabComplaintForm";
import ICCComplaintForm from "./pages/ICCComplaintForm";
import AdminAuth from "./pages/AdminAuth";
import LabAdminDashboard from "./pages/LabAdminDashboard";
import ICCAdminDashboard from "./pages/ICCAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/lab/role" element={<RoleSelection type="lab" />} />
          <Route path="/icc/role" element={<RoleSelection type="icc" />} />
          <Route path="/lab/student" element={<LabComplaintForm />} />
          <Route path="/icc/student" element={<ICCComplaintForm />} />
          <Route path="/lab/admin/auth" element={<AdminAuth type="lab" />} />
          <Route path="/icc/admin/auth" element={<AdminAuth type="icc" />} />
          <Route
            path="/lab/admin/dashboard"
            element={
              <ProtectedRoute type="lab">
                <LabAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/icc/admin/dashboard"
            element={
              <ProtectedRoute type="icc">
                <ICCAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
