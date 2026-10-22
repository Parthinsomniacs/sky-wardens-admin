import { X, Pencil, Gauge, SlidersHorizontal, List, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ProductDetailInspectModal({
  product,
  onClose,
  onEdit,
  onToggleStatus,
}) {
  if (!product) return null;

  const isInactive = product.status === "Inactive";

  // Normalize details array
  const details = Array.isArray(product.details) ? product.details : [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-[#1c232f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-sky-300 border border-white/10">
              #{product.id || "PLATFORM"}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#105784] text-white">
              {product.division || "Aerospace"}
            </span>
            <span className="text-xs font-semibold text-gray-300 truncate max-w-[200px] sm:max-w-xs">
              {product.categoryTitle || product.categoryName || "Tactical Systems"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isInactive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isInactive ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                }`}
              />
              <span>{product.status || "Active"}</span>
            </span>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer ml-2"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns Layout Matching Frontend Dossier */}
        <div className="overflow-y-auto flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#fbfcfd] custom-scrollbar">
          {/* Left Column: Image & Platform Summary (4 of 12 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-4/3 sm:aspect-square bg-[#161c25] rounded-xl border border-gray-700/60 p-4 flex items-center justify-center overflow-hidden shadow-inner relative group">
              <img
                src={product.imageSrc}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                style={{ display: "none" }}
                className="w-full h-full items-center justify-center text-gray-500 text-xs font-mono"
              >
                [Image Offline]
              </div>
            </div>

            {/* Quick Dossier Card Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Catalog Summary
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description || "Platform dossier configured for tactical aerospace missions."}
              </p>
            </div>
          </div>

          {/* Right Column: Scrollable Dynamic Technical Dossier (7 of 12 cols) */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-[#105784] uppercase tracking-wider block">
                Platform Technical Dossier
              </span>
              <h2 className="text-xl font-bold text-[#1c232f] mt-0.5">
                {product.name}
              </h2>
            </div>

            {/* Dynamic Sections Loop */}
            {details.length > 0 ? (
              <div className="space-y-5">
                {details.map((section, sIdx) => {
                  switch (section.type) {
                    case "text":
                      return (
                        <div key={`sec-text-${sIdx}`} className="space-y-1.5">
                          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#105784]" />
                            <span>{section.title || "Overview"}</span>
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed bg-white p-3.5 rounded-xl border border-[#e2e8f0] shadow-2xs">
                            {section.body}
                          </p>
                        </div>
                      );

                    case "spec-grid":
                      return (
                        <div key={`sec-grid-${sIdx}`} className="space-y-2">
                          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5 text-[#105784]" />
                            <span>{section.title || "Key Specifications"}</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {section.items?.map((item, itIdx) => (
                              <div
                                key={`item-${itIdx}`}
                                className="p-2.5 rounded-lg bg-white border border-[#e2e8f0] shadow-2xs hover:border-[#105784]/40 transition"
                              >
                                <span className="text-[10px] text-gray-400 font-medium block truncate">
                                  {item.label}
                                </span>
                                <span className="text-xs font-bold text-[#1c232f] mt-0.5 block truncate">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );

                    case "table":
                      return (
                        <div key={`sec-table-${sIdx}`} className="space-y-2">
                          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[#105784]" />
                            <span>{section.title || "Technical Specifications"}</span>
                          </h3>
                          <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-2xs text-xs">
                            <table className="w-full text-left">
                              <tbody className="divide-y divide-gray-100">
                                {section.rows?.map((row, rIdx) => (
                                  <tr
                                    key={`row-${rIdx}`}
                                    className={rIdx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}
                                  >
                                    <td className="py-2.5 px-3.5 font-medium text-gray-500 w-1/2">
                                      {row.label}
                                    </td>
                                    <td className="py-2.5 px-3.5 font-bold text-[#1c232f]">
                                      {row.value}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    case "list":
                      return (
                        <div key={`sec-list-${sIdx}`} className="space-y-2">
                          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <List className="w-3.5 h-3.5 text-[#105784]" />
                            <span>{section.title || "Features"}</span>
                          </h3>
                          <ul className="space-y-2 bg-white p-3.5 rounded-xl border border-[#e2e8f0] shadow-2xs">
                            {section.items?.map((itemText, lIdx) => (
                              <li
                                key={`li-${lIdx}`}
                                className="text-xs text-gray-600 flex items-start gap-2.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#105784] mt-1.5 shrink-0" />
                                <span className="leading-relaxed">
                                  {typeof itemText === "string"
                                    ? itemText
                                    : itemText.label || itemText.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  No technical dossier sections configured for this product yet.
                </p>
                <p className="text-[11px] text-gray-400">
                  Click &ldquo;Edit in Side Drawer&rdquo; to add Specifications Grid, Technical Tables, or Feature Lists.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onEdit(product);
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit in Side Drawer</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
