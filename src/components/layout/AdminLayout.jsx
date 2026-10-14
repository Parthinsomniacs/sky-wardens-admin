import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Search,
  Bell,
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
  Crown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../context/ProductsContext";

export default function AdminLayout({
  children,
  currentTab = "dashboard",
  onTabChange,
}) {
  const { user, logout, switchRole, isSuperAdmin } = useAuth();
  const { divisions = [], products = [] } = useProducts();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(true);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      group: "PRODUCTS",
      items: [
        {
          id: "products",
          label: "Products",
          icon: Package,
          subItems: divisions.map((d) => {
            const count = products.filter((p) => p.division === d.name).length;
            const targetId =
              d.slug === "aerospace"
                ? "products-aerospace"
                : d.slug === "defence"
                ? "products-defence"
                : `products-${d.slug}`;

            let iconComp = Layers;
            if (d.name === "Aerospace") iconComp = Plane;
            else if (d.name === "Defence") iconComp = Shield;
            else if (d.name === "Advanced Systems") iconComp = Cpu;
            else if (d.name === "Petrochemicals") iconComp = FlaskConical;

            return {
              id: targetId,
              label: d.name,
              icon: iconComp,
              badge: null,
              badgeColor: d.badgeColor || "bg-indigo-600",
            };
          }),
        },
        {
          id: "masters",
          label: "Masters",
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

  const recentNotifications = [
    {
      id: "notif-1",
      title: "New Tactical UAV Inquiry",
      desc: "Indian Air Force Procurement Wing requested specs for AeroViper.",
      time: "Today, 15:42",
      unread: true,
      tab: "contact-leads",
    },
    {
      id: "notif-2",
      title: "Guidance System RFQ",
      desc: "Lockheed Martin Tactical Systems submitted inquiry for Sky-Nav 400.",
      time: "Today, 11:20",
      unread: true,
      tab: "contact-leads",
    },
    {
      id: "notif-3",
      title: "Security Telemetry Passed",
      desc: "Automated penetration test completed: Zero vulnerabilities detected.",
      time: "Yesterday, 22:00",
      unread: false,
      tab: "users",
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
      case "users":
        return "Admin Users & Clearance";
      default:
        return "Management Console";
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
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {sidebarOpen && (
                <p className="px-3 text-[10px] font-bold text-[#6c7b93] tracking-wider uppercase mb-1.5 select-none">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                const isItemActive =
                  currentTab === item.id ||
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
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#105784] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {user?.avatar || "SA"}
              </div>
              {sidebarOpen && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.name || "Super Admin"}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    {user?.clearance || "Level 5 Top Secret"}
                  </span>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={logout}
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

            {/* Global Search Bar */}
            <div className="relative hidden md:block w-56 lg:w-72 ml-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads, pages, banners..."
                className="w-full pl-9 pr-10 py-1.5 text-xs bg-[#f4f7fa] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-white border border-gray-200 px-1 py-0.2 rounded font-mono">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Role Switcher, SOC Status, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Role Simulation Switcher */}
            <div className="flex items-center gap-1 bg-[#f4f7fa] p-1 rounded-xl border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => switchRole && switchRole("Super Admin")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  user?.role === "Super Admin"
                    ? "bg-purple-700 text-white shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Super Admin Mode: Full System Access (Leads Visible)"
              >
                <Crown className="w-3 h-3" />
                <span className="hidden md:inline">Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (switchRole) switchRole("Normal Admin");
                  if (currentTab === "contact-leads" || currentTab === "leads") {
                    if (onTabChange) onTabChange("dashboard");
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  user?.role === "Normal Admin"
                    ? "bg-[#105784] text-white shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Normal Admin Mode: Operational (Leads Hidden)"
              >
                <Shield className="w-3 h-3" />
                <span className="hidden md:inline">Normal Admin</span>
              </button>
            </div>

            {/* Notification Bell Dropdown */}
            <div ref={notifMenuRef} className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                title="Notifications"
                className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c232f]">
                      Operational Alerts
                    </span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded">
                      2 Unread
                    </span>
                  </div>

                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (notif.tab === "contact-leads" && !isSuperAdmin) {
                            if (onTabChange) onTabChange("dashboard");
                          } else if (onTabChange) {
                            onTabChange(notif.tab);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-gray-50 cursor-pointer transition ${
                          notif.unread ? "bg-sky-50/40" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                          {notif.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {isSuperAdmin && (
                    <div className="pt-2 px-3 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (onTabChange) onTabChange("contact-leads");
                        }}
                        className="text-xs font-semibold text-[#105784] hover:underline cursor-pointer"
                      >
                        View All Contact Leads
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#105784] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user?.avatar || "SA"}
                </div>
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

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      Sign Out
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
    </div>
  );
}
