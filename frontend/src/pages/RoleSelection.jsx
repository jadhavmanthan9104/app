import { useNavigate } from "react-router-dom";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";

const RoleSelection = ({ type }) => {
  const navigate = useNavigate();
  const title = type === "lab" ? "Lab Complaint" : "ICC Complaint";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-base text-slate-600">Select your role to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            data-testid="student-role-btn"
            onClick={() => navigate(`/${type}/student`)}
            className="bg-white border-2 border-slate-200 hover:border-blue-600 hover:bg-slate-50 rounded-lg p-8 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg group-hover:bg-blue-100 transition-colors">
                <GraduationCap className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  Student
                </h3>
                <p className="text-sm text-slate-600">
                  Submit a new complaint
                </p>
              </div>
            </div>
          </button>

          <button
            data-testid="admin-role-btn"
            onClick={() => navigate(`/${type}/admin/auth`)}
            className="bg-white border-2 border-slate-200 hover:border-blue-600 hover:bg-slate-50 rounded-lg p-8 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-slate-900 p-4 rounded-lg group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  Admin
                </h3>
                <p className="text-sm text-slate-600">
                  Manage and review complaints
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-8">
          <Button
            data-testid="back-btn"
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-slate-600 hover:text-slate-900"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
