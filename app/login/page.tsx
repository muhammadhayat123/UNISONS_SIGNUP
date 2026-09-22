"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "../lib/api";
import Toast from "../components/ui/Toast";

interface FormState {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface ToastState {
  message: string;
  type: "success" | "error";
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser({
        email: form.email.trim(),
        password: form.password,
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

      setToast({ message: `Welcome back, ${res.data.username}!`, type: "success" });
      setTimeout(() => {
        if (res.data.designation === 'admin') {
          router.push("/admin/dashboard");
        } else {
          router.push("/seller/dashboard");
        }
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setToast({ message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  // Common bold input class
  const inputBaseClass =
    "w-full rounded-xl border border-gray-400/80 bg-white/40 px-4 py-3.5 text-base font-semibold text-black placeholder:text-gray-600 placeholder:font-normal outline-none backdrop-blur-md transition-all focus:border-orange-600 focus:bg-white/60 focus:ring-4 focus:ring-orange-500/20";

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4 py-12">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
      )}

      {/* Form size increased to max-w-lg */}
      <div className="w-full max-w-lg">
        {/* Card with subtle transparent backdrop */}
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
                Welcome Back
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-700">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-gray-900"
                >
                  Password
                </label>
                <span className="text-xs font-bold text-orange-600 cursor-pointer hover:underline hover:text-orange-700 transition-colors">
                  Forgot password?
                </span>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
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
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}