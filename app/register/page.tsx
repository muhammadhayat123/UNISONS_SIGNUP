"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser, type Designation } from "../lib/api";
import Toast from "../components/ui/Toast";

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  designation: Designation;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.username.trim()) {
    errors.username = "Username is required.";
  } else if (values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    designation: "seller",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleDesignationChange(value: Designation) {
    setForm((prev) => ({ ...prev, designation: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        designation: form.designation,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          designation: res.data.designation,
        })
      );

      setToast({ message: "Account created successfully! Redirecting…", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setToast({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  // Consistent input styling: Bold text, clear border, transparent glass look
  const inputBaseClass =
    "w-full rounded-xl border border-gray-400/80 bg-white/40 px-4 py-3.5 text-base font-semibold text-black placeholder:text-gray-600 placeholder:font-normal outline-none backdrop-blur-md transition-all focus:border-orange-600 focus:bg-white/60 focus:ring-4 focus:ring-orange-500/20";

  const designationOptions: { value: Designation; label: string; description: string }[] = [
    { value: "seller", label: "Seller", description: "Manage products & orders" },
    { value: "admin", label: "Admin", description: "Full platform access" },
  ];

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4 py-12">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
      )}

      {/* Increased container width from max-w-md to max-w-lg */}
      <div className="w-full max-w-lg">
        {/* Card with subtle glass backdrop for readability */}
        <div className="rounded-3xl border border-white/40 bg-white/20 backdrop-blur-xl shadow-2xl px-10 py-12">
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <Image
              src="/logo.png"
              alt="Unisons Logo"
              width={220}
              height={62}
              className="h-16 w-auto object-contain"
              priority
            />
            <div className="w-full border-t border-gray-300/40" />
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
                Create an Account
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-700">
                Already have one?{" "}
                <Link
                  href="/login"
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-bold text-gray-900">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.username ? "border-red-500 ring-2 ring-red-300" : ""
                }`}
              />
              {errors.username && (
                <p className="text-xs font-semibold text-red-600" role="alert">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-bold text-gray-900">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.email ? "border-red-500 ring-2 ring-red-300" : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs font-semibold text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Designation */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-gray-900">Designation</span>
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Select your designation"
              >
                {designationOptions.map(({ value, label, description }) => {
                  const isSelected = form.designation === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleDesignationChange(value)}
                      className={[
                        "flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all",
                        "focus:outline-none focus:ring-4 focus:ring-orange-500/20",
                        isSelected
                          ? "border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/40 backdrop-blur-md"
                          : "border-gray-400/80 bg-white/40 hover:border-orange-400/60 hover:bg-white/50 backdrop-blur-md",
                      ].join(" ")}
                    >
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-orange-700" : "text-gray-900"
                        }`}
                      >
                        {label}
                      </span>
                      <span className="mt-0.5 text-xs font-normal text-gray-500">
                        {description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-bold text-gray-900">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.password ? "border-red-500 ring-2 ring-red-300" : ""
                }`}
              />
              {errors.password && (
                <p className="text-xs font-semibold text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-900">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`${inputBaseClass} ${
                  errors.confirmPassword ? "border-red-500 ring-2 ring-red-300" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-orange-700 hover:shadow-orange-600/30 focus:outline-none focus:ring-4 focus:ring-orange-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-gray-800">
          By registering you agree to our{" "}
          <span className="font-bold text-orange-600 cursor-pointer hover:underline">Terms of Service</span>.
        </p>
      </div>
    </div>
  );
}