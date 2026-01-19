import { useNavigate } from "react-router-dom";
import { FlaskConical, Scale } from "lucide-react";
import { Button } from "../components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="w-full md:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1741766936431-406804fc36c8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYXJjaGl0ZWN0dXJlJTIwYWJzdHJhY3R8ZW58MHx8fHwxNzY4Nzk5NTk4fDA&ixlib=rb-4.1.0&q=85')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        <div className="relative h-full min-h-[300px] md:min-h-screen flex items-center justify-center p-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Complaint Management Portal
            </h1>
            <p className="text-lg md:text-xl text-slate-200">
              Your voice matters. We're here to help.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-900 mb-2">
              Select Complaint Type
            </h2>
            <p className="text-base text-slate-600">
              Choose the appropriate category for your complaint
            </p>
          </div>

          <div className="space-y-4">
            <button
              data-testid="lab-complaint-btn"
              onClick={() => navigate("/lab/role")}
              className="w-full bg-white border-2 border-slate-200 hover:border-blue-600 hover:bg-slate-50 rounded-lg p-6 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FlaskConical className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    Lab Complaint
                  </h3>
                  <p className="text-sm text-slate-600">
                    Report issues related to laboratory facilities
                  </p>
                </div>
              </div>
            </button>

            <button
              data-testid="icc-complaint-btn"
              onClick={() => navigate("/icc/role")}
              className="w-full bg-white border-2 border-slate-200 hover:border-blue-600 hover:bg-slate-50 rounded-lg p-6 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    ICC Complaint
                  </h3>
                  <p className="text-sm text-slate-600">
                    Internal Complaints Committee related issues
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
