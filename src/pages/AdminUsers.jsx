import { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Mail,
  Crown,
  Shield,
  Pencil,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers({ onNavigateTab }) {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'Super Admin' | 'Normal Admin'

  // Only currently logged in admin user is displayed
  const currentAdmin = useMemo(() => {
    if (!user) return null;
    const initials = user.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "SA";

    return {
      id: user.id || user._id || "USR-001",
      name: user.name || "Super Admin",
      email: user.email || "admin@skywardens.com",
      phone: user.phone || "9999999999",
      role: user.role || "Super Admin",
      status: user.status || "Active",
      avatar: user.avatar || initials,
    };
  }, [user]);

  const adminUsers = useMemo(() => {
    return currentAdmin ? [currentAdmin] : [];
  }, [currentAdmin]);

  const superAdminsCount = adminUsers.filter(
    (u) => u.role === "Super Admin"
  ).length;
  const normalAdminsCount = adminUsers.filter(
    (u) => u.role === "Normal Admin"
  ).length;

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        u.id.toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [adminUsers, searchQuery, roleFilter]);

  const handleNavigateToProfile = () => {
    if (onNavigateTab) {
      onNavigateTab("profile");
    } else {
      window.location.hash = "profile";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#eaedf1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>System</span>
            <span>/</span>
            <span className="font-semibold text-[#105784]">Admin Users</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
            Admin Profile & Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Current active administrator account and system privileges.
          </p>
        </div>

        <button
          onClick={handleNavigateToProfile}
          className="px-3.5 py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Pencil className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Active Accounts
          </span>
          <div className="text-2xl font-bold text-[#1c232f] mt-1">
            {adminUsers.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Current logged in user
          </div>
        </div>

        {/* Super Admins */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Super Admin
            </span>
            <Crown className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {superAdminsCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Full system root</div>
        </div>

        {/* Normal Admins */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Normal Admin
            </span>
            <Shield className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-700 mt-1">
            {normalAdminsCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Operations clearance</div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Status
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {adminUsers.filter((u) => u.status === "Active").length} /{" "}
            {adminUsers.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Verified active session</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search officer by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 bg-[#f4f7fa] p-1 rounded-lg border border-[#e2e8f0]">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              roleFilter === "all"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All Roles ({adminUsers.length})
          </button>
          <button
            onClick={() => setRoleFilter("Super Admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              roleFilter === "Super Admin"
                ? "bg-purple-600 text-white shadow-2xs"
                : "text-purple-700 hover:bg-purple-50"
            }`}
          >
            <Crown className="w-3 h-3" />
            <span>Super Admin ({superAdminsCount})</span>
          </button>
          <button
            onClick={() => setRoleFilter("Normal Admin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              roleFilter === "Normal Admin"
                ? "bg-sky-700 text-white shadow-2xs"
                : "text-sky-700 hover:bg-sky-50"
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Normal Admin ({normalAdminsCount})</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-700">No matching personnel</h3>
            <p className="text-xs text-gray-500 mt-1">Try resetting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-[#eaedf1]">
                <tr>
                  <th className="py-3 px-4">Officer Details</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f8]">
                {filteredUsers.map((officer) => {
                  const isSuper = officer.role === "Super Admin";
                  const hasImageAvatar =
                    officer.avatar &&
                    (officer.avatar.startsWith("data:") ||
                      officer.avatar.startsWith("http") ||
                      officer.avatar.startsWith("/"));

                  return (
                    <tr key={officer.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {hasImageAvatar ? (
                            <img
                              src={officer.avatar}
                              alt={officer.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 shadow-2xs border border-gray-200"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                                isSuper ? "bg-purple-700" : "bg-[#105784]"
                              }`}
                            >
                              {officer.avatar}
                            </div>
                          )}

                          <div>
                            <div className="font-semibold text-[#1c232f] flex items-center gap-1.5">
                              <span>{officer.name}</span>
                              <span className="text-[10px] font-mono text-gray-400">
                                #{officer.id}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#105784]" />
                                <span>{officer.email}</span>
                              </span>
                              {officer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{officer.phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSuper
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-sky-50 text-sky-800 border-sky-200"
                          }`}
                        >
                          {isSuper ? (
                            <Crown className="w-3 h-3 text-purple-600" />
                          ) : (
                            <Shield className="w-3 h-3 text-sky-600" />
                          )}
                          <span>{officer.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{officer.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={handleNavigateToProfile}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#105784] hover:bg-[#105784]/10 rounded-lg border border-[#105784]/30 transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
