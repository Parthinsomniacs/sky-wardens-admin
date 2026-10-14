import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  Tag,
  Plane,
  Shield,
  MessageSquare,
  X,
  Building2,
  Phone,
  FileCheck2,
  Handshake,
  Briefcase,
  Radio,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { INITIAL_LEADS, CONTACT_TYPES } from "../data/mockData";
import { leadsApi } from "../services/api";

export default function ContactLeads() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const data = await leadsApi.getAll();
        if (isMounted) {
          setLeads(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Backend leads fetch:", err.message);
        if (isMounted) setLeads([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLeads();
    return () => {
      isMounted = false;
    };
  }, []);

  const ITEMS_PER_PAGE = 10;

  // Status counters
  const totalLeads = leads.length;
  const procurementLeadsCount = leads.filter(
    (l) => l.type === "Procurement / Tender" || l.type === "Product(s) Inquiry"
  ).length;
  const partnershipLeadsCount = leads.filter(
    (l) =>
      l.type === "Strategic Partnership / Joint Venture" ||
      l.type === "Distributor / Channel Partnership" ||
      l.type === "Affiliations / Collaboration"
  ).length;
  const newLeadsCount = leads.filter((l) => l.status === "New").length;

  const handleStatusChange = async (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }
    try {
      await leadsApi.updateStatus(leadId, newStatus);
    } catch (err) {
      console.warn("Status update sync failed:", err.message);
    }
  };

  const handleExportCSV = () => {
    const headers =
      "Lead ID,Contact Name,Email,Phone,Organization,Country,Contact Type,Inquired Product/Subject,Division,Status,Priority,Date\n";
    const rows = filteredLeads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.company}","${l.country}","${l.type}","${l.productInquired}","${l.category}","${l.status}","${l.priority}","${l.date}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `SkyWardens_Contact_Leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "aerospace" && lead.category === "Aerospace") ||
      (categoryFilter === "defence" && lead.category === "Defence") ||
      (categoryFilter === "general" && lead.category === "General");

    const matchesType = typeFilter === "all" || lead.type === typeFilter;

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.productInquired.toLowerCase().includes(q) ||
      lead.type.toLowerCase().includes(q) ||
      lead.id.toLowerCase().includes(q);

    return matchesCategory && matchesType && matchesStatus && matchesSearch;
  });

  // Pagination calculation (10 leads per page)
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  // Badge styling helper for the public contact inquiry types
  const renderContactTypeBadge = (type) => {
    switch (type) {
      case "Procurement / Tender":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FileCheck2 className="w-3 h-3 text-indigo-600 shrink-0" />
            <span>Procurement / Tender</span>
          </span>
        );
      case "Product(s) Inquiry":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Tag className="w-3 h-3 text-sky-600 shrink-0" />
            <span>Product(s) Inquiry</span>
          </span>
        );
      case "Strategic Partnership / Joint Venture":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Handshake className="w-3 h-3 text-purple-600 shrink-0" />
            <span>Strategic Partnership</span>
          </span>
        );
      case "Distributor / Channel Partnership":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
            <span>Channel Partner</span>
          </span>
        );
      case "Institutional / Government Engagement":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Institutional / Govt</span>
          </span>
        );
      case "Affiliations / Collaboration":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Handshake className="w-3 h-3 text-teal-600 shrink-0" />
            <span>Affiliation / Collab</span>
          </span>
        );
      case "Careers / Recruitment":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Briefcase className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Careers / Hiring</span>
          </span>
        );
      case "Media / Corporate Communication":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Radio className="w-3 h-3 text-rose-600 shrink-0" />
            <span>Media / PR</span>
          </span>
        );
      case "General Inquiry":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <HelpCircle className="w-3 h-3 text-gray-500 shrink-0" />
            <span>General Inquiry</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#eaedf1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Home</span>
            <span>/</span>
            <span>Leads</span>
            <span>/</span>
            <span className="font-semibold text-[#105784]">Contact Leads</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
            Contact Leads & Inbound Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Classified inquiries submitted through the official Sky Wardens public contact portal.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-[#ced4da] shadow-2xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Leads ({filteredLeads.length})</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Contact leads CSV report downloaded successfully.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784]">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Total Inbound Leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#105784]/10 text-[#105784] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1c232f] mt-2">{totalLeads}</div>
          <span className="text-xs text-gray-400 mt-1 block">Across all 9 contact categories</span>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Procurement & RFQs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">{procurementLeadsCount}</div>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">
            Military & commercial orders
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <span>Partnerships & Collabs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{partnershipLeadsCount}</div>
          <span className="text-xs text-gray-400 mt-1 block">Alliances & distribution</span>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase">
            <span>New Actionable</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{newLeadsCount}</div>
          <span className="text-xs text-gray-400 mt-1 block">Awaiting initial briefing</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.08)] p-5 sm:p-6 space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Division Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-[#f4f7fa] p-1 rounded-lg border border-[#e2e8f0]">
            {[
              { id: "all", label: "All Divisions" },
              { id: "aerospace", label: "Aerospace" },
              { id: "defence", label: "Defence" },
              { id: "general", label: "Institutional / General" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCategoryFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? "bg-white text-[#105784] shadow-2xs font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Contact Type & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search leads, names, email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white"
              />
            </div>

            {/* Official Contact Type Filter Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#105784] cursor-pointer"
            >
              <option value="all">All Contact Types ({leads.length})</option>
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-gray-700 font-medium focus:outline-none focus:border-[#105784] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Leads Table with Contact Type Column */}
        <div className="overflow-x-auto rounded-lg border border-[#eaedf1]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-[#eaedf1]">
              <tr>
                <th className="py-3 px-3.5">Lead ID</th>
                <th className="py-3 px-3.5">Client Contact</th>
                <th className="py-3 px-3.5">Contact Type</th>
                <th className="py-3 px-3.5">Inquired Product / Subject</th>
                <th className="py-3 px-3.5">Division</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f8]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#105784] border-t-transparent rounded-full animate-spin" />
                      <span>Loading inquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-medium text-gray-500">No contact leads found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      New inquiries submitted from the website will appear here in real time.
                    </p>
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    {/* Lead ID */}
                    <td className="py-3.5 px-3.5 font-mono font-medium text-gray-700">
                      {lead.id}
                    </td>

                    {/* Contact Person */}
                    <td className="py-3.5 px-3.5">
                      <div className="font-semibold text-[#1c232f]">{lead.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {lead.company} ({lead.country})
                      </div>
                    </td>

                    {/* Contact Type Column */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {renderContactTypeBadge(lead.type)}
                    </td>

                    {/* Inquired Product / Subject */}
                    <td className="py-3.5 px-3.5">
                      <div className="font-semibold text-[#105784] flex items-center gap-1.5">
                        {lead.category === "Aerospace" ? (
                          <Plane className="w-3.5 h-3.5 text-[#105784] shrink-0" />
                        ) : lead.category === "Defence" ? (
                          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>{lead.productInquired}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 max-w-xs">
                        "{lead.message}"
                      </p>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.category === "Aerospace"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : lead.category === "Defence"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {lead.category}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lead.status === "New"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : lead.status === "In Discussion"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : lead.status === "Contacted"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : lead.status === "Converted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            lead.status === "New"
                              ? "bg-amber-500"
                              : lead.status === "In Discussion"
                              ? "bg-blue-500"
                              : lead.status === "Contacted"
                              ? "bg-purple-500"
                              : lead.status === "Converted"
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {lead.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3.5 text-gray-500 text-[11px] whitespace-nowrap">
                      {lead.date}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#105784] hover:bg-[#105784] hover:text-white rounded border border-[#105784]/30 transition cursor-pointer"
                      >
                        View Lead
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="pt-3 border-t border-[#eaedf1] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-3">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredLeads.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(endIndex, filteredLeads.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {filteredLeads.length}
            </span>{" "}
            leads
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                      safeCurrentPage === pageNum
                        ? "bg-[#105784] text-white shadow-2xs"
                        : "border border-[#e2e8f0] text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium cursor-pointer"
                aria-label="Next Page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#105784]">
                    {selectedLead.id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      selectedLead.category === "Aerospace"
                        ? "bg-sky-50 text-sky-700"
                        : selectedLead.category === "Defence"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedLead.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1c232f] mt-1">
                  Lead Dossier & Contact Submission
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquired Product & Contact Type Highlight Box */}
            <div className="my-4 p-4 bg-[#f0f7fc] border border-[#d2e7f7] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Submission Contact Type
                </span>
                {renderContactTypeBadge(selectedLead.type)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#105784] uppercase tracking-wider block">
                  Inquired Equipment / Scope
                </span>
                <p className="text-sm font-bold text-[#1c232f] mt-0.5">
                  {selectedLead.productInquired}
                </p>
                <span className="text-[11px] text-gray-500">
                  Division: {selectedLead.category} Solutions
                </span>
              </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-gray-50 rounded-lg">
              <div>
                <span className="text-gray-500 block text-[11px]">Contact Person</span>
                <span className="font-bold text-gray-900">{selectedLead.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Organization / Directorate</span>
                <span className="font-bold text-gray-900">{selectedLead.company}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Email Address</span>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="font-bold text-[#105784] hover:underline"
                >
                  {selectedLead.email}
                </a>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Phone Number</span>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="font-bold text-gray-900 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>{selectedLead.phone}</span>
                </a>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Location / Jurisdiction</span>
                <span className="font-bold text-gray-900">
                  {[selectedLead.city, selectedLead.state, selectedLead.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Submission Time</span>
                <span className="font-mono text-gray-700">{selectedLead.timestamp}</span>
              </div>

              {/* Dynamic Inquiry Fields */}
              {selectedLead.tenderReference && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px]">Tender Reference</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                    {selectedLead.tenderReference}
                  </span>
                </div>
              )}

              {selectedLead.designation && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px]">Official Designation</span>
                  <span className="font-bold text-gray-900">
                    {selectedLead.designation}
                  </span>
                </div>
              )}

              {selectedLead.mediaDeadline && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px]">Media Response Deadline</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                    📅 {selectedLead.mediaDeadline}
                  </span>
                </div>
              )}

              {selectedLead.selectedProducts && selectedLead.selectedProducts.length > 0 && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block text-[11px] mb-1.5">
                    Products of Interest ({selectedLead.selectedProducts.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.selectedProducts.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 bg-sky-50 text-[#105784] font-medium text-[11px] rounded-full border border-sky-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inquirer Message */}
            <div className="my-4">
              <span className="text-xs font-semibold text-gray-600 block mb-1">
                Client Requirement Message
              </span>
              <div className="p-3.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 leading-relaxed font-sans">
                "{selectedLead.message}"
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-xs">
              <span className="font-semibold text-gray-700">Update Lead Status:</span>
              <select
                value={selectedLead.status}
                onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                className="px-2.5 py-1 font-semibold text-xs rounded border border-gray-300 bg-white text-[#1c232f] focus:outline-none focus:border-[#105784] cursor-pointer"
              >
                <option value="New">New</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
