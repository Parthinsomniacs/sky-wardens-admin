import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useProducts } from "../context/ProductsContext";

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
  const [errorMsg, setErrorMsg] = useState("");

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
              {mode === "add" ? "Create New Division" : `Edit Division: ${initialData?.name}`}
            </h3>
            <p className="text-xs text-gray-500">
              Configure industrial vertical pillar for the catalog.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
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
              Division Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Petrochemicals / Advanced Systems / Space"
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
              className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
            >
              <option value="Active">Active (Live in Products Catalog)</option>
              <option value="Inactive">Inactive (Disabled / Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Description / Mission Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of the equipment domain, operational readiness, and systems..."
              className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
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
              {mode === "add" ? "Create Division" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
