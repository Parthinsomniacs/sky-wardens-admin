import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProductsProvider } from "./context/ProductsContext";
import Login from "./pages/Login";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import ContactLeads from "./pages/ContactLeads";
import ProductsPage from "./pages/ProductsPage";
import AdminUsers from "./pages/AdminUsers";

import MastersPage from "./pages/MastersPage";

const VALID_TABS = [
  "dashboard",
  "contact-leads",
  "leads",
  "products",
  "products-aerospace",
  "products-defence",
  "products-advanced-systems",
  "products-petrochemicals",
  "masters",
  "users",
];

const isValidTab = (tab) => {
  if (VALID_TABS.includes(tab)) return true;
  if (tab.startsWith("products-")) return true;
  return false;
};

function AppContent() {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  const [currentTab, setCurrentTab] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return isValidTab(hash) ? hash : "dashboard";
  });

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    window.location.hash = newTab;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (isValidTab(hash)) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentModule = () => {
    if (currentTab === "masters") {
      return <MastersPage onNavigateTab={handleTabChange} />;
    }
    if (currentTab === "dashboard") {
      return <Dashboard onNavigateTab={handleTabChange} />;
    }
    if (currentTab === "contact-leads" || currentTab === "leads") {
      if (!isSuperAdmin) {
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c232f]">
                Access Restricted (Leads Hidden)
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Contact leads & commercial inquiries are strictly restricted to{" "}
                <strong>Super Admin</strong> clearance. Normal Admin accounts only have operational catalog access.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("dashboard")}
              className="px-4 py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        );
      }
      return <ContactLeads />;
    }
    if (currentTab === "users") {
      return <AdminUsers />;
    }
    if (currentTab.startsWith("products-") || currentTab === "products") {
      let initialDivision = "Aerospace";
      if (currentTab === "products-defence") initialDivision = "Defence";
      else if (currentTab === "products-advanced-systems")
        initialDivision = "Advanced Systems";
      else if (currentTab === "products-petrochemicals")
        initialDivision = "Petrochemicals";
      else if (currentTab.startsWith("products-")) {
        const raw = currentTab.replace("products-", "");
        initialDivision = raw
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
      return (
        <ProductsPage
          key={currentTab}
          initialDivision={initialDivision}
          onNavigateTab={handleTabChange}
        />
      );
    }
    return <Dashboard onNavigateTab={handleTabChange} />;
  };

  return (
    <AdminLayout currentTab={currentTab} onTabChange={handleTabChange}>
      {renderCurrentModule()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <AppContent />
      </ProductsProvider>
    </AuthProvider>
  );
}
