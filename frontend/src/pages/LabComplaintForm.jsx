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
import { Upload } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  roll_number: z.string().min(1, "Roll number is required"),
  stream: z.string().min(1, "Stream is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  lab_number: z.string().min(1, "Lab number is required"),
  complaint: z.string().min(10, "Complaint must be at least 10 characters"),
});

const LabComplaintForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let photoBase64 = null;
      if (photoFile) {
        const reader = new FileReader();
        photoBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(photoFile);
        });
      }

      await axios.post(`${BACKEND_URL}/api/lab-complaints`, {
        ...data,
        photo_base64: photoBase64,
      });

      toast.success("Complaint submitted successfully! You'll receive email updates.");
      reset();
      setPhotoFile(null);
      setPhotoPreview(null);
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
              Lab Complaint Form
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

            <div className="grid md:grid-cols-2 gap-6">
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
                <Label htmlFor="lab_number" data-testid="lab-number-label">
                  Lab Number *
                </Label>
                <Input
                  data-testid="lab-number-input"
                  id="lab_number"
                  {...register("lab_number")}
                  placeholder="e.g., Lab 101"
                />
                {errors.lab_number && (
                  <p className="text-sm text-red-600">{errors.lab_number.message}</p>
                )}
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="photo" data-testid="photo-label">
                Attach Photo (Optional)
              </Label>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="photo"
                  className="cursor-pointer flex items-center space-x-2 bg-white border border-slate-200 hover:border-blue-600 rounded-md px-4 py-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">
                    {photoFile ? photoFile.name : "Choose file"}
                  </span>
                </label>
                <input
                  data-testid="photo-input"
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                  />
                </div>
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
                onClick={() => navigate("/lab/role")}
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

export default LabComplaintForm;
