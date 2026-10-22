import { useState, useMemo, useRef } from "react";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Gauge,
  SlidersHorizontal,
  List,
  FileText,
  Sparkles,
  Eye,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  AEROSPACE_CATEGORIES,
  AEROSPACE_CATEGORY_TEMPLATES,
  DEFENCE_CATEGORIES,
  DEFENCE_CATEGORY_TEMPLATES,
  PRESET_IMAGES,
  SUGGESTED_SPECS,
} from "./aerospaceTemplates";

export default function ProductFormDrawer({
  mode = "add",
  initialData = null,
  divisions = [],
  allCategories = [],
  defaultDivision = "Aerospace",
  lockedDivision = null,
  onClose,
  onSubmit,
}) {
  const division = lockedDivision || initialData?.division || defaultDivision;

  // Active categories for this division
  const availableCategories = useMemo(() => {
    const fromProps = allCategories.filter((c) => c.division === division);
    if (fromProps.length > 0) return fromProps;
    if (division === "Aerospace") return AEROSPACE_CATEGORIES;
    if (division === "Defence") return DEFENCE_CATEGORIES;
    return [];
  }, [allCategories, division]);

  const [categoryName, setCategoryName] = useState(() => {
    const raw = initialData?.categoryTitle || initialData?.categoryName || "";
    const cleanName = raw.replace(/^[0-9]+\.\s*/, "").trim();
    if (cleanName) {
      const match = availableCategories.find(
        (c) =>
          c.name.toLowerCase() === cleanName.toLowerCase() ||
          c.name.toLowerCase() === raw.toLowerCase()
      );
      if (match) return match.name;
      return cleanName;
    }
    if (initialData?.categoryId) {
      const cleanId = initialData.categoryId.replace(/^[0-9]+-/, "");
      const match = availableCategories.find(
        (c) => c.id === initialData.categoryId || c.id === cleanId
      );
      if (match) return match.name;
    }
    return "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef(null);

  const [name, setName] = useState(initialData?.name || "");
  const [id, setId] = useState(initialData?.id || "");
  const [status, setStatus] = useState(initialData?.status || "Active");

  // Overview / Card summary description
  const initialOverview = useMemo(() => {
    if (initialData?.details) {
      const textSec = initialData.details.find((d) => d.type === "text");
      if (textSec?.body) return textSec.body;
    }
    return initialData?.description || "";
  }, [initialData]);

  const [description, setDescription] = useState(initialOverview);

  // Image state
  const [imageSrc, setImageSrc] = useState(initialData?.imageSrc || "");
  const [imageFileName, setImageFileName] = useState("");
  const [imageSourceMode, setImageSourceMode] = useState("upload"); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Active Drawer Mode: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState("editor");

  // Dynamic Modular Dossier Sections
  const [sections, setSections] = useState(() => {
    if (
      initialData?.details &&
      Array.isArray(initialData.details) &&
      initialData.details.length > 0
    ) {
      return initialData.details.map((sec, idx) => ({
        ...sec,
        _id: `sec-${idx}-${Date.now()}`,
        items: Array.isArray(sec.items)
          ? sec.items.map((it) =>
              typeof it === "string" ? { label: "", value: it } : it
            )
          : [],
        rows: Array.isArray(sec.rows) ? [...sec.rows] : [],
      }));
    }
    return [];
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [templateLoadedNotice, setTemplateLoadedNotice] = useState(null);

  // Handle Slug ID Generation (Auto-filled from Product Name)
  const handleNameChange = (val) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setId(generatedSlug);
  };

  // Image Upload Handlers
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WEBP, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit.");
      return;
    }
    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Smart Template Loader
  const handleLoadTemplate = (templateKey) => {
    const registry =
      division === "Defence"
        ? DEFENCE_CATEGORY_TEMPLATES
        : AEROSPACE_CATEGORY_TEMPLATES;
    const template = registry[templateKey];
    if (!template) return;

    if (template.description && !description) {
      setDescription(template.description);
    }

    const templateSections = template.sections.map((s, idx) => ({
      ...s,
      _id: `tpl-${idx}-${Date.now()}`,
      items: Array.isArray(s.items)
        ? s.items.map((it) =>
            typeof it === "string" ? { label: "", value: it } : it
          )
        : [],
      rows: Array.isArray(s.rows) ? [...s.rows] : [],
    }));

    setSections(templateSections);
    setTemplateLoadedNotice(
      `Specifications & ${templateSections.length} technical sections applied!`
    );
    setTimeout(() => setTemplateLoadedNotice(null), 5000);
  };

  // ==========================================
  // MODULAR SECTION BUILDER ACTIONS
  // ==========================================
  const handleAddSpecGridSection = () => {
    const defaultItems =
      division === "Defence"
        ? [
            { label: "Protection Level", value: "" },
            { label: "Shell Material", value: "" },
            { label: "Total Weight", value: "" },
          ]
        : [
            { label: "Take off weight", value: "" },
            { label: "Flight Time", value: "" },
            { label: "Payload capacity", value: "" },
          ];

    setSections((prev) => [
      ...prev,
      {
        _id: `sec-grid-${Date.now()}`,
        type: "spec-grid",
        title: "Key Specifications",
        items: defaultItems,
      },
    ]);
  };

  const handleAddTableSection = () => {
    const defaultRows =
      division === "Defence"
        ? [
            { label: "Testing Standard", value: "" },
            { label: "Ballistic Protection", value: "" },
          ]
        : [
            { label: "Propulsion", value: "" },
            { label: "Operating Temperature", value: "" },
          ];

    setSections((prev) => [
      ...prev,
      {
        _id: `sec-table-${Date.now()}`,
        type: "table",
        title: "Technical Specifications",
        rows: defaultRows,
      },
    ]);
  };

  const handleAddListSection = (defaultTitle = "Features & Capabilities") => {
    setSections((prev) => [
      ...prev,
      {
        _id: `sec-list-${Date.now()}`,
        type: "list",
        title: defaultTitle,
        items: [{ label: "", value: "" }],
      },
    ]);
  };

  const handleAddTextSection = () => {
    setSections((prev) => [
      ...prev,
      {
        _id: `sec-text-${Date.now()}`,
        type: "text",
        title: "Mission Overview",
        body: "",
      },
    ]);
  };

  const handleMoveSection = (index, direction) => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setSections(updated);
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionTitleChange = (index, newTitle) => {
    const updated = [...sections];
    updated[index].title = newTitle;
    setSections(updated);
  };

  // Spec Grid Item Handlers
  const handleAddSpecItem = (secIdx) => {
    const updated = [...sections];
    updated[secIdx].items = [...(updated[secIdx].items || []), { label: "", value: "" }];
    setSections(updated);
  };

  const handleSpecItemChange = (secIdx, itIdx, field, val) => {
    const updated = [...sections];
    updated[secIdx].items[itIdx][field] = val;
    setSections(updated);
  };

  const handleRemoveSpecItem = (secIdx, itIdx) => {
    const updated = [...sections];
    updated[secIdx].items = updated[secIdx].items.filter((_, i) => i !== itIdx);
    setSections(updated);
  };

  // Table Row Handlers
  const handleAddTableRow = (secIdx) => {
    const updated = [...sections];
    updated[secIdx].rows = [...(updated[secIdx].rows || []), { label: "", value: "" }];
    setSections(updated);
  };

  const handleTableRowChange = (secIdx, rIdx, field, val) => {
    const updated = [...sections];
    updated[secIdx].rows[rIdx][field] = val;
    setSections(updated);
  };

  const handleRemoveTableRow = (secIdx, rIdx) => {
    const updated = [...sections];
    updated[secIdx].rows = updated[secIdx].rows.filter((_, i) => i !== rIdx);
    setSections(updated);
  };

  // List Item Handlers
  const handleAddListItem = (secIdx) => {
    const updated = [...sections];
    updated[secIdx].items = [...(updated[secIdx].items || []), { label: "", value: "" }];
    setSections(updated);
  };

  const handleListItemChange = (secIdx, itIdx, val) => {
    const updated = [...sections];
    updated[secIdx].items[itIdx] = { label: "", value: val };
    setSections(updated);
  };

  const handleRemoveListItem = (secIdx, itIdx) => {
    const updated = [...sections];
    updated[secIdx].items = updated[secIdx].items.filter((_, i) => i !== itIdx);
    setSections(updated);
  };

  // Text Body Handler
  const handleTextBodyChange = (secIdx, val) => {
    const updated = [...sections];
    updated[secIdx].body = val;
    setSections(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!categoryName.trim()) {
      setErrorMsg("Please select a category.");
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const cleanRawCat = categoryName.replace(/^[0-9]+\.\s*/, "").trim();
    const matchedCategory = availableCategories.find(
      (c) =>
        c.name.toLowerCase() === cleanRawCat.toLowerCase() ||
        c.name.toLowerCase() === categoryName.toLowerCase() ||
        c.id === cleanRawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
        c.id === categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    );

    const cleanCatName = matchedCategory ? matchedCategory.name : cleanRawCat;
    const cleanCatId = matchedCategory
      ? matchedCategory.id
      : cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Clean payload details
    const payloadDetails = [];

    // If description provided and no text block at top, add overview
    if (description.trim()) {
      payloadDetails.push({
        type: "text",
        title: "Overview",
        body: description.trim(),
      });
    }

    sections.forEach((sec) => {
      if (sec.type === "spec-grid") {
        const validItems = (sec.items || []).filter(
          (it) => it.label?.trim() !== "" && it.value?.trim() !== ""
        );
        if (validItems.length > 0) {
          payloadDetails.push({
            type: "spec-grid",
            title: sec.title || "Key Specifications",
            items: validItems.map((it) => ({
              label: it.label.trim(),
              value: it.value.trim(),
            })),
          });
        }
      } else if (sec.type === "table") {
        const validRows = (sec.rows || []).filter(
          (r) => r.label?.trim() !== "" && r.value?.trim() !== ""
        );
        if (validRows.length > 0) {
          payloadDetails.push({
            type: "table",
            title: sec.title || "Technical Specifications",
            rows: validRows.map((r) => ({
              label: r.label.trim(),
              value: r.value.trim(),
            })),
          });
        }
      } else if (sec.type === "list") {
        const validItems = (sec.items || [])
          .map((it) => (typeof it === "string" ? it.trim() : it.value?.trim() || ""))
          .filter((it) => it.length > 0);
        if (validItems.length > 0) {
          payloadDetails.push({
            type: "list",
            title: sec.title || "Features",
            items: validItems,
          });
        }
      } else if (sec.type === "text") {
        if (sec.body?.trim() && sec.title !== "Overview") {
          payloadDetails.push({
            type: "text",
            title: sec.title?.trim() || "Overview",
            body: sec.body.trim(),
          });
        }
      }
    });

    const productPayload = {
      id: id.trim() || undefined,
      name: name.trim(),
      description:
        description.trim() || `${name.trim()} configured for tactical operations.`,
      imageSrc:
        imageSrc.trim() ||
        (division === "Defence"
          ? "/images/2. Defence Page/Abhedya-Level-III-Helmet.png"
          : "/images/aerospace-products/arrow.png"),
      imageAlt: name.trim(),
      division,
      categoryId: cleanCatId,
      categoryTitle: cleanCatName,
      categoryName: cleanCatName,
      status,
      details: payloadDetails,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(productPayload);
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "Failed to update platform.");
    } finally {
      setIsSubmitting(false);
    }
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
          className="w-screen max-w-2xl sm:max-w-3xl bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-slideInRight pointer-events-auto"
        >
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-[#1c232f] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#105784] text-white">
                {division}
              </span>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {mode === "add" ? `New ${division} Product` : `Edit ${name || "Product"}`}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Configure main card profile, upload imagery, and build technical dossier sections.
                </p>
              </div>
            </div>

            {/* View Mode Toggle: Form vs Live Preview */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#252f3e] p-0.5 rounded-lg border border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveTab("editor")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    activeTab === "editor"
                      ? "bg-[#105784] text-white shadow-xs"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Editor Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1 ${
                    activeTab === "preview"
                      ? "bg-[#105784] text-white shadow-xs"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Live Dossier</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer ml-1"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "preview" ? (
              /* LIVE PREVIEW MODE */
              <div className="p-6 space-y-6 bg-[#fbfcfd]">
                <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    This is a live preview of how the technical dossier modal will appear to end-users on the website.
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                  {/* Preview Image & Header */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100">
                    <div className="w-40 h-32 bg-[#161c25] rounded-xl border border-gray-700 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={imageSrc}
                        alt={name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[10px] font-bold text-[#105784] uppercase tracking-wider">
                        {categoryName}
                      </span>
                      <h3 className="text-xl font-bold text-[#1c232f]">
                        {name || "Untitled Platform"}
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md">
                        {description || "No overview description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Sections Preview */}
                  {sections.length > 0 ? (
                    <div className="space-y-5">
                      {sections.map((sec, sIdx) => (
                        <div key={sIdx} className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            {sec.type === "spec-grid" && <Gauge className="w-3.5 h-3.5 text-[#105784]" />}
                            {sec.type === "table" && <SlidersHorizontal className="w-3.5 h-3.5 text-[#105784]" />}
                            {sec.type === "list" && <List className="w-3.5 h-3.5 text-[#105784]" />}
                            {sec.type === "text" && <FileText className="w-3.5 h-3.5 text-[#105784]" />}
                            <span>{sec.title}</span>
                          </h4>

                          {sec.type === "spec-grid" && (
                            <div className="grid grid-cols-2 gap-2">
                              {sec.items?.map((it, itIdx) => (
                                <div key={itIdx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                  <span className="text-[10px] text-gray-400 block truncate">{it.label}</span>
                                  <span className="text-xs font-bold text-gray-800 block truncate">{it.value}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === "table" && (
                            <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                              <table className="w-full text-left">
                                <tbody className="divide-y divide-gray-100">
                                  {sec.rows?.map((r, rIdx) => (
                                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                      <td className="p-2.5 font-medium text-gray-500 w-1/2">{r.label}</td>
                                      <td className="p-2.5 font-bold text-gray-800">{r.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {sec.type === "list" && (
                            <ul className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-200">
                              {sec.items?.map((it, lIdx) => (
                                <li key={lIdx} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#105784] mt-1.5 shrink-0" />
                                  <span>{it.value}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {sec.type === "text" && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
                              {sec.body}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-xs">
                      No dossier sections added yet. Switch to Editor Form to add specifications or tables.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* EDITOR FORM MODE */
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                    {errorMsg}
                  </div>
                )}

                {/* ================================================================ */}
                {/* LEVEL 1: MAIN CARD INFORMATION                                   */}
                {/* ================================================================ */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-xs font-bold text-[#1c232f] uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#105784]" />
                      <span>Level 1: Main Card Profile</span>
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">Catalog Card Level</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Name */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Product Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Arrow Drone"
                        required
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784]"
                      />
                    </div>

                    {/* Slug ID (Auto-filled and Disabled) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-700">
                          Custom ID / Slug
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">
                          (Auto-generated)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={id}
                        readOnly
                        disabled
                        placeholder="Auto-generated from name..."
                        className="w-full text-xs font-mono px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed select-none"
                      />
                    </div>

                      {/* Category Dropdown */}
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">
                          {division} Category <span className="text-rose-500">*</span>
                        </label>
                        {availableCategories.length > 0 ? (
                          <select
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:border-[#105784] bg-white font-medium ${
                              !categoryName
                                ? "text-gray-400 border-gray-300"
                                : "text-gray-800 border-gray-300"
                            }`}
                          >
                            <option value="">-- Select Category --</option>
                            {availableCategories.map((c, idx) => (
                              <option key={c.id || idx} value={c.name} className="text-gray-800">
                                {c.number ? `${c.number}. ` : ""}{c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder={`Enter ${division} category (e.g. Specialty Systems)...`}
                            className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784] bg-white font-medium text-gray-800"
                          />
                        )}
                        {categoryName && (
                          <div className="mt-2.5 p-2.5 bg-gradient-to-br from-sky-50 via-blue-50/40 to-slate-50 border border-sky-200/90 rounded-xl shadow-2xs space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-[#105784] text-white flex items-center justify-center shrink-0 shadow-2xs">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-[#1c232f] block leading-tight">
                                    Auto-Fill {categoryName} Specs
                                  </span>
                                  <span className="text-[10px] text-gray-500 block leading-tight">
                                    Pre-configured technical dossier & ratings
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const clean = categoryName
                                    .replace(/^[0-9]+\.\s*/, "")
                                    .trim()
                                    .toLowerCase();
                                  const matched = availableCategories.find(
                                    (c) =>
                                      c.name.toLowerCase() === clean ||
                                      c.name.toLowerCase() === categoryName.toLowerCase() ||
                                      c.id.toLowerCase() === clean.replace(/[^a-z0-9]+/g, "-") ||
                                      c.id.toLowerCase() ===
                                        categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                                  );
                                  const catSlug = matched
                                    ? matched.id
                                    : clean.replace(/[^a-z0-9]+/g, "-");
                                  handleLoadTemplate(catSlug);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold bg-[#105784] hover:bg-[#0c476c] text-white rounded-md shadow-2xs transition shrink-0 cursor-pointer flex items-center gap-1 active:scale-95"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Load Template</span>
                              </button>
                            </div>

                            <p className="text-[10px] text-gray-500 leading-snug">
                              Loads realistic technical specifications, protection standards, and capability items into <strong>Level 2</strong> below.
                            </p>

                            {templateLoadedNotice && (
                              <div className="pt-1.5 border-t border-sky-200/60 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 animate-fadeIn">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{templateLoadedNotice}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    {/* Status */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Catalog Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784] bg-white font-semibold"
                      >
                        <option value="Active">● Active (Live in Catalog)</option>
                        <option value="Inactive">○ Inactive (Archived)</option>
                      </select>
                    </div>
                  </div>

                  {/* Card Description */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Short Card Summary
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="1-2 lines summarizing platform mission capabilities for the catalog card..."
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784]"
                    />
                  </div>

                  {/* Product Imagery Selector */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 block">
                        Product Imagery <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
                        <button
                          type="button"
                          onClick={() => setImageSourceMode("upload")}
                          className={`px-2.5 py-0.5 text-[11px] rounded font-semibold transition cursor-pointer ${
                            imageSourceMode === "upload"
                              ? "bg-[#105784] text-white shadow-2xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceMode("presets")}
                          className={`px-2.5 py-0.5 text-[11px] rounded font-semibold transition cursor-pointer ${
                            imageSourceMode === "presets"
                              ? "bg-[#105784] text-white shadow-2xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Preset Library
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceMode("url")}
                          className={`px-2.5 py-0.5 text-[11px] rounded font-semibold transition cursor-pointer ${
                            imageSourceMode === "url"
                              ? "bg-[#105784] text-white shadow-2xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => processImageFile(e.target.files?.[0])}
                    />

                    {/* Active Image Preview Card (if image is selected/uploaded) */}
                    {imageSrc ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="w-20 h-16 bg-[#161c25] rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-gray-700/30 overflow-hidden shadow-inner">
                          <img
                            src={imageSrc}
                            alt="Product Preview"
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {imageFileName || imageSrc.split("/").pop() || "Uploaded Platform Image"}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Image attached & ready
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (imageSourceMode === "upload") {
                                  fileInputRef.current?.click();
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
                        {imageSourceMode === "upload" && (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) processImageFile(file);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer ${
                              isDragging
                                ? "border-[#105784] bg-sky-50"
                                : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
                            }`}
                          >
                            <UploadCloud className="w-7 h-7 text-[#105784] mx-auto mb-1.5" />
                            <span className="text-xs font-semibold text-gray-700 block">
                              Click to browse or drag & drop product image
                            </span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              PNG, JPG, WEBP (Transparent background recommended)
                            </span>
                          </div>
                        )}

                        {imageSourceMode === "presets" && (
                          <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/60">
                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                              Select from {division} Library:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                              {(PRESET_IMAGES[division] || PRESET_IMAGES.Aerospace || []).map((preset) => (
                                <button
                                  key={preset.value}
                                  type="button"
                                  onClick={() => {
                                    setImageSrc(preset.value);
                                    setImageFileName(preset.label);
                                  }}
                                  className="p-2 bg-white rounded-lg border border-gray-200 hover:border-[#105784] hover:shadow-xs transition text-left flex flex-col items-center gap-1.5 group cursor-pointer"
                                >
                                  <div className="w-full h-14 bg-[#161c25] rounded p-1 flex items-center justify-center">
                                    <img
                                      src={preset.value}
                                      alt={preset.label}
                                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                                    />
                                  </div>
                                  <span className="text-[10px] font-semibold text-gray-700 text-center line-clamp-1">
                                    {preset.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {imageSourceMode === "url" && (
                          <div className="space-y-1">
                            <input
                              type="url"
                              value={imageSrc}
                              onChange={(e) => setImageSrc(e.target.value)}
                              placeholder="https://example.com/images/product.png"
                              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784]"
                            />
                            <p className="text-[10px] text-gray-400">
                              Direct image link from CDN or server storage.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ================================================================ */}
                {/* LEVEL 2: DYNAMIC MODULAR TECHNICAL DOSSIER BUILDER                */}
                {/* ================================================================ */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#1c232f] uppercase tracking-wider flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#105784]" />
                        <span>Level 2: Technical Dossier Builder</span>
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Add specifications grids, detailed engineering tables, or capability bullet lists.
                      </p>
                    </div>

                    {/* Section Add Toolbar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleAddSpecGridSection}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition cursor-pointer flex items-center gap-1"
                        title="Add Key Specifications Grid"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Specs Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddTableSection}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                        title="Add Multi-row Technical Table"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tech Table</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddListSection("Capabilities")}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
                        title="Add Bullet Points List"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Bullet List</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddTextSection}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                        title="Add Overview Text Block"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Text Block</span>
                      </button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {sections.length === 0 && (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800">
                          No Technical Dossier Sections Added Yet
                        </h4>
                        <p className="text-[11px] text-gray-500 max-w-sm mx-auto mt-1">
                          Click &ldquo;+ Specs Grid&rdquo;, &ldquo;+ Tech Table&rdquo; or use the 1-Click presets above to configure Arrow, FPV, or Strike drone dossiers.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sections List */}
                  <div className="space-y-4">
                    {sections.map((sec, sIdx) => (
                      <div
                        key={sec._id || `sec-${sIdx}`}
                        className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs overflow-hidden"
                      >
                        {/* Section Card Top Header Bar */}
                        <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 mr-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                sec.type === "spec-grid"
                                  ? "bg-sky-100 text-sky-800"
                                  : sec.type === "table"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : sec.type === "list"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {sec.type}
                            </span>
                            <input
                              type="text"
                              value={sec.title || ""}
                              onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                              placeholder="Section Heading Title..."
                              className="text-xs font-bold text-[#1c232f] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#105784] focus:outline-none px-1 py-0.5 flex-1"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sIdx, "up")}
                              disabled={sIdx === 0}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sIdx, "down")}
                              disabled={sIdx === sections.length - 1}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(sIdx)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer ml-1"
                              title="Delete Section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Section Card Content Based on Type */}
                        <div className="p-4">
                          {/* 1. SPEC-GRID BUILDER */}
                          {sec.type === "spec-grid" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {(sec.items || []).map((it, itIdx) => (
                                  <div
                                    key={itIdx}
                                    className="flex items-center gap-2 p-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
                                  >
                                    <input
                                      type="text"
                                      value={it.label}
                                      onChange={(e) =>
                                        handleSpecItemChange(sIdx, itIdx, "label", e.target.value)
                                      }
                                      placeholder="Spec Label (e.g. Wingspan)"
                                      className="w-1/2 text-xs px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#105784]"
                                    />
                                    <input
                                      type="text"
                                      value={it.value}
                                      onChange={(e) =>
                                        handleSpecItemChange(sIdx, itIdx, "value", e.target.value)
                                      }
                                      placeholder="Value (e.g. 1700 mm)"
                                      className="w-1/2 text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#105784]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSpecItem(sIdx, itIdx)}
                                      className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddSpecItem(sIdx)}
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Specification Item</span>
                              </button>
                            </div>
                          )}

                          {/* 2. TABLE BUILDER */}
                          {sec.type === "table" && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                {(sec.rows || []).map((row, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="flex items-center gap-2 p-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
                                  >
                                    <input
                                      type="text"
                                      value={row.label}
                                      onChange={(e) =>
                                        handleTableRowChange(sIdx, rIdx, "label", e.target.value)
                                      }
                                      placeholder="Parameter (e.g. Propulsion, Caliber, Motor)"
                                      className="w-1/2 text-xs px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#105784]"
                                    />
                                    <input
                                      type="text"
                                      value={row.value}
                                      onChange={(e) =>
                                        handleTableRowChange(sIdx, rIdx, "value", e.target.value)
                                      }
                                      placeholder="Technical Value (e.g. Brushless DC, 38mm)"
                                      className="w-1/2 text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#105784]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTableRow(sIdx, rIdx)}
                                      className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddTableRow(sIdx)}
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Table Row</span>
                              </button>
                            </div>
                          )}

                          {/* 3. BULLET LIST BUILDER */}
                          {sec.type === "list" && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                {(sec.items || []).map((it, itIdx) => (
                                  <div
                                    key={itIdx}
                                    className="flex items-center gap-2 p-2 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#105784] shrink-0" />
                                    <input
                                      type="text"
                                      value={it.value}
                                      onChange={(e) =>
                                        handleListItemChange(sIdx, itIdx, e.target.value)
                                      }
                                      placeholder="Bullet point item (e.g. Up to 10 units - 7 days delivery time)..."
                                      className="flex-1 text-xs px-2 py-1 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#105784]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveListItem(sIdx, itIdx)}
                                      className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddListItem(sIdx)}
                                className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Bullet Point</span>
                              </button>
                            </div>
                          )}

                          {/* 4. OVERVIEW TEXT BUILDER */}
                          {sec.type === "text" && (
                            <div>
                              <textarea
                                rows={3}
                                value={sec.body || ""}
                                onChange={(e) => handleTextBodyChange(sIdx, e.target.value)}
                                placeholder="Enter detailed operational narrative / platform overview..."
                                className="w-full text-xs p-2.5 bg-[#f8fafc] border border-gray-300 rounded-lg focus:outline-none focus:border-[#105784]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Action Footer */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 bg-[#105784] hover:bg-[#0c476c] text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>
                        {isSubmitting
                          ? "Saving..."
                          : mode === "add"
                          ? "Save New Platform"
                          : "Update Platform"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
