import { useState, useMemo, useRef } from "react";
import {
  Search,
  Download,
  Plane,
  Shield,
  Eye,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Gauge,
  Box,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  UploadCloud,
  Image as ImageIcon,
  Cpu,
  FlaskConical,
} from "lucide-react";
import { useProducts } from "../context/ProductsContext";

const PRESET_IMAGES = {
  Aerospace: [
    { label: "Arrow Tactical UAV", value: "/images/aerospace-products/arrow.png" },
    { label: "Ranger Surveillance Drone", value: "/images/aerospace-products/ranger-drone.png" },
    { label: "AeroViper High-Speed UAV", value: "/images/aerospace-products/aeroviper.png" },
    { label: "SkyBlade Stealth Platform", value: "/images/aerospace-products/skyblade.png" },
    { label: "Vanguard Tactical Radar", value: "/images/aerospace-products/vanguard-radar.png" },
  ],
  Defence: [
    { label: "Abhedya Level III Helmet", value: "/images/2. Defence Page/Abhedya-Level-III-Helmet.png" },
    { label: "Ballistic Helmet NIJ", value: "/images/2. Defence Page/Ballistic-Helmet-NIJ.png" },
    { label: "Vajra Tactical Helmet", value: "/images/2. Defence Page/Vajra-Helmet.png" },
    { label: "Anti-Spike Military Boots", value: "/images/2. Defence Page/Canvas-Jungle-Anti-Spike-Military-Boots.png" },
    { label: "Shock Proof Tactical Gloves", value: "/images/2. Defence Page/Stun-Shock-Proof-Full-Finger-Military-Gloves.png" },
    { label: "Shakti Tactical Armor Jacket", value: "/images/2. Defence Page/Shakti-Tactical-Jacket.png" },
    { label: "Vajra Riot Control Suit", value: "/images/2. Defence Page/Vajra-Riot-Control-Suit.png" },
    { label: "Dandd Stun Baton", value: "/images/2. Defence Page/Dandd-Stun-Baton.png" },
  ],
  "Advanced Systems": [
    { label: "AeroViper Autonomous High-Speed UAV", value: "/images/aerospace-products/aeroviper.png" },
    { label: "Vanguard Sensor Radar", value: "/images/aerospace-products/vanguard-radar.png" },
    { label: "SkyBlade Stealth Frame", value: "/images/aerospace-products/skyblade.png" },
  ],
  Petrochemicals: [
    { label: "Jet Turbine Fuel Standard", value: "/images/aerospace-products/arrow.png" },
    { label: "Shakti Ballistic Polymer Armor", value: "/images/2. Defence Page/Shakti-Tactical-Jacket.png" },
    { label: "Tactical Defense Mechanism Lubricant", value: "/images/2. Defence Page/Dandd-Stun-Baton.png" },
  ],
};

