import { useState, useMemo, useRef } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Shield,
  Plane,
  Cpu,
  FlaskConical,
  Database,
  AlertTriangle,
  Boxes,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { useProducts } from "../context/ProductsContext";
import { validateImageFile, compressToWebP } from "../utils/imageCompressor";

export default function MastersPage({ onNavigateTab }) {
  const {
    divisions,
    products,
    addDivision,
    updateDivision,
    deleteDivision,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Active' | 'Inactive'

  // Modals state
  const [showAddDivisionModal, setShowAddDivisionModal] = useState(false);
  const [divisionToEdit, setDivisionToEdit] = useState(null);
  const [divisionToDelete, setDivisionToDelete] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Product counts per division
  const divisionProductCounts = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.division] = (map[p.division] || 0) + 1;
    });
    return map;
  }, [products]);

  // Filtered Divisions
  const filteredDivisions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return divisions.filter((d) => {
      const matchesSearch =
        q === "" ||
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q);
      const divStatus = d.status || "Active";
      const matchesStatus =
        statusFilter === "all" || divStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [divisions, searchQuery, statusFilter]);

  const activeCount = useMemo(() => {
    return divisions.filter((d) => (d.status || "Active") === "Active").length;
  }, [divisions]);

  const renderDivisionIcon = (name, className = "w-4 h-4") => {
    switch (name) {
      case "Aerospace":
        return <Plane className={className} />;
      case "Defence":
        return <Shield className={className} />;
      case "Advanced Systems":
        return <Cpu className={className} />;
      case "Petrochemicals":
        return <FlaskConical className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const handleToggleDivisionStatus = async (div) => {
    const currentStatus = div.status || "Active";
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await updateDivision(div.id || div._id, { status: nextStatus });
      triggerToast(
        `Division "${div.name}" and all its products are now ${nextStatus}.`
      );
    } catch (err) {
      triggerToast(err.message || "Failed to update division status.");
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#eaedf1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Home</span>
            <span>/</span>
            <span>Products</span>
            <span>/</span>
            <span className="font-semibold text-[#105784]">Divisions Master</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c232f] tracking-tight">
            Divisions Master
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Configure industrial divisions (Aerospace, Defence, Advanced Systems,
            Petrochemicals, etc.) for the Sky Wardens catalog.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowAddDivisionModal(true)}
            className="px-4 py-2.5 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Division</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total Divisions
          </span>
          <div className="text-2xl font-bold text-[#1c232f] mt-1">
            {divisions.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Master industrial pillars
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Active Divisions
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {activeCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Ready for catalog products
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-purple-600">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Linked Products
          </span>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {products.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Total catalog inventory
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Catalog Status
          </span>
          <div className="text-base font-bold text-amber-700 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Synchronized</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Live auto-dispatch active
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search divisions by name, sector or scope..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
          />
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#105784] text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({divisions.length})
          </button>
          <button
            onClick={() => setStatusFilter("Active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === "Active"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("Inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              statusFilter === "Inactive"
                ? "bg-gray-700 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Inactive ({divisions.length - activeCount})
          </button>
        </div>
      </div>

      {/* DIVISIONS MASTER CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDivisions.map((div) => {
          const productCount = divisionProductCounts[div.name] || 0;
          const isCore = div.id === "Aerospace" || div.id === "Defence";

          return (
            <div
              key={div.id}
              className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] hover:shadow-md transition flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#f0f4f8] border border-[#d6e0ea] flex items-center justify-center text-[#105784] shadow-2xs">
                    {renderDivisionIcon(div.name, "w-5 h-5")}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDivisionStatus(div)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                      (div.status || "Active") === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                    }`}
                    title={`Click to switch status to ${(div.status || "Active") === "Active" ? "Inactive" : "Active"}`}
                  >
                    <span>● {div.status || "Active"}</span>
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-base text-[#1c232f]">
                    {div.name}
                  </h3>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                    slug: #{div.slug || div.name.toLowerCase().replace(/\s+/g, "-")}
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 mt-2 leading-relaxed">
                  {div.description || "Industrial division configured for product line management."}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0]">
                  <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <Boxes className="w-3.5 h-3.5 text-[#105784]" />
                    <span>Catalog Products:</span>
                  </div>
                  <span className="font-bold text-emerald-700 text-sm">
                    {productCount} items
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (onNavigateTab) {
                      const targetSlug =
                        div.slug === "aerospace"
                          ? "products-aerospace"
                          : div.slug === "defence"
                          ? "products-defence"
                          : `products-${div.slug || div.name.toLowerCase().replace(/\s+/g, "-")}`;
                      onNavigateTab(targetSlug);
                    }
                  }}
                  className="text-xs font-bold text-[#105784] hover:text-[#0b3c5d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Products</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDivisionToEdit(div)}
                    className="p-1.5 text-sky-700 hover:bg-sky-50 rounded border border-sky-200 transition cursor-pointer"
                    title="Edit Division"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {!isCore && (
                    <button
                      onClick={() => setDivisionToDelete(div)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition cursor-pointer"
                      title="Delete Division"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDivisions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">
            No Divisions Found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No divisions matching "${searchQuery}". Try a different keyword.`
              : "No divisions currently available."}
          </p>
        </div>
      )}

      {/* ADD DIVISION MODAL */}
      {showAddDivisionModal && (
        <DivisionFormModal
          mode="add"
          onClose={() => setShowAddDivisionModal(false)}
          onSubmit={async (data) => {
            try {
              const added = await addDivision(data);
              if (added) {
                triggerToast(`Division "${added.name}" added successfully!`);
              }
            } catch (err) {
              console.error(err);
              triggerToast(err.message || "Failed to add division.");
            } finally {
              setShowAddDivisionModal(false);
            }
          }}
        />
      )}

      {/* EDIT DIVISION MODAL */}
      {divisionToEdit && (
        <DivisionFormModal
          mode="edit"
          initialData={divisionToEdit}
          onClose={() => setDivisionToEdit(null)}
          onSubmit={async (data) => {
            try {
              await updateDivision(divisionToEdit.id || divisionToEdit._id, data);
              triggerToast(`Division "${data.name}" updated successfully!`);
            } catch (err) {
              console.error(err);
              triggerToast(err.message || "Failed to update division.");
            } finally {
              setDivisionToEdit(null);
            }
          }}
        />
      )}

      {/* DELETE DIVISION CONFIRMATION */}
      {divisionToDelete && (
        <div
          onClick={() => setDivisionToDelete(null)}
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
                  Delete Division
                </h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to remove this division?
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
              <strong>{divisionToDelete.name}</strong> will be removed from
              master definitions. Existing products will retain their records.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDivisionToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteDivision(divisionToDelete.id || divisionToDelete._id);
                    triggerToast(`Division "${divisionToDelete.name}" deleted.`);
                  } catch (err) {
                    triggerToast(err.message || "Failed to delete division.");
                  } finally {
                    setDivisionToDelete(null);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// DIVISION FORM MODAL (Add & Edit)
// ======================================================================
function DivisionFormModal({ mode = "add", initialData = null, onClose, onSubmit }) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [status, setStatus] = useState(initialData?.status || "Active");
  const [sector, setSector] = useState(initialData?.sector || "");
  const [buttonText, setButtonText] = useState(initialData?.buttonText || "");
  const [imageSrc, setImageSrc] = useState(initialData?.imageSrc || "");
  const [logoSrc, setLogoSrc] = useState(initialData?.logoSrc || "");
  const [order, setOrder] = useState(
    initialData?.order !== undefined ? initialData.order : 0
  );
  const [errorMsg, setErrorMsg] = useState("");

  // Image Upload States
  const [imageSourceMode, setImageSourceMode] = useState("upload"); // 'upload' | 'url'
  const [logoSourceMode, setLogoSourceMode] = useState("upload"); // 'upload' | 'url'
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [compressingTarget, setCompressingTarget] = useState(null); // 'image' | 'logo' | null
  const [imageFileName, setImageFileName] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [imageCompressionInfo, setImageCompressionInfo] = useState(null);
  const [logoCompressionInfo, setLogoCompressionInfo] = useState(null);
  const imageInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleProcessFile = async (file, target) => {
    if (!file) return;

    // 1. Strict Validation: reject gifs, videos, and non-image types
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      return;
    }

    try {
      setErrorMsg("");
      setCompressingTarget(target);

      // 2. High-Resolution WebP Compression (2560px for background, 1200px for logo)
      const options =
        target === "image"
          ? { maxWidth: 2560, maxHeight: 1600, quality: 0.90 }
          : { maxWidth: 1200, maxHeight: 1200, quality: 0.92 };

      const result = await compressToWebP(file, options);

      const origKb = Math.round(result.originalSize / 1024);
      const compKb = Math.round(result.compressedSize / 1024);
      const savings = Math.max(
        0,
        Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
      );
      const infoText = `High-Res WebP (${result.width}×${result.height}) • ${compKb} KB (${savings}% saved)`;

      if (target === "image") {
        setImageSrc(result.dataUrl);
        setImageFileName(file.name.replace(/\.[^/.]+$/, "") + ".webp");
        setImageCompressionInfo(infoText);
      } else {
        setLogoSrc(result.dataUrl);
        setLogoFileName(file.name.replace(/\.[^/.]+$/, "") + ".webp");
        setLogoCompressionInfo(infoText);
      }
    } catch (err) {
      console.error("Image compression error:", err);
      setErrorMsg(err.message || "Failed to compress image.");
    } finally {
      setCompressingTarget(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Division Name is required.");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
      sector: sector.trim(),
      buttonText: buttonText.trim(),
      imageSrc: imageSrc.trim(),
      logoSrc: logoSrc.trim(),
      order: Number(order) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
      />

      {/* Slide-Over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-lg sm:max-w-xl bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-slideInRight pointer-events-auto"
        >
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-[#1c232f] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#105784] flex items-center justify-center text-white shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {mode === "add" ? "Create New Division" : `Edit Division: ${initialData?.name}`}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Configure industrial vertical pillar and homepage business card.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Drawer Body Form (scrollable) */}
          <form
            id="division-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5 text-xs"
          >
            {/* Section 1: Core Division Details */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Core Division Settings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Division Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Petrochemicals"
                    required
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition font-semibold"
                  >
                    <option value="Active">Active (Live in Admin & Homepage)</option>
                    <option value="Inactive">Inactive (Disabled / Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Description / Mission Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description of the equipment domain, operational readiness, and systems..."
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                />
              </div>
            </div>

            {/* Section 2: Homepage "Our Businesses" Card Settings */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h4 className="text-[11px] font-bold text-[#105784] uppercase tracking-wider flex items-center gap-1.5">
                <span>Homepage "Our Businesses" Card Settings</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Sector Tag
                  </label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g. Sector 1"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder={`Explore ${name || "Division"}`}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="1, 2, 3..."
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition font-mono"
                  />
                </div>
              </div>

              {/* CARD BACKGROUND IMAGE UPLOADER */}
              <div className="space-y-1.5 p-3.5 bg-[#f8fafc] rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-700 uppercase">
                    Card Background Image
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("upload")}
                      className={`px-2 py-0.5 text-[10px] rounded font-semibold transition cursor-pointer ${
                        imageSourceMode === "upload"
                          ? "bg-[#105784] text-white shadow-2xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode("url")}
                      className={`px-2 py-0.5 text-[10px] rounded font-semibold transition cursor-pointer ${
                        imageSourceMode === "url"
                          ? "bg-[#105784] text-white shadow-2xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      URL / Path
                    </button>
                  </div>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleProcessFile(e.target.files?.[0], "image")}
                />

                {imageSrc ? (
                  <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                    <div className="w-20 h-16 bg-[#161c25] rounded-md flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt="Background Preview"
                        className="max-h-full max-w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {imageFileName || imageSrc.split("/").pop() || "Background Image Attached"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {imageCompressionInfo || "High-Res WebP Attached"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (imageSourceMode === "upload") {
                              imageInputRef.current?.click();
                            } else {
                              setImageSrc("");
                            }
                          }}
                          className="text-[11px] font-semibold text-[#105784] hover:underline cursor-pointer"
                        >
                          Change Image
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setImageSrc("");
                            setImageFileName("");
                            setImageCompressionInfo(null);
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {imageSourceMode === "upload" ? (
                      compressingTarget === "image" ? (
                        <div className="p-6 text-center border-2 border-dashed border-[#105784] rounded-lg bg-sky-50/50">
                          <Loader2 className="w-6 h-6 text-[#105784] animate-spin mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-gray-800 block">
                            Compressing to High-Resolution WebP...
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Optimizing crisp 2K display resolution & reducing size
                          </span>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsImageDragging(true);
                          }}
                          onDragLeave={() => setIsImageDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsImageDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleProcessFile(file, "image");
                          }}
                          onClick={() => imageInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer ${
                            isImageDragging
                              ? "border-[#105784] bg-sky-50"
                              : "border-gray-300 hover:border-gray-400 bg-white"
                          }`}
                        >
                          <UploadCloud className="w-6 h-6 text-[#105784] mx-auto mb-1" />
                          <span className="text-xs font-semibold text-gray-700 block">
                            Click to browse or drag & drop background image
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Auto-converted to High-Res WebP (PNG, JPG, WEBP only • No GIF/Video)
                          </span>
                        </div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={imageSrc}
                        onChange={(e) => setImageSrc(e.target.value)}
                        placeholder="/images/business-aerospace.jpg"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] text-xs transition font-mono"
                      />
                    )}
                  </>
                )}
              </div>

              {/* FLOATING CENTER LOGO UPLOADER */}
              <div className="space-y-1.5 p-3.5 bg-[#f8fafc] rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-700 uppercase">
                    Floating Center Logo (White/Transparent)
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setLogoSourceMode("upload")}
                      className={`px-2 py-0.5 text-[10px] rounded font-semibold transition cursor-pointer ${
                        logoSourceMode === "upload"
                          ? "bg-[#105784] text-white shadow-2xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoSourceMode("url")}
                      className={`px-2 py-0.5 text-[10px] rounded font-semibold transition cursor-pointer ${
                        logoSourceMode === "url"
                          ? "bg-[#105784] text-white shadow-2xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      URL / Path
                    </button>
                  </div>
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleProcessFile(e.target.files?.[0], "logo")}
                />

                {logoSrc ? (
                  <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                    <div className="w-20 h-16 bg-[#161c25] rounded-md flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                      <img
                        src={logoSrc}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {logoFileName || logoSrc.split("/").pop() || "Logo Image Attached"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {logoCompressionInfo || "High-Res Logo WebP Attached"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (logoSourceMode === "upload") {
                              logoInputRef.current?.click();
                            } else {
                              setLogoSrc("");
                            }
                          }}
                          className="text-[11px] font-semibold text-[#105784] hover:underline cursor-pointer"
                        >
                          Change Logo
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoSrc("");
                            setLogoFileName("");
                            setLogoCompressionInfo(null);
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {logoSourceMode === "upload" ? (
                      compressingTarget === "logo" ? (
                        <div className="p-6 text-center border-2 border-dashed border-[#105784] rounded-lg bg-sky-50/50">
                          <Loader2 className="w-6 h-6 text-[#105784] animate-spin mx-auto mb-1.5" />
                          <span className="text-xs font-bold text-gray-800 block">
                            Compressing Logo to WebP...
                          </span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Preserving transparent background & sharp vector clarity
                          </span>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsLogoDragging(true);
                          }}
                          onDragLeave={() => setIsLogoDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsLogoDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleProcessFile(file, "logo");
                          }}
                          onClick={() => logoInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer ${
                            isLogoDragging
                              ? "border-[#105784] bg-sky-50"
                              : "border-gray-300 hover:border-gray-400 bg-white"
                          }`}
                        >
                          <UploadCloud className="w-6 h-6 text-[#105784] mx-auto mb-1" />
                          <span className="text-xs font-semibold text-gray-700 block">
                            Click to browse or drag & drop center logo
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Transparent PNG, JPG, WEBP (Auto-converted to high-res WebP • No GIF/Video)
                          </span>
                        </div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={logoSrc}
                        onChange={(e) => setLogoSrc(e.target.value)}
                        placeholder="/images/aerospace.png"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] text-xs transition font-mono"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Drawer Footer (fixed at bottom) */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="division-form"
              className="px-5 py-2 text-xs font-bold bg-[#105784] hover:bg-[#0c476c] text-white rounded-lg shadow-2xs transition cursor-pointer"
            >
              {mode === "add" ? "Create Division" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
