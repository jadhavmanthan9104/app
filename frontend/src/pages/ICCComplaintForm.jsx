import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  roll_number: z.string().min(1, "Roll number is required"),
  stream: z.string().min(1, "Stream is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  complaint: z.string().min(10, "Complaint must be at least 10 characters"),
});

const ICCComplaintForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await axios.post(`${BACKEND_URL}/api/icc-complaints`, data);

      toast.success("Complaint submitted successfully! You'll receive email updates.");
      reset();
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              ICC Complaint Form
            </h1>
            <p className="text-base text-slate-600">
              Please fill out all required fields below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" data-testid="name-label">
                  Full Name *
                </Label>
                <Input
                  data-testid="name-input"
                  id="name"
                  {...register("name")}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roll_number" data-testid="roll-label">
                  Roll Number *
                </Label>
                <Input
                  data-testid="roll-input"
                  id="roll_number"
                  {...register("roll_number")}
                  placeholder="Enter your roll number"
                />
                {errors.roll_number && (
                  <p className="text-sm text-red-600">{errors.roll_number.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stream" data-testid="stream-label">
                  Stream *
                </Label>
                <Input
                  data-testid="stream-input"
                  id="stream"
                  {...register("stream")}
                  placeholder="e.g., Computer Science"
                />
                {errors.stream && (
                  <p className="text-sm text-red-600">{errors.stream.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" data-testid="phone-label">
                  Phone Number *
                </Label>
                <Input
                  data-testid="phone-input"
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" data-testid="email-label">
                Email ID *
              </Label>
              <Input
                data-testid="email-input"
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint" data-testid="complaint-label">
                Complaint Description *
              </Label>
              <Textarea
                data-testid="complaint-textarea"
                id="complaint"
                {...register("complaint")}
                placeholder="Describe your complaint in detail..."
                rows={5}
                className="resize-none"
              />
              {errors.complaint && (
                <p className="text-sm text-red-600">{errors.complaint.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                data-testid="submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
              <Button
                data-testid="cancel-btn"
                type="button"
                variant="outline"
                onClick={() => navigate("/icc/role")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ICCComplaintForm;
