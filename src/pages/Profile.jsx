import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile({ onNavigateTab }) {
  const { user, updateUserProfile, changePassword } = useAuth();

  // Edit Profile State
  const [name, setName] = useState(user?.name || "Super Admin");
  const [email, setEmail] = useState(user?.email || "admin@skywardens.com");
  const [phone, setPhone] = useState(user?.phone || "9999999999");
  const [avatarPreview, setAvatarPreview] = useState(() => {
    if (user?.avatar && (user.avatar.startsWith("data:") || user.avatar.startsWith("http") || user.avatar.startsWith("/"))) {
      return user.avatar;
    }
    return user?.avatarUrl || "";
  });
  const [avatarFileName, setAvatarFileName] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Sync state when user profile updates in AuthContext
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.avatar && (user.avatar.startsWith("data:") || user.avatar.startsWith("http") || user.avatar.startsWith("/"))) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // Change Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Toast / Feedback State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name is required.", "error");
      return;
    }
    if (!email.trim()) {
      showToast("Email is required.", "error");
      return;
    }
    if (!phone.trim()) {
      showToast("Mobile number is required.", "error");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      showToast("Mobile number must be exactly 10 digits.", "error");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const avatarPayload =
        avatarPreview ||
        (name
          ? name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "SA");

      if (updateUserProfile) {
        await updateUserProfile({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          avatar: avatarPayload,
        });
      }
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      showToast("Please enter a new password.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Confirm password does not match.", "error");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      if (changePassword) {
        const res = await changePassword({
          newPassword,
          confirmPassword,
        });
        setNewPassword("");
        setConfirmPassword("");
        showToast(res?.message || "Password updated successfully!");
      } else {
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully!");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce ${
            toast.type === "error" ? "bg-red-600" : "bg-[#1c232f] border border-white/10"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1c232f]">Profile</h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
          <button
            onClick={() => onNavigateTab && onNavigateTab("dashboard")}
            className="hover:text-[#105784] transition cursor-pointer text-gray-500"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-400">Profile</span>
        </div>
      </div>

      {/* Main Grid: Edit Profile (Left) and Change Password (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Card: Edit Profile */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-7">
          <h2 className="text-base font-bold text-[#1c232f] mb-6">Edit Profile</h2>

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Super"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@uzeirholding.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] transition"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Mobile Number<span className="text-red-500">*</span>
                </label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#105784] transition">
                  <span className="px-3 py-2.5 bg-gray-50 text-xs font-medium text-gray-600 border-r border-gray-200 flex items-center shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/\D/g, "");
                      if (numbersOnly.length <= 10) {
                        setPhone(numbersOnly);
                      }
                    }}
                    placeholder="9999999999"
                    className="w-full px-3.5 py-2.5 text-xs bg-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Profile Picture<span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-3.5 py-2.5 bg-white cursor-pointer hover:border-[#105784] transition"
                >
                  <span className="text-xs text-gray-500 truncate">
                    {avatarFileName || "Upload"}
                  </span>
                  <FileUp className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Circular Profile Picture Preview */}
                <div className="mt-4">
                  {avatarPreview && (avatarPreview.startsWith("data:") || avatarPreview.startsWith("http") || avatarPreview.startsWith("/")) ? (
                    <img
                      src={avatarPreview}
                      alt="Profile Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#105784] text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {name
                        ? name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "SA"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmittingProfile}
                className="px-6 py-2.5 bg-[#1c232f] hover:bg-[#105784] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
              >
                {isSubmittingProfile ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Change Password */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-7">
          <h2 className="text-base font-bold text-[#1c232f] mb-6">Change Password</h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                New Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 pr-10 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNewPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 pr-10 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="px-6 py-2.5 bg-[#1c232f] hover:bg-[#105784] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
              >
                {isSubmittingPassword ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
