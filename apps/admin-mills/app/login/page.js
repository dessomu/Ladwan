"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { translations } from "@/lib/translations";
import {
  Wheat,
  Store,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Gauge,
  Languages,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    error: authError,
    isFirebaseConfigured,
    DEMO_USERS,
    loginWithEmail,
    loginWithDemo,
    registerMillOwner,
    clearError,
  } = useAuth();

  const [lang, setLang] = useState("hi");
  const [activeTab, setActiveTab] = useState("login"); // "login" | "signup"
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupData, setSignupData] = useState({
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    millName: "",
    millEnglishName: "",
    address: "",
    area: "",
    city: "Gurugram",
    pincode: "122001",
    millingCapacityKgPerHour: 100,
  });

  // Load saved language on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("ladwan_admin_lang_v1");
      if (savedLang) setLang(savedLang);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const toggleLanguage = () => {
    const nextLang = lang === "hi" ? "en" : "hi";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ladwan_admin_lang_v1", nextLang);
      window.dispatchEvent(
        new CustomEvent("ladwan:admin-store-updated", { detail: { lang: nextLang } })
      );
    }
  };

  const t = translations[lang] || translations.hi;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLocalError(lang === "hi" ? "कृपया ईमेल और पासवर्ड दर्ज करें।" : "Please enter email and password.");
      return;
    }

    setSubmitting(true);
    const res = await loginWithEmail(loginEmail, loginPassword);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setLocalError(res.error || (lang === "hi" ? "लॉगिन विफल रहा" : "Login failed"));
    }
  };

  const handleDemoLogin = async (demoKey) => {
    setLocalError("");
    clearError();
    setSubmitting(true);
    const res = await loginWithDemo(demoKey);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setLocalError(res.error || "Demo login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!signupData.ownerName.trim()) {
      setLocalError(lang === "hi" ? "कृपया चक्की मालिक का नाम दर्ज करें।" : "Please enter owner name.");
      return;
    }
    if (!signupData.email.trim() || !signupData.password.trim()) {
      setLocalError(lang === "hi" ? "कृपया वैध ईमेल और पासवर्ड दर्ज करें।" : "Please provide email and password.");
      return;
    }
    if (signupData.password.length < 6) {
      setLocalError(lang === "hi" ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "Password must be at least 6 characters.");
      return;
    }
    if (!signupData.millName.trim()) {
      setLocalError(lang === "hi" ? "कृपया चक्की का नाम दर्ज करें।" : "Please enter mill name.");
      return;
    }

    setSubmitting(true);
    const res = await registerMillOwner(signupData);
    setSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setLocalError(res.error || "Registration failed");
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Language Bar */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <Wheat className="w-4 h-4 text-stone-950 font-bold" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-stone-100 flex items-center gap-1.5">
              <span>लाडवां</span>
              <span className="text-amber-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                CHAKKI ADMIN
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 text-xs font-semibold shadow transition-all active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === "hi" ? "English" : "हिन्दी"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Brand header inside card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
              <Store className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
              {activeTab === "login" ? t.loginTitle : t.signupTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              {activeTab === "login" ? t.loginSubtitle : t.signupSubtitle}
            </p>
          </div>

          {/* Mode Indicator Banner */}
          <div className="mb-5 p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-[11px] flex items-center justify-between text-stone-300">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="font-medium text-stone-300">
                {isFirebaseConfigured ? t.liveFirebase : t.demoStoreActive}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">
              {isFirebaseConfigured ? "Firebase Auth" : "Local Reactive Store"}
            </span>
          </div>

          {/* Navigation Tabs (Login vs Register) */}
          <div className="flex p-1 bg-stone-950 rounded-2xl border border-stone-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setLocalError("");
                clearError();
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "login"
                  ? "bg-amber-500 text-stone-950 shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {lang === "hi" ? "लॉगिन करें (Sign In)" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setLocalError("");
                clearError();
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "signup"
                  ? "bg-amber-500 text-stone-950 shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {lang === "hi" ? "नई चक्की रजिस्टर (Register)" : "Register Mill"}
            </button>
          </div>

          {/* Error Message Box */}
          {displayError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === "login" && (
            <div>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>{t.signingInBtn}</span>
                  ) : (
                    <>
                      <span>{t.signInBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Instant Demo Login Option */}
              <div className="mt-6 pt-5 border-t border-stone-800">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.orDemoLogin}</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDemoLogin("mill_owner_1")}
                    className="w-full p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-amber-500/20 hover:border-amber-500/40 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-300">
                          {t.demoShreeRam}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Sector 14, Gurugram • 120 kg/hr Stone Mill
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDemoLogin("mill_owner_2")}
                    className="w-full p-3 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/30 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-300">
                          {t.demoKrishna}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Old Railway Road • Emery & Stone Grinders
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW MILL FORM */}
          {activeTab === "signup" && (
            <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Section 1: Owner Details */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>1. {lang === "hi" ? "चक्की मालिक की जानकारी" : "Owner Information"}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {t.ownerNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.ownerName}
                    onChange={(e) => setSignupData({ ...signupData, ownerName: e.target.value })}
                    placeholder={t.ownerNamePlaceholder}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {t.passwordLabel} *
                    </label>
                    <input
                      type="password"
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder={t.passwordPlaceholder}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {t.emailLabel} *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder={t.emailPlaceholder}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Section 2: Mill Details */}
              <div className="space-y-3 pt-3 border-t border-stone-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>2. {lang === "hi" ? "चक्की का विवरण" : "Mill Details"}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {t.millHindiNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.millName}
                    onChange={(e) => setSignupData({ ...signupData, millName: e.target.value })}
                    placeholder={t.millHindiNamePlaceholder}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {t.millEnglishNameSignupLabel}
                  </label>
                  <input
                    type="text"
                    value={signupData.millEnglishName}
                    onChange={(e) => setSignupData({ ...signupData, millEnglishName: e.target.value })}
                    placeholder={t.millEnglishNameSignupPlaceholder}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {t.addressSignupLabel}
                  </label>
                  <input
                    type="text"
                    value={signupData.address}
                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                    placeholder={t.addressSignupPlaceholder}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {t.areaSignupLabel}
                    </label>
                    <input
                      type="text"
                      value={signupData.area}
                      onChange={(e) => setSignupData({ ...signupData, area: e.target.value })}
                      placeholder={t.areaSignupPlaceholder}
                      className="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {t.citySignupLabel}
                    </label>
                    <input
                      type="text"
                      value={signupData.city}
                      onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                      placeholder={t.citySignupPlaceholder}
                      className="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {t.pincodeSignupLabel}
                    </label>
                    <input
                      type="text"
                      value={signupData.pincode}
                      onChange={(e) => setSignupData({ ...signupData, pincode: e.target.value })}
                      placeholder={t.pincodeSignupPlaceholder}
                      className="w-full px-2 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    {t.capacityLabel}
                  </label>
                  <input
                    type="number"
                    value={signupData.millingCapacityKgPerHour}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        millingCapacityKgPerHour: Number(e.target.value) || 100,
                      })
                    }
                    placeholder={t.capacityPlaceholder}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>{t.registeringBtn}</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.completeRegistrationBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Assistance Info */}
          <div className="mt-6 text-center text-[11px] text-stone-400">
            {activeTab === "login" ? (
              <p>
                {t.noAccountPrompt}{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300"
                >
                  {t.registerChakkiBtn}
                </button>
              </p>
            ) : (
              <p>
                {t.haveAccountPrompt}{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300"
                >
                  {t.loginBackBtn}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-stone-400 border-t border-stone-800/60 bg-stone-950/60">
        <span>लाडवां पारंपरिक पत्थर-पिसा आटा नेटवर्क • Ladwan Chakki Ecosystem</span>
      </footer>
    </div>
  );
}
