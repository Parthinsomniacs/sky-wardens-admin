import { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Users,
  Plane,
  Shield,
  ChevronRight,
  Mail,
  X,
  AlertCircle,
  ShieldCheck,
  Search,
  Database,
  Package,
  EyeOff,
  Boxes,
  ExternalLink,
  Phone,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { leadsApi, usersApi } from "../services/api";
import { INITIAL_LEADS, INITIAL_ADMIN_USERS } from "../data/mockData";

const formatDateTime = (lead) => {
  if (!lead) return "—";
  const raw = lead.createdAt || lead.timestamp || lead.date;
  if (!raw) return "—";
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return lead.date || raw;
};

export default function Dashboard({ onNavigateTab }) {
  const { isSuperAdmin } = useAuth();
  const { divisions = [], products = [] } = useProducts();

  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("sky_wardens_admin_users_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ADMIN_USERS;
  });
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterDivision, setFilterDivision] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Live fetch leads from backend API
  const fetchLiveLeads = async () => {
    try {
      setLoadingLeads(true);
      const data = await leadsApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setLeads(data);
      }
    } catch (err) {
      console.warn("Leads fetch in Dashboard:", err.message);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Live fetch admin users if available
  const fetchLiveUsers = async () => {
    try {
      const data = await usersApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setAdminUsers(data);
      }
    } catch (err) {
      // Retain localStorage or initial users
    }
  };

  useEffect(() => {
    fetchLiveLeads();
    fetchLiveUsers();
  }, []);

  const productLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        l.type === "Product(s) Inquiry" ||
        l.type === "Procurement / Tender" ||
        l.type === "Distributor / Channel Partnership" ||
        l.type?.includes("Product") ||
        Boolean(l.productInquired || l.productName)
    );
  }, [leads]);

  const newLeads = useMemo(() => {
    return leads.filter((l) => (l.status || "New").toLowerCase() === "new");
  }, [leads]);

  const highPriorityLeads = useMemo(() => {
    return leads.filter((l) => (l.priority || "").toLowerCase() === "high");
  }, [leads]);

  const activeProductsCount = useMemo(() => {
    return products.filter((p) => p.status !== "Inactive").length;
  }, [products]);

  // Determine target slug for products navigation
  const firstDivisionSlug = useMemo(() => {
    if (divisions && divisions.length > 0) {
      const first =
        divisions.find((d) => (d.status || "Active") === "Active") ||
        divisions[0];
      const slug =
        first.slug || first.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return slug === "aerospace"
        ? "products-aerospace"
        : slug === "defence"
        ? "products-defence"
        : `products-${slug}`;
    }
    return "products-aerospace";
  }, [divisions]);

  const renderContactTypeBadge = (type) => {
    if (!type) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
          Inquiry
        </span>
      );
    }
    if (type.includes("Procurement") || type.includes("Tender")) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Procurement
        </span>
      );
    }
    if (type.includes("Product")) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Product Inquiry
        </span>
      );
    }
    if (type.includes("Distributor") || type.includes("Partner")) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Channel
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
        {type}
      </span>
    );
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            New
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            In Progress
          </span>
        );
      case "Contacted":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Contacted
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case "Closed":
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
            {status || "Active"}
          </span>
        );
    }
  };

  // Filtered recent inquiries from live database
  const displayedLeads = useMemo(() => {
    return leads.filter((lead) => {
      const leadDiv = (lead.division || lead.category || "").toLowerCase();
      const matchesDiv =
        filterDivision === "all" || leadDiv === filterDivision.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.country && lead.country.toLowerCase().includes(q)) ||
        (lead.phone && lead.phone.toLowerCase().includes(q)) ||
        (lead.type && lead.type.toLowerCase().includes(q)) ||
        (lead.productInquired &&
          lead.productInquired.toLowerCase().includes(q)) ||
        (lead.productName &&
          lead.productName.toLowerCase().includes(q)) ||
        (lead.message && lead.message.toLowerCase().includes(q)) ||
        (lead.id && String(lead.id).toLowerCase().includes(q));

      return matchesDiv && matchesSearch;
    });
  }, [leads, filterDivision, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#eaedf1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="font-semibold text-[#105784]">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
            {isSuperAdmin
              ? "Executive Mission Overview"
              : "Operational Catalog Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {isSuperAdmin
              ? "Operational telemetry, procurement inquiries, and administrative access status."
              : "Industrial divisions, active catalog items, and hardware management console."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigateTab && onNavigateTab(firstDivisionSlug)}
            className="px-3.5 py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Products Catalog ({products.length})</span>
          </button>

          {isSuperAdmin ? (
            <button
              onClick={() => onNavigateTab && onNavigateTab("contact-leads")}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-[#ced4da] text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span>All Leads ({leads.length})</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab && onNavigateTab("masters")}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-[#ced4da] text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-gray-500" />
              <span>Divisions Master ({divisions.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchLiveLeads();
              fetchLiveUsers();
            }}
            title="Refresh Live Data"
            disabled={loadingLeads}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 border border-[#ced4da] text-xs font-semibold rounded-lg shadow-2xs transition flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin text-[#105784]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSuperAdmin ? (
          <>
            {/* Super Admin Card 1: Total Leads */}
            <div
              onClick={() => onNavigateTab && onNavigateTab("contact-leads")}
              className="bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784] hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Total Inquiries</span>
                <div className="w-8 h-8 rounded-lg bg-[#105784]/10 text-[#105784] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#1c232f] mt-2">
                {leads.length}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
                <span>Public RFQ Ingests</span>
                <span className="text-emerald-600 font-semibold">
                  {leads.length > 0 ? "Live Active" : "0 Captured"}
                </span>
              </div>
            </div>

            {/* Super Admin Card 2: Hardware Inquiries */}
            <div
              onClick={() => onNavigateTab && onNavigateTab("contact-leads")}
              className="bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-sky-500 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Product Inquiries</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-sky-700 mt-2">
                {productLeads.length}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
                <span>Equipment Interest</span>
                <span className="text-[#105784] font-semibold">
                  {productLeads.length > 0 ? "Active Inquiries" : "0 Inquiries"}
                </span>
              </div>
            </div>

            {/* Super Admin Card 3: Actionable Inquiries */}
            <div
              onClick={() => onNavigateTab && onNavigateTab("contact-leads")}
              className="bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-amber-500 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Actionable Leads</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-600 mt-2">
                {newLeads.length}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
                <span>Awaiting Review</span>
                <span className="text-amber-600 font-semibold">
                  {highPriorityLeads.length} High Priority
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Normal Admin Card 1: Industrial Divisions */}
            <div
              onClick={() => onNavigateTab && onNavigateTab("masters")}
              className="bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784] hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Industrial Divisions</span>
                <div className="w-8 h-8 rounded-lg bg-[#105784]/10 text-[#105784] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#1c232f] mt-2">
                {divisions.length}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
                <span>Master Pillars</span>
                <span className="text-emerald-600 font-semibold">
                  {divisions.length > 0 ? "Operational" : "0 Configured"}
                </span>
              </div>
            </div>

            {/* Normal Admin Card 2: Catalog Products */}
            <div
              onClick={() => onNavigateTab && onNavigateTab(firstDivisionSlug)}
              className="bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-sky-500 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Total Catalog Items</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-sky-700 mt-2">
                {products.length}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
                <span>All Divisions</span>
                <span className="text-[#105784] font-semibold">
                  {products.length > 0 ? "Catalog Live" : "0 Items"}
                </span>
              </div>
            </div>

            {/* Normal Admin Card 3: Active Equipment */}
            <div
              onClick={() => onNavigateTab && onNavigateTab(firstDivisionSlug)}
              className="bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-emerald-500 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Active Equipment</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mt-2">
                {activeProductsCount}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
                <span>Live in Catalog</span>
                <span className="text-emerald-600 font-semibold">
                  {activeProductsCount > 0 ? "100% Ready" : "0 Active"}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Card 4: Administrative Officers (Common to both) */}
        <div
          onClick={() => {
            if (isSuperAdmin && onNavigateTab) {
              onNavigateTab("users");
            }
          }}
          className={`bg-white rounded-xl p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-purple-600 ${
            isSuperAdmin ? "hover:shadow-md transition cursor-pointer" : ""
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Admin Clearance</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-700 mt-2">
            {adminUsers.length}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#f4f7fa] mt-3">
            <span>Security Personnel</span>
            <span className="text-purple-600 font-semibold">
              {adminUsers.length} Users
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Leads Table for Super Admin */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08)] p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1c232f]">
                  Recent Commercial & Technical Inquiries
                </h2>
                {loadingLeads && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-normal">
                    <Clock className="w-3 h-3 animate-spin" /> Syncing...
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Live incoming procurement and technical specifications inquiries
                (Super Admin Exclusive).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inquiries..."
                  className="pl-8 pr-2.5 py-1 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784]"
                />
              </div>

              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="px-2.5 py-1 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] font-medium"
              >
                <option value="all">All Divisions</option>
                {divisions.map((div) => (
                  <option
                    key={div.id || div.slug || div.name}
                    value={div.name}
                  >
                    {div.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onNavigateTab && onNavigateTab("contact-leads")}
                className="text-xs font-semibold text-[#105784] hover:underline flex items-center gap-1 cursor-pointer ml-2"
              >
                <span>View All Leads ({leads.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {displayedLeads.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-gray-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-700">
                No Inquiries Found
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {searchQuery || filterDivision !== "all"
                  ? "No inquiries match your current search or division filter."
                  : "No customer inquiries or procurement tenders have been ingested yet."}
              </p>
              {(searchQuery || filterDivision !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDivision("all");
                  }}
                  className="mt-3 text-xs text-[#105784] font-bold hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#eaedf1]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-[#eaedf1]">
                  <tr>
                    <th className="py-2.5 px-3">Lead ID</th>
                    <th className="py-2.5 px-3">Client Agency</th>
                    <th className="py-2.5 px-3">Inquiry Type</th>
                    <th className="py-2.5 px-3">Inquired Product</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4f8]">
                  {displayedLeads.slice(0, 6).map((lead) => {
                    const leadDiv = lead.division || lead.category || "General";
                    const isAero = leadDiv.toLowerCase() === "aerospace";
                    const productName =
                      lead.productInquired ||
                      lead.productName ||
                      lead.product ||
                      "General Inquiry";

                    return (
                      <tr
                        key={lead.id || lead._id}
                        className="hover:bg-[#f8fafc] transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-medium text-gray-700">
                          {lead.id ? `#${lead.id}` : "—"}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#1c232f]">
                            {lead.name || "Anonymous Contact"}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {lead.company || "Direct"}{" "}
                            {lead.country ? `(${lead.country})` : ""}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {renderContactTypeBadge(lead.type)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#105784] flex items-center gap-1">
                            {isAero ? (
                              <Plane className="w-3.5 h-3.5 text-[#105784] shrink-0" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            <span className="truncate max-w-[150px]">
                              {productName}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-gray-600 font-medium">
                            {leadDiv}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {renderStatusBadge(lead.status)}
                        </td>
                        <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                          {formatDateTime(lead)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#105784] hover:bg-[#105784]/10 rounded border border-[#105784]/30 transition cursor-pointer"
                          >
                            View
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
      )}

      {/* Industrial Pillars & Product Catalog Overview (Available for Both Super Admin & Normal Admin) */}
      <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08)] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1c232f]">
                Active Industrial Pillars & Product Catalog
              </h2>
              {!isSuperAdmin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <EyeOff className="w-3 h-3" />
                  <span>Leads Hidden for Normal Admin</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage products, imagery, and specifications across all configured
              industrial pillars.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab("masters")}
            className="px-3.5 py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Configure Masters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {divisions.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-gray-400 bg-[#f8fafc] rounded-xl border border-dashed border-[#e2e8f0]">
              No industrial divisions configured yet.
            </div>
          ) : (
            divisions.map((div) => {
              const divProductsCount = products.filter(
                (p) =>
                  (p.division || "").toLowerCase() ===
                  (div.name || "").toLowerCase()
              ).length;
              return (
                <div
                  key={div.id || div.slug || div.name}
                  className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 flex flex-col justify-between hover:shadow-sm transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#105784]">
                        {div.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ● {div.status || "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {div.description || "Industrial manufacturing & engineering division."}
                    </p>
                    <div className="text-lg font-bold text-[#1c232f] mt-3">
                      {divProductsCount}{" "}
                      <span className="text-xs font-normal text-gray-400">
                        Products
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigateTab) {
                        const targetSlug =
                          div.slug === "aerospace"
                            ? "products-aerospace"
                            : div.slug === "defence"
                            ? "products-defence"
                            : `products-${
                                div.slug ||
                                div.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                              }`;
                        onNavigateTab(targetSlug);
                      }
                    }}
                    className="mt-4 pt-3 border-t border-gray-200/80 text-xs font-bold text-[#105784] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open {div.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Lead Modal (Only active if Super Admin clicks inspect) */}
      {selectedLead && isSuperAdmin && (
        <div
          onClick={() => setSelectedLead(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 relative space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">
                  {selectedLead.id ? `#${selectedLead.id}` : "LEAD"}
                </span>
                <h3 className="text-base font-bold text-[#1c232f] mt-0.5">
                  {selectedLead.name || "Client Lead"}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedLead.company || "Individual / Direct"}{" "}
                  {selectedLead.country ? `• ${selectedLead.country}` : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">
                  Inquired Product:
                </span>
                <span className="font-bold text-[#105784]">
                  {selectedLead.productInquired ||
                    selectedLead.productName ||
                    selectedLead.product ||
                    "General / Multi-item"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Division:</span>
                <span className="font-bold text-gray-800">
                  {selectedLead.division ||
                    selectedLead.category ||
                    "General"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Inquiry Type:</span>
                <div>{renderContactTypeBadge(selectedLead.type)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Status:</span>
                <div>{renderStatusBadge(selectedLead.status)}</div>
              </div>
              {selectedLead.priority && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">Priority:</span>
                  <span className="font-bold text-amber-700">
                    {selectedLead.priority}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Received:</span>
                <span className="text-gray-600 font-mono text-[11px]">
                  {formatDateTime(selectedLead)}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedLead.email && (
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 text-gray-700 hover:border-[#105784] hover:text-[#105784] transition"
                >
                  <Mail className="w-4 h-4 text-[#105784] shrink-0" />
                  <span className="truncate">{selectedLead.email}</span>
                </a>
              )}
              {selectedLead.phone && (
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 text-gray-700 hover:border-[#105784] hover:text-[#105784] transition"
                >
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{selectedLead.phone}</span>
                </a>
              )}
            </div>

            {/* Message */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">
              <strong className="block text-gray-700 mb-1">
                Message Content:
              </strong>
              {selectedLead.message || "No specific message text provided."}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedLead(null);
                  if (onNavigateTab) onNavigateTab("contact-leads");
                }}
                className="text-xs font-bold text-[#105784] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage in Contact Leads</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