const renderDivisionIcon = (name, className = "w-3.5 h-3.5") => {
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

export default function ProductsPage({
  initialDivision = "Aerospace",
  onNavigateTab,
}) {
  const {
    divisions = [],
    categories = [],
    products = [],
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    resetCatalog,
  } = useProducts();

  const [activeDivision, setActiveDivision] = useState(initialDivision);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Active' | 'Inactive'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Side Drawer & Modals state
  const [showAddDrawer, setShowAddDrawer] = useState(false); // Add Sidebar Drawer
  const [productToEdit, setProductToEdit] = useState(null); // Edit Sidebar Drawer
  const [selectedProduct, setSelectedProduct] = useState(null); // Inspect Modal
  const [productToDelete, setProductToDelete] = useState(null); // Delete Confirm Modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Toast notice
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const ITEMS_PER_PAGE = 10;

  // Active division products from dynamic products
  const currentProducts = useMemo(() => {
    return products.filter((p) => p.division === activeDivision);
  }, [products, activeDivision]);

  // Active categories definition dynamically from context
  const currentCategoryDefinitions = useMemo(() => {
    return categories.filter((c) => c.division === activeDivision);
  }, [categories, activeDivision]);

  // Compute live product counts per category in this division
  const categoryCounts = useMemo(() => {
    const counts = {};
    currentProducts.forEach((p) => {
      const catId = p.categoryId;
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [currentProducts]);

  // Compute status counts for active division
  const activeCount = useMemo(
    () => currentProducts.filter((p) => p.status !== "Inactive").length,
    [currentProducts]
  );
  const inactiveCount = useMemo(
    () => currentProducts.filter((p) => p.status === "Inactive").length,
    [currentProducts]
  );

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return currentProducts.filter((p) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "all" || p.categoryId === selectedCategory;

      // Status filter
      const pStatus = p.status || "Active";
      const matchesStatus =
        statusFilter === "all" ||
        pStatus.toLowerCase() === statusFilter.toLowerCase();

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.categoryTitle && p.categoryTitle.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [currentProducts, selectedCategory, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleDivisionChange = (newDivision) => {
    setActiveDivision(newDivision);
    setSelectedCategory("all");
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
    if (onNavigateTab) {
      const slug =
        newDivision === "Aerospace"
          ? "products-aerospace"
          : newDivision === "Defence"
          ? "products-defence"
          : `products-${newDivision.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      onNavigateTab(slug);
    }
  };

  const handleToggleStatus = async (p) => {
    const newStatus = p.status === "Inactive" ? "Active" : "Inactive";
    try {
      await toggleProductStatus(p.id || p._id);
      triggerToast(`"${p.name}" status changed to ${newStatus}.`);
      if (selectedProduct && (selectedProduct.id === p.id || selectedProduct._id === p._id)) {
        setSelectedProduct((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      triggerToast(err.message || "Failed to update product status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id || productToDelete._id);
      triggerToast(`"${productToDelete.name}" was successfully deleted.`);
      if (selectedProduct && (selectedProduct.id === productToDelete.id || selectedProduct._id === productToDelete._id)) {
        setSelectedProduct(null);
      }
    } catch (err) {
      triggerToast(err.message || "Failed to delete product.");
    } finally {
      setProductToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const headers =
      "Product ID,Name,Division,Category,Status,Description,Image\n";
    const rows = filteredProducts
      .map(
        (p) =>
          `"${p.id}","${p.name.replace(/"/g, '""')}","${p.division}","${
            p.categoryTitle || p.categoryName || ""
          }","${p.status || "Active"}","${(p.description || "").replace(
            /"/g,
            '""'
          )}","${p.imageSrc}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `SkyWardens_${activeDivision}_Products_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`${activeDivision} products exported to CSV.`);
  };

  const extractSpecGrid = (product) => {
    if (!product?.details) return [];
    const gridSection = product.details.find((d) => d.type === "spec-grid");
    return gridSection?.items || [];
  };

  const extractOverviewText = (product) => {
    if (!product?.details) return product.description;
    const textSection = product.details.find((d) => d.type === "text");
    return textSection?.body || product.description;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1c232f] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <span>Catalog Management</span>
            <span>/</span>
            <span className="font-bold text-[#105784]">
              {activeDivision} Products
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1c232f]">
            Products Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage equipment across all divisions, upload imagery, and toggle
            active/inactive status.
          </p>
        </div>

        {/* Division Switch & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic Division Switch Pills from Master */}
          {divisions.length > 0 && (
            <div className="bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-2xs flex items-center gap-1 overflow-x-auto max-w-full">
              {divisions.map((div, divIdx) => {
                const isSelected = activeDivision === div.name;
                const count = products.filter((p) => p.division === div.name).length;

                return (
                  <button
                    key={div.id || div._id || div.slug || div.name || `div-${divIdx}`}
                    onClick={() => handleDivisionChange(div.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-[#105784] text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {renderDivisionIcon(div.name, "w-3.5 h-3.5")}
                    <span>{div.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Add Product Button (Opens Right Sidebar Drawer) */}
          <button
            onClick={() => setShowAddDrawer(true)}
            className="px-3.5 py-2 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-[#ced4da] text-xs font-semibold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Export Products to CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Reset to Default Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 border border-[#ced4da] rounded-xl shadow-2xs transition cursor-pointer"
            title="Reset Catalog to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total in Division */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-[#105784]">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total {activeDivision}
          </span>
          <div className="text-2xl font-bold text-[#1c232f] mt-1">
            {currentProducts.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Total catalog items</div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Active Status
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {activeCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Live & operational
          </div>
        </div>

        {/* Inactive Products */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Inactive Status
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {inactiveCount}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Disabled / Archived
          </div>
        </div>

        {/* Categories Count */}
        <div className="bg-white rounded-xl p-4 border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] border-l-4 border-l-sky-500">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Categories
          </span>
          <div className="text-2xl font-bold text-sky-700 mt-1">
            {currentCategoryDefinitions.length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Product lines & series
          </div>
        </div>
      </div>

      {/* Main Filter & Category Bar */}
      <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] p-4 sm:p-5 space-y-4">
        {/* Category Pills Slider */}
        <div>
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#105784]" />
              <span>Select Category / Line:</span>
            </div>
            <span className="text-[11px] text-gray-400">
              Showing {filteredProducts.length} of {currentProducts.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "all"
                  ? "bg-[#105784] text-white shadow-2xs"
                  : "bg-[#f4f7fa] text-gray-700 hover:bg-gray-100 border border-[#e2e8f0]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All {activeDivision}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {currentProducts.length}
              </span>
            </button>

            {currentCategoryDefinitions.map((cat, catIdx) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id || cat._id || cat.name || `cat-${catIdx}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#105784] text-white font-bold shadow-2xs"
                      : "bg-[#f4f7fa] text-gray-700 hover:bg-gray-100 border border-[#e2e8f0]"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input, Status Filter & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f4f8]">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search ${activeDivision.toLowerCase()} by name, specs, or ID...`}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#f4f7fa] p-1 rounded-lg border border-[#e2e8f0]">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => {
                  setStatusFilter("Active");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
                  statusFilter === "Active"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span>Active ({activeCount})</span>
              </button>
              <button
                onClick={() => {
                  setStatusFilter("Inactive");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-semibold transition cursor-pointer ${
                  statusFilter === "Inactive"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                <span>Inactive ({inactiveCount})</span>
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="bg-[#f4f7fa] p-1 rounded-lg border border-[#e2e8f0] flex items-center">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#105784] shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-[#105784] shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Display: Grid or Table View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e9ecef] p-12 text-center shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Box className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">
            No {activeDivision} Products Found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            No products match the selected filters or search query. You can reset
            filters or create a new product.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="px-3.5 py-1.5 bg-[#105784] text-white text-xs font-semibold rounded-lg hover:bg-[#0c476c] transition cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setShowAddDrawer(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedProducts.map((product, pIdx) => {
              const specItems = extractSpecGrid(product);
              const isInactive = product.status === "Inactive";

              return (
                <div
                  key={product.id || product._id || `product-grid-${pIdx}`}
                  className={`bg-white rounded-xl border shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] hover:shadow-md transition-all flex flex-col overflow-hidden group ${
                    isInactive
                      ? "border-amber-200 bg-amber-50/20 opacity-90"
                      : "border-[#e9ecef]"
                  }`}
                >
                  {/* Product Image Box */}
                  <div className="relative aspect-4/3 bg-[#f8fafc] border-b border-[#eaedf1] overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={product.imageSrc}
                      alt={product.imageAlt || product.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                      className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                        isInactive ? "grayscale-50" : ""
                      }`}
                    />
                    {/* Fallback placeholder */}
                    <div
                      style={{ display: "none" }}
                      className="w-full h-full items-center justify-center bg-gray-100 text-gray-400"
                    >
                      {renderDivisionIcon(product.division, "w-10 h-10 text-gray-300")}
                    </div>

                    {/* Status Badge Top Left */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(product);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs transition flex items-center gap-1 cursor-pointer ${
                          isInactive
                            ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                        title="Click to toggle Active / Inactive status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isInactive ? "bg-amber-500" : "bg-white"
                          }`}
                        ></span>
                        <span>{product.status || "Active"}</span>
                      </button>
                    </div>

                    {/* Category Tag Top Right */}
                    <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-[#1c232f] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs border border-gray-200">
                      {product.categoryTitle || product.categoryName}
                    </span>
                  </div>

                  {/* Product Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-sm text-[#1c232f] group-hover:text-[#105784] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    {/* Quick Specs Preview */}
                    {specItems.length > 0 && (
                      <div className="pt-2 border-t border-[#f1f4f8] grid grid-cols-2 gap-2 text-[11px]">
                        {specItems.slice(0, 2).map((item, idx) => (
                          <div
                            key={`${product.id || product._id || 'item'}-spec-${idx}`}
                            className="bg-[#f8fafc] p-1.5 rounded border border-[#edf2f7]"
                          >
                            <span className="text-[10px] text-gray-400 block truncate">
                              {item.label}
                            </span>
                            <span className="font-bold text-gray-800 block truncate">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-[#f1f4f8] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 truncate max-w-[80px]">
                        #{product.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-1.5 text-[#105784] hover:bg-[#105784]/10 rounded border border-[#105784]/30 transition cursor-pointer"
                          title="Inspect Technical Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToEdit(product)}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded border border-sky-300 transition cursor-pointer"
                          title="Edit in Side Drawer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-300 transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-3">
            <div>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredProducts.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(endIndex, filteredProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {filteredProducts.length}
              </span>{" "}
              {activeDivision.toLowerCase()} products
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 self-center sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
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
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-[#e9ecef] shadow-[0_2px_6px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-b border-[#eaedf1]">
                <tr>
                  <th className="py-3 px-4">Thumb</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Key Specs</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f4f8]">
                {paginatedProducts.map((product, pIdx) => {
                  const specItems = extractSpecGrid(product);
                  const isInactive = product.status === "Inactive";

                  return (
                    <tr
                      key={product.id || product._id || `product-tbl-${pIdx}`}
                      className={`hover:bg-[#f8fafc] transition-colors ${
                        isInactive ? "bg-amber-50/10" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={product.imageSrc}
                            alt={product.name}
                            className={`max-h-full max-w-full object-contain ${
                              isInactive ? "grayscale-50" : ""
                            }`}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1c232f]">
                        <div>{product.name}</div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          #{product.id}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          {product.categoryTitle || product.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                            isInactive
                              ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isInactive ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          ></span>
                          <span>{product.status || "Active"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {specItems.length > 0 ? (
                          <div className="text-[11px] text-gray-600 space-y-0.5">
                            {specItems.slice(0, 2).map((s, idx) => (
                              <div key={`${product.id || product._id || 'tbl'}-spec-${idx}`} className="whitespace-nowrap">
                                <span className="text-gray-400">
                                  {s.label}:{" "}
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {s.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                        {product.description}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-1.5 text-[#105784] hover:bg-[#105784]/10 rounded border border-[#105784]/30 transition cursor-pointer"
                            title="Inspect Specs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToEdit(product)}
                            className="p-1.5 text-sky-700 hover:bg-sky-50 rounded border border-sky-300 transition cursor-pointer"
                            title="Edit in Side Drawer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-300 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. INSPECT PRODUCT MODAL                                      */}
      {/* ============================================================ */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-gray-200 relative max-h-[90vh] overflow-y-auto space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#105784]">
                    #{selectedProduct.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    {selectedProduct.division}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                    {selectedProduct.categoryTitle ||
                      selectedProduct.categoryName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      selectedProduct.status === "Inactive"
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border-emerald-300"
                    }`}
                  >
                    ● {selectedProduct.status || "Active"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1c232f] mt-1">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Box */}
            <div className="aspect-16/9 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] p-4 flex items-center justify-center overflow-hidden">
              <img
                src={selectedProduct.imageSrc}
                alt={selectedProduct.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Overview & Mission Capability
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                {extractOverviewText(selectedProduct)}
              </p>
            </div>

            {/* Specifications Grid */}
            {extractSpecGrid(selectedProduct).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#105784]" />
                  <span>Technical Specifications</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {extractSpecGrid(selectedProduct).map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs"
                    >
                      <span className="text-[10px] text-gray-400 font-medium block truncate">
                        {spec.label}
                      </span>
                      <span className="text-xs font-bold text-[#1c232f] mt-0.5 block truncate">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleStatus(selectedProduct);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition cursor-pointer"
                >
                  Toggle to{" "}
                  {selectedProduct.status === "Inactive"
                    ? "Active"
                    : "Inactive"}
                </button>
                <button
                  onClick={() => {
                    setProductToEdit(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit in Side Drawer</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. ADD PRODUCT SLIDE-OVER SIDEBAR DRAWER                       */}
      {/* ============================================================ */}
      {showAddDrawer && (
        <ProductFormDrawer
          mode="add"
          divisions={divisions}
          allCategories={categories}
          defaultDivision={activeDivision}
          onClose={() => setShowAddDrawer(false)}
          onSubmit={async (newProductData) => {
            try {
              const added = await addProduct(newProductData);
              triggerToast(`Product "${added.name}" added successfully!`);
              setShowAddDrawer(false);
            } catch (err) {
              triggerToast(err.message || "Failed to create product.");
            }
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 3. EDIT PRODUCT SLIDE-OVER SIDEBAR DRAWER                      */}
      {/* ============================================================ */}
      {productToEdit && (
        <ProductFormDrawer
          mode="edit"
          initialData={productToEdit}
          divisions={divisions}
          allCategories={categories}
          defaultDivision={productToEdit.division}
          onClose={() => setProductToEdit(null)}
          onSubmit={async (updatedData) => {
            try {
              await updateProduct(productToEdit.id || productToEdit._id, updatedData);
              triggerToast(`Product "${updatedData.name}" updated successfully!`);
              setProductToEdit(null);
            } catch (err) {
              triggerToast(err.message || "Failed to update product.");
            }
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 4. DELETE CONFIRMATION MODAL                                  */}
      {/* ============================================================ */}
      {productToDelete && (
        <div
          onClick={() => setProductToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 relative space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Delete Product
                </h3>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center shrink-0">
                <img
                  src={productToDelete.imageSrc}
                  alt={productToDelete.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-gray-900 truncate">
                  {productToDelete.name}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {productToDelete.division} •{" "}
                  {productToDelete.categoryTitle || productToDelete.categoryName}
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  #{productToDelete.id}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong>{productToDelete.name}</strong> from the catalog?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. RESET CATALOG CONFIRM MODAL                                */}
      {/* ============================================================ */}
      {showResetConfirm && (
        <div
          onClick={() => setShowResetConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 relative space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Reset Catalog to Default
                </h3>
                <p className="text-xs text-gray-500">
                  Restore original industrial divisions and product catalog.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This will restore all default Aerospace, Defence, Advanced Systems,
              and Petrochemicals products and reset custom edits.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetCatalog();
                  triggerToast("Catalog restored to factory defaults.");
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#105784] hover:bg-[#0c476c] text-white rounded-lg shadow-2xs transition cursor-pointer"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// REUSABLE PRODUCT SLIDE-OVER SIDEBAR DRAWER (Add / Edit + Image Upload)
// ======================================================================
function ProductFormDrawer({
  mode = "add",
  initialData = null,
  divisions = [],
  allCategories = [],
  defaultDivision = "Aerospace",
  onClose,
  onSubmit,
}) {
  const [division, setDivision] = useState(
    initialData?.division || defaultDivision
  );

  const availableCategories = useMemo(() => {
    return allCategories.filter((c) => c.division === division);
  }, [allCategories, division]);

  const [categoryName, setCategoryName] = useState(
    initialData?.categoryTitle ||
      initialData?.categoryName ||
      availableCategories[0]?.name ||
      "Tactical Systems"
  );

  const [name, setName] = useState(initialData?.name || "");
  const [id, setId] = useState(initialData?.id || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [imageSrc, setImageSrc] = useState(
    initialData?.imageSrc || PRESET_IMAGES[division]?.[0]?.value || "/images/aerospace-products/arrow.png"
  );
  const [imageFileName, setImageFileName] = useState("");
  const [imageSourceMode, setImageSourceMode] = useState("upload"); // 'upload' | 'preset' | 'url'
  const [status, setStatus] = useState(initialData?.status || "Active");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Dynamic Specifications key-value pairs (blank by default as requested)
  const initialSpecs = useMemo(() => {
    if (initialData?.details) {
      const grid = initialData.details.find((d) => d.type === "spec-grid");
      if (grid?.items?.length) {
        return grid.items.map((it) => ({ label: it.label, value: it.value }));
      }
    }
    return [];
  }, [initialData]);

  const [specs, setSpecs] = useState(initialSpecs);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDivisionToggle = (newDiv) => {
    setDivision(newDiv);
    const newCats = allCategories.filter((c) => c.division === newDiv);
    if (newCats.length > 0) {
      setCategoryName(newCats[0]?.name || `${newDiv} Equipment`);
    } else {
      setCategoryName(`${newDiv} Systems`);
    }
    if (mode === "add" && imageSourceMode === "preset") {
      setImageSrc(PRESET_IMAGES[newDiv]?.[0]?.value || "/images/aerospace-products/arrow.png");
    }
  };

  // Image File Upload Handlers
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WEBP, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit. Please upload a smaller image.");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result); // Base64 data URL
      setImageFileName(file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageSrc("");
    setImageFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Specifications Handlers
  const handleAddSpecRow = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleRemoveSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }

    const cleanCatName = categoryName.trim() || `${division} Systems`;
    const cleanCatId = cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const validSpecs = specs.filter(
      (s) => s.label.trim() !== "" && s.value.trim() !== ""
    );

    const productPayload = {
      id: id.trim() || undefined,
      name: name.trim(),
      description: description.trim() || `${name} engineered for tactical defence readiness.`,
      imageSrc:
        imageSrc.trim() ||
        (division === "Aerospace"
          ? "/images/aerospace-products/arrow.png"
          : "/images/2. Defence Page/Abhedya-Level-III-Helmet.png"),
      imageAlt: name.trim(),
      division,
      categoryId: cleanCatId,
      categoryTitle: cleanCatName,
      categoryName: cleanCatName,
      status,
      details: [
        {
          type: "spec-grid",
          items: validSpecs,
        },
        {
          type: "text",
          title: "Overview",
          body: description.trim() || `${name} tactical specification profile.`,
        },
      ],
    };

    onSubmit(productPayload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
      />

      {/* Slide-Over Right Sidebar Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-screen max-w-xl sm:max-w-2xl bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-slideInRight pointer-events-auto"
        >
          {/* Drawer Top Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-[#fbfcfd] flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#105784] text-white">
                  {division}
                </span>
                <h3 className="text-base font-bold text-[#1c232f]">
                  {mode === "add" ? "Add New Product" : `Edit Product: ${initialData?.name}`}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure equipment details, upload product imagery, and set specifications.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-lg flex items-center gap-2 shrink-0">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drawer Scrollable Form Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs"
          >
            {/* 1. Dynamic Division Selector */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Division *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {divisions.map((d, dIdx) => (
                  <button
                    key={d.id || d._id || d.slug || d.name || `d-${dIdx}`}
                    type="button"
                    onClick={() => handleDivisionToggle(d.name)}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs ${
                      division === d.name
                        ? "bg-[#105784] text-white border-[#105784] shadow-2xs"
                        : "bg-[#f8fafc] text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {renderDivisionIcon(d.name, "w-3.5 h-3.5")}
                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Product Name & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Garuda UAV / Vajra Armor"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Product ID / SKU Slug
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white font-mono text-xs transition"
                />
              </div>
            </div>

            {/* 3. Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category / Sub-Line *
                </label>
                <input
                  type="text"
                  list="drawer-category-suggestions"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. UAV Systems / Ballistic Protection"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                />
                <datalist id="drawer-category-suggestions">
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Operational Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                >
                  <option value="Active">Active (Operational & Live)</option>
                  <option value="Inactive">Inactive (Disabled / Archived)</option>
                </select>
              </div>
            </div>

            {/* 4. REAL IMAGE UPLOAD SYSTEM */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#105784]" />
                  <span>Product Image / Photo *</span>
                </label>
                {/* Image Mode Switcher */}
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("upload")}
                    className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                      imageSourceMode === "upload"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("preset")}
                    className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                      imageSourceMode === "preset"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Website Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("url")}
                    className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                      imageSourceMode === "url"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Direct URL
                  </button>
                </div>
              </div>

              {/* Mode A: Real File Upload Dropzone */}
              {imageSourceMode === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {imageSrc && !imageSrc.startsWith("/images") ? (
                    /* Uploaded Image Preview */
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-16 bg-white rounded-lg border border-emerald-300 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                          <img
                            src={imageSrc}
                            alt="Uploaded Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Image Uploaded
                          </span>
                          <p className="text-xs font-semibold text-gray-800 truncate mt-1">
                            {imageFileName || "Custom Uploaded Image"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Ready to save with product
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Drag & Drop Upload Dropzone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group ${
                        isDragging
                          ? "border-[#105784] bg-sky-50/50 scale-[0.99]"
                          : "border-gray-300 bg-[#f8fafc] hover:border-[#105784] hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-gray-200 flex items-center justify-center text-[#105784] group-hover:scale-110 transition-transform mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-gray-800">
                        Click to upload image, or drag & drop here
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Supports PNG, JPG, WEBP, SVG (up to 10MB)
                      </p>
                      <button
                        type="button"
                        className="mt-3 px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs group-hover:bg-[#105784] group-hover:text-white group-hover:border-[#105784] transition"
                      >
                        Browse Image File
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: Presets Picker */}
              {imageSourceMode === "preset" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-200">
                    {(PRESET_IMAGES[division] || PRESET_IMAGES.Aerospace)?.map((preset, pIdx) => {
                      const isSelected = imageSrc === preset.value;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setImageSrc(preset.value);
                            setImageFileName(preset.label);
                          }}
                          className={`p-2 rounded-lg border text-left transition flex flex-col items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-white border-[#105784] ring-2 ring-[#105784]/20 shadow-2xs"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-12 h-12 flex items-center justify-center p-1">
                            <img
                              src={preset.value}
                              alt={preset.label}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-700 text-center truncate w-full">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode C: Direct URL Input */}
              {imageSourceMode === "url" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={imageSrc}
                    onChange={(e) => setImageSrc(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
                  />
                  {imageSrc && (
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={imageSrc}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 font-mono truncate">
                        {imageSrc}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Description / Overview */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Description & Mission Role
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tactical overview, mission capability, and field deployment parameters..."
                className="w-full px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-lg focus:outline-none focus:border-[#105784] focus:bg-white text-xs transition"
              />
            </div>

            {/* 6. Dynamic Technical Specifications (blank by default) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Technical Specifications
                  </label>
                  <p className="text-[10px] text-gray-400">
                    Add custom parameter key-value pairs (e.g. Weight, Range, Speed)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="px-2.5 py-1 text-xs font-bold text-[#105784] bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Spec</span>
                </button>
              </div>

              {specs.length === 0 ? (
                <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-xs">
                  No technical specifications added yet. Click &quot;+ Add Spec&quot; to add custom parameters.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) =>
                          handleSpecChange(index, "label", e.target.value)
                        }
                        placeholder="Spec Name (e.g. Weight)"
                        className="flex-1 px-3 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-md focus:outline-none focus:bg-white text-xs"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecChange(index, "value", e.target.value)
                        }
                        placeholder="Value (e.g. 15 kg)"
                        className="flex-1 px-3 py-1.5 bg-[#f8fafc] border border-gray-200 rounded-md focus:outline-none focus:bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Remove spec"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white py-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#105784] hover:bg-[#0c476c] rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1.5"
              >
                {mode === "add" ? (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Product</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
