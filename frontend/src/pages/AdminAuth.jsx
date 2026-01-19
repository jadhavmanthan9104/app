import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
});

const AdminAuth = ({ type }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const title = type === "lab" ? "Lab Admin" : "ICC Admin";
  const endpoint = type === "lab" ? "lab-admin" : "icc-admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const url =
        activeTab === "login"
          ? `${BACKEND_URL}/api/auth/${endpoint}/login`
          : `${BACKEND_URL}/api/auth/${endpoint}/signup`;

      const payload =
        activeTab === "login"
          ? { email: data.email, password: data.password }
          : data;

      const response = await axios.post(url, payload);

      localStorage.setItem(`${type}_admin_token`, response.data.token);
      localStorage.setItem(`${type}_admin_data`, JSON.stringify(response.data.admin));

      toast.success(`${activeTab === "login" ? "Login" : "Signup"} successful!`);
      reset();
      navigate(`/${type}/admin/dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.detail || `${activeTab} failed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1758413149188-4ce9c737ed3f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYXJjaGl0ZWN0dXJlJTIwYWJzdHJhY3R8ZW58MHx8fHwxNzY4Nzk5NTk4fDA&ixlib=rb-4.1.0&q=85')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
      <div className="relative max-w-md w-full">
        <Card className="p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-base text-slate-600">Access your dashboard</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="auth-tabs">
              <TabsTrigger value="login" data-testid="login-tab">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" data-testid="signup-tab">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" data-testid="email-label">
                    Email
                  </Label>
                  <Input
                    data-testid="email-input"
                    id="login-email"
                    type="email"
                    {...register("email")}
                    placeholder="admin@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" data-testid="password-label">
                    Password
                  </Label>
                  <Input
                    data-testid="password-input"
                    id="login-password"
                    type="password"
                    {...register("password")}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  data-testid="login-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" data-testid="name-label">
                    Full Name
                  </Label>
                  <Input
                    data-testid="name-input"
                    id="signup-name"
                    {...register("name")}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" data-testid="signup-email-label">
                    Email
                  </Label>
                  <Input
                    data-testid="signup-email-input"
                    id="signup-email"
                    type="email"
                    {...register("email")}
                    placeholder="admin@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" data-testid="signup-password-label">
                    Password
                  </Label>
                  <Input
                    data-testid="signup-password-input"
                    id="signup-password"
                    type="password"
                    {...register("password")}
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  data-testid="signup-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate(`/${type}/role`)}
              className="text-slate-600 hover:text-slate-900"
            >
              ← Back
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
