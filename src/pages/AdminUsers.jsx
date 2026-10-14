import { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserPlus,
  CheckCircle2,
  Mail,
  X,
  Crown,
  Shield,
  Pencil,
  Trash2,
  AlertTriangle,
  EyeOff,
  Check,
} from "lucide-react";
import { INITIAL_ADMIN_USERS } from "../data/mockData";

const USERS_STORAGE_KEY = "sky_wardens_admin_users_v2";

export default function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize any legacy "Normal User" to "Normal Admin"
          return parsed.map((u) => ({
            ...u,
            role: u.role === "Normal User" ? "Normal Admin" : u.role,
            clearance:
              u.role === "Super Admin"
                ? "Full System Access (Includes Leads)"
                : "Operational Access (No Leads)",
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ADMIN_USERS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(adminUsers));
    } catch (e) {
      console.error(e);
    }
  }, [adminUsers]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'Super Admin' | 'Normal Admin'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const superAdminsCount = adminUsers.filter(
    (u) => u.role === "Super Admin"
  ).length;
  const normalAdminsCount = adminUsers.filter(
    (u) => u.role === "Normal Admin"
  ).length;

  const filteredUsers = adminUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchesRole =
      roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleAddUser = (userData) => {
    const initials = userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "US";

    const newUser = {
      id: `USR-${String(adminUsers.length + 1).padStart(3, "0")}`,
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role, // Strictly 'Super Admin' | 'Normal Admin'
      department: userData.department.trim() || "Operations",
      clearance:
        userData.role === "Super Admin"
          ? "Full System Access (Includes Leads)"
          : "Operational Access (No Leads)",
      status: "Active",
      lastLogin: "Newly Created",
      avatar: initials,
    };

    setAdminUsers([newUser, ...adminUsers]);
    setShowAddModal(false);
    triggerToast(`Officer "${newUser.name}" provisioned as ${newUser.role}!`);
  };

  const handleUpdateUser = (id, updatedFields) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            ...updatedFields,
            clearance:
              updatedFields.role === "Super Admin"
                ? "Full System Access (Includes Leads)"
                : "Operational Access (No Leads)",
          };
        }
        return u;
      })
    );
    setUserToEdit(null);
    triggerToast("User details and clearance updated successfully!");
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    setAdminUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    triggerToast(`User "${userToDelete.name}" removed.`);
    setUserToDelete(null);
    if (selectedUser?.id === userToDelete.id) setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1c232f] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#eaedf1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>System</span>
            <span>/</span>
            <span className="font-semibold text-[#105784]">Admin Users</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
            Admin Users & Role Clearance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Strict 2-tier security governance: <strong>Super Admin</strong> (Full Access + Leads) and <strong>Normal Admin</strong> (Operations & Catalog — Leads Hidden).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total Accounts
          </span>
          <div className="text-2xl font-bold text-[#1c232f] mt-1">
            {adminUsers.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Provisioned administrators
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
          <div className="text-[11px] text-gray-400 mt-1">Full root + Leads visibility</div>
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
          <div className="text-[11px] text-amber-600 font-medium mt-1">Leads strictly hidden</div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Active Status
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {adminUsers.filter((u) => u.status === "Active").length} /{" "}
            {adminUsers.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">100% operational</div>
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
            placeholder="Search officers by name, email, or department..."
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
            <p className="text-xs text-gray-500 mt-1">Try refining your search keyword or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-[#eaedf1]">
                <tr>
                  <th className="py-3 px-4">Officer Details</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Leads & System Access</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f8]">
                {filteredUsers.map((user) => {
                  const isSuperAdmin = user.role === "Super Admin";

                  return (
                    <tr key={user.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                              isSuperAdmin ? "bg-purple-700" : "bg-[#105784]"
                            }`}
                          >
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1c232f] flex items-center gap-1.5">
                              <span>{user.name}</span>
                              <span className="text-[10px] font-mono text-gray-400">
                                #{user.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isSuperAdmin
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-sky-50 text-sky-800 border-sky-200"
                          }`}
                        >
                          {isSuperAdmin ? (
                            <Crown className="w-3 h-3 text-purple-600" />
                          ) : (
                            <Shield className="w-3 h-3 text-sky-600" />
                          )}
                          <span>{user.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {user.department || "Operations"}
                      </td>
                      <td className="py-3.5 px-4">
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-[11px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Full Access (Leads Visible)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                            <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Catalog Access (Leads Hidden)</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{user.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#105784] hover:bg-[#105784]/10 rounded border border-[#105784]/30 transition cursor-pointer"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => setUserToEdit(user)}
                            className="p-1 text-sky-700 hover:bg-sky-50 rounded border border-sky-200 transition cursor-pointer"
                            title="Edit Role"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {user.id !== "USR-001" && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect User Modal with Clear Access Matrix */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 relative space-y-4"
          >
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${
                    selectedUser.role === "Super Admin"
                      ? "bg-purple-700"
                      : "bg-[#105784]"
                  }`}
                >
                  {selectedUser.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c232f]">
                    {selectedUser.name}
                  </h3>
                  <span className="text-[11px] text-gray-400 font-mono">
                    #{selectedUser.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">
                    Designated Role
                  </span>
                  <span className="font-bold text-sm flex items-center gap-1.5 mt-0.5">
                    {selectedUser.role === "Super Admin" ? (
                      <Crown className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-sky-600" />
                    )}
                    <span>{selectedUser.role}</span>
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    selectedUser.role === "Super Admin"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}
                >
                  {selectedUser.role}
                </span>
              </div>

              {/* Security & Access Rights Matrix */}
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Permissions Matrix
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Products Catalog</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Divisions Master</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Operational Dashboard</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 font-bold ${
                      selectedUser.role === "Super Admin"
                        ? "text-purple-700"
                        : "text-amber-700 line-through opacity-70"
                    }`}
                  >
                    {selectedUser.role === "Super Admin" ? (
                      <>
                        <Crown className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                        <span>Contact Leads (Allowed)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Contact Leads (Hidden)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">
                    Department
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.department}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">
                    Email
                  </span>
                  <span className="font-semibold text-gray-800 truncate block">
                    {selectedUser.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <UserFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
        />
      )}

      {/* Edit User Modal */}
      {userToEdit && (
        <UserFormModal
          mode="edit"
          initialData={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={(data) => handleUpdateUser(userToEdit.id, data)}
        />
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <div
          onClick={() => setUserToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 relative space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Revoke User Account
                </h3>
                <p className="text-xs text-gray-500">
                  This action will permanently delete access.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
              Are you sure you want to remove <strong>{userToDelete.name}</strong> ({userToDelete.role}) from the administrative directory?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// REUSABLE USER FORM MODAL (Strictly 2 Roles: Super Admin & Normal Admin)
// ======================================================================
function UserFormModal({ mode = "add", initialData = null, onClose, onSubmit }) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState(
    initialData?.role === "Normal User" ? "Normal Admin" : initialData?.role || "Normal Admin"
  );
  const [department, setDepartment] = useState(
    initialData?.department || "Operations"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      role, // Strictly 'Super Admin' | 'Normal Admin'
      department: department.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 relative space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-[#1c232f]">
              {mode === "add" ? "Provision New Admin User" : `Edit Officer: ${initialData?.name}`}
            </h3>
            <p className="text-xs text-gray-500">
              Select access role: Super Admin or Normal Admin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Major Arjun Saxena"
              required
              className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@skywardens.com"
              required
              className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
            />
          </div>

          {/* Strictly 2 Roles Selection */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
              Assigned Role (Only 2 Roles Permitted) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("Super Admin")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  role === "Super Admin"
                    ? "bg-purple-50 border-purple-500 ring-2 ring-purple-200 shadow-2xs"
                    : "bg-[#f8fafc] border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-purple-700 text-xs">
                  <Crown className="w-4 h-4" />
                  <span>Super Admin</span>
                </div>
                <span className="text-[10px] text-purple-600 font-medium">
                  Full system access + Leads visible
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("Normal Admin")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  role === "Normal Admin"
                    ? "bg-sky-50 border-sky-500 ring-2 ring-sky-200 shadow-2xs"
                    : "bg-[#f8fafc] border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sky-800 text-xs">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span>Normal Admin</span>
                </div>
                <span className="text-[10px] text-amber-700 font-medium">
                  Catalog & Masters (Leads hidden)
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Flight Testing / Ground Support"
              className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#105784] hover:bg-[#0c476c] text-white rounded-lg shadow-2xs transition cursor-pointer"
            >
              {mode === "add" ? "Provision Officer" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
