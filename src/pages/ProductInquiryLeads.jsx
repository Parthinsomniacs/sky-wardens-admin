import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Mail,
  CheckCircle2,
  Tag,
  Plane,
  Shield,
  X,
  Filter,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { INITIAL_LEADS, CONTACT_TYPES } from "../data/mockData";
import { leadsApi } from "../services/api";

export default function ProductInquiryLeads() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const data = await leadsApi.getAll();
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setLeads(
            list.filter(
              (l) =>
                l.type === "Product(s) Inquiry" ||
                l.type === "Procurement / Tender" ||
                l.type === "Distributor / Channel Partnership" ||
                (l.type && l.type.includes("Product"))
            )
          );
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
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [exportNotice, setExportNotice] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const renderContactTypeBadge = (type) => {
    switch (type) {
      case "Procurement / Tender":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Procurement / Tender
          </span>
        );
      case "Product(s) Inquiry":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            Product(s) Inquiry
          </span>
        );
      case "Distributor / Channel Partnership":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Channel Partner
          </span>
        );
      case "Strategic Partnership / Joint Venture":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Strategic JV
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {type}
          </span>
        );
    }
  };

  // Filter computation
  const filteredLeads = leads.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productInquired.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision =
      divisionFilter === "all" || item.category.toLowerCase() === divisionFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" || item.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" || item.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesDivision && matchesType && matchesStatus && matchesPriority;
  });

  // Pagination calculation (10 inquiries per page)
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const handleStatusChange = (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Email,Phone,Organization,Country,Product,Division,Status,Priority,Date\n";
    const rows = filteredLeads
      .map(
        (l) =>
          `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.company}","${l.country}","${l.productInquired}","${l.category}","${l.status}","${l.priority}","${l.date}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SkyWardens_Product_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const aerospaceCount = leads.filter((l) => l.category === "Aerospace").length;
  const defenceCount = leads.filter((l) => l.category === "Defence").length;
  const highPriorityCount = leads.filter((l) => l.priority === "High").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#eaedf1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Home</span>
            <span>/</span>
            <span>Inquiries</span>
            <span>/</span>
            <span className="font-semibold text-[#105784]">Product Inquiry Leads</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
            Product Inquiry Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Mission-critical equipment, avionics, and radar inquiries submitted by defense & commercial agencies.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#105784] border border-[#ced4da] text-xs font-semibold rounded-lg shadow-2xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Inquiries ({filteredLeads.length})</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Product inquiry CSV report generated and downloaded successfully.</span>
        </div>
      )}

      {/* KPI Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total Hardware Inquiries
          </span>
          <div className="text-2xl font-bold text-[#1c232f] mt-1">{leads.length}</div>
          <div className="text-[11px] text-gray-400 mt-1">100% Verified Specs</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-sky-500">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Aerospace Systems
          </span>
          <div className="text-2xl font-bold text-sky-700 mt-1">{aerospaceCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Avionics, Drones & Flight Displays</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Defence & Tactical EW
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{defenceCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Radars, Counter-UAS & Jammers</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            High Priority RFQs
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{highPriorityCount}</div>
          <div className="text-[11px] text-gray-400 mt-1">Urgent testing & procurement</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by equipment, agency, country, or lead ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Division:</span>
            </div>
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-[#105784]"
            >
              <option value="all">All Divisions</option>
              <option value="Aerospace">Aerospace</option>
              <option value="Defence">Defence</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-1">
              <span>Inquiry Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-[#105784]"
            >
              <option value="all">All Inquiry Types</option>
              {CONTACT_TYPES.filter((t) =>
                leads.some((l) => l.type === t)
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-1">
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-[#105784]"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="In Discussion">In Discussion</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-[#105784]"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">No Product Inquiries Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No product inquiries match the current search filters. Try adjusting your query or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setDivisionFilter("all");
                setTypeFilter("all");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              className="mt-4 px-3 py-1.5 bg-[#105784] text-white text-xs font-semibold rounded-lg hover:bg-[#0c476c] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-[#eaedf1]">
                <tr>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Client Agency</th>
                  <th className="py-3 px-4">Inquiry Type</th>
                  <th className="py-3 px-4">Inquired Product / Payload</th>
                  <th className="py-3 px-4">Division</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f8]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#105784] border-t-transparent rounded-full animate-spin" />
                        <span>Loading product inquiries...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <p className="text-sm font-medium text-gray-500">No product inquiry leads found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Inquiries inquiring about specific products will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                      {lead.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1c232f]">{lead.name}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-gray-300" />
                        <span>{lead.company} ({lead.country})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {renderContactTypeBadge(lead.type)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#105784] flex items-center gap-1.5">
                        {lead.category === "Aerospace" ? (
                          <Plane className="w-3.5 h-3.5 text-[#105784] shrink-0" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span>{lead.productInquired}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 max-w-md">
                        "{lead.message}"
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.category === "Aerospace"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {lead.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.priority === "High"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          lead.status === "New"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : lead.status === "In Discussion"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : lead.status === "Contacted"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <option value="New">● New</option>
                        <option value="In Discussion">● In Discussion</option>
                        <option value="Contacted">● Contacted</option>
                        <option value="Converted">● Converted</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                      {lead.date}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#105784] hover:bg-[#105784] hover:text-white rounded border border-[#105784]/30 transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination & Status Footer */}
            <div className="p-4 border-t border-[#eaedf1] flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-3 bg-[#fbfcfd]">
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
                inquiries
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1 self-center sm:self-auto">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={safeCurrentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium cursor-pointer"
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
                            : "border border-[#e2e8f0] bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={safeCurrentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium cursor-pointer"
                    aria-label="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-gray-200 relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#105784]">
                    {selectedLead.id}
                  </span>
                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded">
                    {selectedLead.priority} Priority
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1c232f] mt-1">
                  Product Lead Specification Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquired Product Header Banner */}
            <div className="my-4 p-4 bg-[#f8fafc] border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Target Platform / Inquired Equipment
                </span>
                {renderContactTypeBadge(selectedLead.type)}
              </div>
              <p className="font-bold text-[#105784] text-base mt-0.5 flex items-center gap-2">
                {selectedLead.category === "Aerospace" ? (
                  <Plane className="w-4 h-4 text-[#105784]" />
                ) : (
                  <Shield className="w-4 h-4 text-emerald-600" />
                )}
                {selectedLead.productInquired}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span>Category: <strong>{selectedLead.category} Division</strong></span>
                <span>•</span>
                <span>Inquiry Scope: <strong>{selectedLead.type}</strong></span>
              </div>
            </div>

            {/* Client Profile Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[11px]">Authorized Representative</span>
                <span className="font-bold text-gray-900 text-xs">{selectedLead.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Organization / Directorate</span>
                <span className="font-bold text-gray-900 text-xs">{selectedLead.company}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Corporate / Defense Email</span>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="font-bold text-[#105784] hover:underline"
                >
                  {selectedLead.email}
                </a>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Secure Contact Line</span>
                <span className="font-bold text-gray-900">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Jurisdiction / Location</span>
                <span className="font-bold text-gray-900">
                  {[selectedLead.city, selectedLead.state, selectedLead.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Received Timestamp</span>
                <span className="font-bold text-gray-900">{selectedLead.timestamp}</span>
              </div>

              {/* Dynamic Inquiry Details */}
              {selectedLead.tenderReference && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block text-[11px]">Tender Reference</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                    {selectedLead.tenderReference}
                  </span>
                </div>
              )}

              {selectedLead.selectedProducts && selectedLead.selectedProducts.length > 0 && (
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-400 block text-[11px] mb-1.5">
                    All Selected Products ({selectedLead.selectedProducts.length})
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

            {/* Message / Requirements */}
            <div className="my-4 text-xs">
              <span className="text-gray-500 font-semibold block mb-1">
                Technical Requirement & Scope of Work:
              </span>
              <div className="p-3.5 bg-white border border-gray-200 rounded-lg text-gray-800 leading-relaxed font-sans">
                "{selectedLead.message}"
              </div>
            </div>

            {/* Status Change Control */}
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Update Ingestion Status:</span>
              <select
                value={selectedLead.status}
                onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-md font-bold text-xs"
              >
                <option value="New">New</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Dismiss
              </button>
              <a
                href={`mailto:${selectedLead.email}?subject=RE: Sky Wardens Technical Briefing - ${encodeURIComponent(
                  selectedLead.productInquired
                )}`}
                className="px-4 py-2 text-xs font-semibold bg-[#105784] hover:bg-[#0c476c] text-white rounded-lg flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Dispatch Technical Response</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
