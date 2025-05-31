import React, { useState, useEffect, useRef } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizePhone } from "../../utils/phone";
import logo from "../../public/logo.png";

type Step = "phone" | "otp" | "business";

const Login: React.FC = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user?.displayName) {
        navigate("/dashboard");
      }
    });
    return unsub;
  }, [navigate]);

  const initializeRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => setError(""),
          "expired-callback": () => {
            setError("reCAPTCHA expired. Please try again.");
            recaptchaRef.current?.clear();
            recaptchaRef.current = null;
          },
        }
      );
    }
    return recaptchaRef.current;
  };

  const handlePhoneNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formatted = normalizePhone(phoneNumber);
      if (!/^\+[1-9]\d{9,14}$/.test(formatted)) {
        throw new Error("Invalid phone number");
      }
      setPhoneNumber(formatted);

      // request OTP
      const appVerifier = initializeRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        formatted,
        appVerifier
      );
      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError("");
    try {
      const userCred = await confirmationResult.confirm(verificationCode);
      if (userCred.user.displayName) {
        navigate("/dashboard");
      } else {
        setStep("business");
      }
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Business name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, { displayName: businessName });
        navigate("/dashboard");
      }
    } catch {
      setError("Failed to save business name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Logo"
              width={61}
              height={61}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Leads Manager
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <div id="recaptcha-container" className="hidden" />

        {step === "phone" && (
          <form onSubmit={handlePhoneNext} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="pl-10 block w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter a number with country code.
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Next"}{" "}
              <ArrowRight size={18} className="inline ml-2" />
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="block w-full rounded-lg border px-4 py-3"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying…" : "Verify"}{" "}
              <ArrowRight size={18} className="inline ml-2" />
            </button>
          </form>
        )}

        {step === "business" && (
          <form onSubmit={handleBusinessNext} className="space-y-6">
            <div>
              <label
                htmlFor="business"
                className="block text-sm font-medium mb-1"
              >
                Business Name
              </label>
              <input
                id="business"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
                className="block w-full rounded-lg border px-4 py-3"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Saving…" : "Continue"}{" "}
              <ArrowRight size={18} className="inline ml-2" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
