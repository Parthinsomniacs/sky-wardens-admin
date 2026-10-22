import { useState, useEffect, useRef, useMemo } from "react";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Mail,
  Plane,
  Shield,
  Package,
  Users,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Database,
  Cpu,
  FlaskConical,
  Layers,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductsContext";

export default function AdminLayout({
  children,
  currentTab = "dashboard",
  onTabChange,
}) {
  const { user, logout, isSuperAdmin } = useAuth();
  const { divisions = [], products = [] } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userMenuRef = useRef(null);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const aerospaceCount = products.filter(
    (p) => (p.division || "").toLowerCase() === "aerospace"
  ).length;

  const defenceCount = products.filter(
    (p) => (p.division || "").toLowerCase() === "defence"
  ).length;

  const divisionNavItems = useMemo(() => {
    if (divisions && divisions.length > 0) {
      return divisions
        .filter((d) => (d.status || "Active") === "Active")
        .map((d) => {
          const slug = d.slug || d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const count = products.filter(
            (p) => (p.division || "").toLowerCase() === d.name.toLowerCase()
          ).length;

          let Icon = Layers;
          let badgeColor = "bg-sky-600";
          if (d.name.toLowerCase() === "aerospace") {
            Icon = Plane;
            badgeColor = "bg-sky-600";
          } else if (d.name.toLowerCase() === "defence") {
            Icon = Shield;
            badgeColor = "bg-emerald-600";
          } else if (d.name.toLowerCase() === "advanced systems") {
            Icon = Cpu;
            badgeColor = "bg-purple-600";
          } else if (d.name.toLowerCase() === "petrochemicals") {
            Icon = FlaskConical;
            badgeColor = "bg-amber-600";
          }

          return {
            id: `products-${slug}`,
            label: `${d.name} Products`,
            icon: Icon,
            badge: count > 0 ? count : null,
            badgeColor,
          };
        });
    }

    return [
      {
        id: "products-aerospace",
        label: "Aerospace Products",
        icon: Plane,
        badge: aerospaceCount > 0 ? aerospaceCount : null,
        badgeColor: "bg-sky-600",
      },
      {
        id: "products-defence",
        label: "Defence Products",
        icon: Shield,
        badge: defenceCount > 0 ? defenceCount : null,
        badgeColor: "bg-emerald-600",
      },
    ];
  }, [divisions, products, aerospaceCount, defenceCount]);

  const navGroups = [
    {
      group: "CORE OPERATIONS",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            group: "LEADS & INQUIRIES",
            items: [
              {
                id: "contact-leads",
                label: "Contact Leads",
                icon: Mail,
                badge: null,
                badgeColor: "bg-[#105784]",
              },
            ],
          },
        ]
      : []),
    {
      group: "PRODUCT CATALOGS",
      items: [
        ...divisionNavItems,
        {
          id: "masters",
          label: "Masters (Categories)",
          icon: Database,
          badge: null,
          badgeColor: "bg-indigo-600",
        },
      ],
    },
    {
      group: "SYSTEM ADMINISTRATION",
      items: [
        {
          id: "users",
          label: "Admin Users",
          icon: Users,
          badge: null,
          badgeColor: "bg-emerald-600",
        },
      ],
    },
  ];



  const getPageTitle = (tab) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard";
      case "contact-leads":
      case "leads":
        return "Contact Leads";
      case "products":
      case "products-aerospace":
        return "Aerospace Products Catalog";
      case "products-defence":
        return "Defence Products Catalog";
      case "masters":
        return "Masters (Divisions & Categories)";
      case "users":
        return "Admin Users & Clearance";
      case "profile":
        return "Profile";
      default: {
        if (tab.startsWith("products-")) {
          const matched = divisions.find(
            (d) =>
              `products-${d.slug || d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` ===
              tab
          );
          if (matched) return `${matched.name} Products Catalog`;
        }
        return "Management Console";
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex text-[#212529] font-sans antialiased selection:bg-[#105784] selection:text-white">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Dark Enterprise Aerospace Slate (#1c232f) */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 h-screen flex flex-col bg-[#1c232f] text-[#ced4dc] transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-[260px]" : "w-[72px]"
        } ${
          mobileMenuOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0 shadow-lg"
        } border-r border-[#151a23] shrink-0`}
      >
        {/* Brand Area Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-[#161c25] border-b border-[#252f3e] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/sky-wardens-emblem-white.png"
              alt="Sky Wardens"
              className="h-8 w-auto shrink-0 object-contain"
            />
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-white text-sm tracking-wider whitespace-nowrap">
                  SKY WARDENS
                </span>
                <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase whitespace-nowrap">
                  ADMIN CONSOLE
                </span>
              </div>
            )}
          </div>

          {/* Close button for mobile, or collapse toggle on desktop */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded transition cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                const isItemActive =
                  currentTab === item.id ||
                  (item.id === "products-aerospace" &&
                    (currentTab === "products" ||
                      currentTab === "products-aerospace")) ||
                  (item.id === "products-defence" &&
                    currentTab === "products-defence") ||
                  (item.id === "contact-leads" && currentTab === "leads");
                const isChildActive =
                  hasSubItems &&
                  item.subItems.some(
                    (sub) =>
                      currentTab === sub.id ||
                      (sub.id === "products-aerospace" && currentTab === "products")
                  );

                if (hasSubItems) {
                  return (
                    <div key={item.id} className="space-y-1">
                      {/* Parent Header */}
                      <button
                        onClick={() => {
                          if (sidebarOpen) {
                            setProductsExpanded(!productsExpanded);
                          } else {
                            if (onTabChange) onTabChange("products-aerospace");
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer relative group ${
                          isChildActive || isItemActive
                            ? "bg-[#252f3e] text-white font-semibold"
                            : "text-[#ced4dc] hover:bg-[#252f3e] hover:text-white"
                        } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#7ba5c6]" />
                        {sidebarOpen && (
                          <span className="flex-1 text-left truncate text-xs">
                            {item.label}
                          </span>
                        )}
                        {sidebarOpen && (
                          <span className="text-gray-400">
                            {productsExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}

                        {/* Collapsed Tooltip */}
                        {!sidebarOpen && (
                          <div className="hidden group-hover:block fixed left-[78px] bg-[#161c25] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg border border-[#252f3e] whitespace-nowrap z-50 pointer-events-none">
                            {item.label}
                          </div>
                        )}
                      </button>

                      {/* Sub-items (Aerospace & Defence) */}
                      {sidebarOpen && productsExpanded && (
                        <div className="pl-3 space-y-1">
                          {item.subItems.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive =
                              currentTab === sub.id ||
                              (sub.id === "products-aerospace" &&
                                currentTab === "products");
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  if (onTabChange) onTabChange(sub.id);
                                  setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                                  isSubActive
                                    ? "bg-[#105784] text-white font-semibold shadow-xs"
                                    : "text-[#a0aec0] hover:bg-[#252f3e] hover:text-white"
                                }`}
                              >
                                <SubIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="flex-1 text-left truncate">
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span
                                    className={`text-[9px] text-white font-bold px-1.5 py-0.2 rounded-full ${
                                      sub.badgeColor || "bg-sky-600"
                                    }`}
                                  >
                                    {sub.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Standard nav item
                const isActive = isItemActive;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onTabChange) onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer relative group ${
                      isActive
                        ? "bg-[#105784] text-white shadow-sm font-semibold"
                        : "text-[#ced4dc] hover:bg-[#252f3e] hover:text-white"
                    } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && (
                      <span className="flex-1 text-left truncate text-xs">
                        {item.label}
                      </span>
                    )}
                    {sidebarOpen && item.badge && (
                      <span
                        className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || "bg-amber-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Compact Tooltip when sidebar is collapsed */}
                    {!sidebarOpen && (
                      <div className="hidden group-hover:block fixed left-[78px] bg-[#161c25] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg border border-[#252f3e] whitespace-nowrap z-50 pointer-events-none">
                        {item.label} {item.badge && `(${item.badge})`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 bg-[#161c25] border-t border-[#252f3e] shrink-0">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#1c232f]">
            <button
              onClick={() => {
                if (onTabChange) onTabChange("profile");
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 transition cursor-pointer flex-1 group"
              title="View & Edit Profile"
            >
              {user?.avatar && (user.avatar.startsWith("data:") || user.avatar.startsWith("http") || user.avatar.startsWith("/")) ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-sky-400 transition"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#105784] group-hover:ring-2 group-hover:ring-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition">
                  {user?.name
                    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : (user?.avatar || "SA")}
                </div>
              )}
              {sidebarOpen && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-semibold text-white truncate group-hover:text-sky-300 transition">
                    {user?.name || "Super Admin"}
                  </span>
                </div>
              )}
            </button>
            {sidebarOpen && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign Out"
                className="text-gray-400 hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-[#e9ecef] shadow-[0_1px_15px_0_rgba(69,90,100,0.06)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Sidebar Toggle, Page Breadcrumb & Global Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              title="Toggle Sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5 hidden lg:block" />
              ) : (
                <PanelLeft className="w-5 h-5 hidden lg:block" />
              )}
              <Menu className="w-5 h-5 lg:hidden" />
            </button>

            {/* Current Section Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-700 border-l border-gray-200 pl-3">
              <span className="text-gray-400">Sky Wardens</span>
              <span className="text-gray-300">/</span>
              <span className="text-[#105784] font-bold">
                {getPageTitle(currentTab)}
              </span>
            </div>

          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Profile Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                }}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                {user?.avatar && (user.avatar.startsWith("data:") || user.avatar.startsWith("http") || user.avatar.startsWith("/")) ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#105784] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {user?.name
                      ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : (user?.avatar || "SA")}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1c232f] leading-tight">
                    {user?.name || "Super Admin"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {user?.role || "Super Admin"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-[#1c232f]">
                      {user?.name || "Super Admin"}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {user?.email || "admin@skywardens.com"}
                    </p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onTabChange) onTabChange("profile");
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg font-medium cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Popup Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 text-center relative"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <LogOut className="w-6 h-6 ml-0.5" />
            </div>

            <h3 className="text-base font-bold text-[#1c232f] tracking-tight">
              Confirm Logout
            </h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to log out of the Sky Wardens Admin Console?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
