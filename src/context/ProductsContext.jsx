/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { productsApi, divisionsApi } from "../services/api";

export const INITIAL_DIVISIONS = [];
export const INITIAL_CATEGORIES = [];

const ProductsContext = createContext(null);

const normalizeDivision = (d) => ({
  id: d._id || d.id || d.name,
  _id: d._id,
  name: d.name,
  slug: d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""),
  description: d.description || "",
  icon: d.icon || (d.name === "Aerospace" ? "Plane" : d.name === "Defence" ? "Shield" : "Layers"),
  color: d.color || "#105784",
  badgeColor: d.badgeColor || "bg-indigo-600",
  status: d.status || "Active",
  createdAt: d.createdAt,
});

export function ProductsProvider({ children }) {
  const [divisions, setDivisions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live products and divisions from backend API
  const fetchCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedDivisions, fetchedProducts] = await Promise.all([
        divisionsApi.getAll().catch((err) => {
          console.warn("Divisions API load error:", err.message);
          return [];
        }),
        productsApi.getAllAdmin().catch((err) => {
          console.warn("Products API load error:", err.message);
          return [];
        }),
      ]);

      if (Array.isArray(fetchedDivisions) && fetchedDivisions.length > 0) {
        setDivisions(fetchedDivisions.map(normalizeDivision));
      } else {
        setDivisions([]);
      }

      if (Array.isArray(fetchedProducts)) {
        setProducts(fetchedProducts);

        // Derive unique category definitions dynamically
        const catMap = new Map();
        fetchedProducts.forEach((p) => {
          if (p.categoryId && !catMap.has(p.categoryId)) {
            catMap.set(p.categoryId, {
              id: p.categoryId,
              name: p.categoryTitle || p.categoryName || p.categoryId,
              division: p.division,
              tagline: `${p.categoryTitle || p.categoryName || "Tactical"} product series`,
            });
          }
        });
        setCategories(Array.from(catMap.values()));
      } else {
        setProducts([]);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching catalog from backend:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // ==========================================
  // DIVISIONS CRUD (Connected to Backend API)
  // ==========================================
  const addDivision = async (newDiv) => {
    const name = newDiv.name?.trim();
    if (!name) return null;

    try {
      const created = await divisionsApi.create({
        name,
        description: newDiv.description?.trim() || "",
        status: newDiv.status || "Active",
        badgeColor: newDiv.badgeColor || "bg-indigo-600",
      });
      const normalized = normalizeDivision(created);
      setDivisions((prev) => {
        if (prev.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
          return prev;
        }
        return [...prev, normalized];
      });
      return normalized;
    } catch (err) {
      console.error("Failed to add division in backend:", err);
      const local = normalizeDivision(newDiv);
      setDivisions((prev) => [...prev, local]);
      return local;
    }
  };

  const updateDivision = async (id, updatedFields) => {
    try {
      const updated = await divisionsApi.update(id, updatedFields);
      const normalized = normalizeDivision(updated);
      setDivisions((prev) =>
        prev.map((d) =>
          d.id === id || d._id === id || d.name === id ? { ...d, ...normalized } : d
        )
      );

      // Cascade status to all products belonging to this division
      if (updatedFields.status) {
        const targetDiv = divisions.find(
          (d) => d.id === id || d._id === id || d.name === id
        );
        const divName = targetDiv?.name || updatedFields.name;
        if (divName) {
          setProducts((prev) =>
            prev.map((p) =>
              p.division?.toLowerCase() === divName.toLowerCase()
                ? { ...p, status: updatedFields.status }
                : p
            )
          );
        }
      }

      // Cascade division name update if changed
      if (updatedFields.name) {
        const targetDiv = divisions.find(
          (d) => d.id === id || d._id === id || d.name === id
        );
        const oldName = targetDiv?.name;
        if (oldName && oldName.toLowerCase() !== updatedFields.name.toLowerCase()) {
          setProducts((prev) =>
            prev.map((p) =>
              p.division?.toLowerCase() === oldName.toLowerCase()
                ? { ...p, division: updatedFields.name.trim() }
                : p
            )
          );
        }
      }

      return normalized;
    } catch (err) {
      console.error("Failed to update division in backend:", err);
      setDivisions((prev) =>
        prev.map((d) =>
          d.id === id || d._id === id || d.name === id ? { ...d, ...updatedFields } : d
        )
      );

      if (updatedFields.status) {
        const targetDiv = divisions.find(
          (d) => d.id === id || d._id === id || d.name === id
        );
        const divName = targetDiv?.name || updatedFields.name;
        if (divName) {
          setProducts((prev) =>
            prev.map((p) =>
              p.division?.toLowerCase() === divName.toLowerCase()
                ? { ...p, status: updatedFields.status }
                : p
            )
          );
        }
      }
    }
  };

  const deleteDivision = async (id) => {
    try {
      await divisionsApi.delete(id);
      setDivisions((prev) =>
        prev.filter((d) => d.id !== id && d._id !== id && d.name !== id)
      );
    } catch (err) {
      console.error("Failed to delete division in backend:", err);
      setDivisions((prev) =>
        prev.filter((d) => d.id !== id && d._id !== id && d.name !== id)
      );
    }
  };

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  const addCategory = (newCat) => {
    const id =
      newCat.id?.trim() ||
      newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const catObj = {
      id,
      name: newCat.name.trim(),
      division: newCat.division,
      number: String(categories.filter((c) => c.division === newCat.division).length + 1).padStart(2, "0"),
      tagline: newCat.tagline?.trim() || `${newCat.name} product series.`,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, catObj]);
    return catObj;
  };

  const updateCategory = (id, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ==========================================
  // PRODUCTS CRUD (Connected to Backend API)
  // ==========================================
  const addProduct = async (newProduct) => {
    const id =
      newProduct.id?.trim() ||
      newProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `prod-${Date.now()}`;

    const formattedProduct = {
      id,
      name: newProduct.name.trim(),
      description: newProduct.description?.trim() || `${newProduct.name} military-ready unit.`,
      imageSrc:
        newProduct.imageSrc?.trim() ||
        (newProduct.division === "Aerospace"
          ? "/images/aerospace-products/arrow.png"
          : "/images/2. Defence Page/Abhedya-Level-III-Helmet.png"),
      imageAlt: newProduct.name.trim(),
      division: newProduct.division || "Aerospace",
      categoryId: newProduct.categoryId || "general",
      categoryTitle: newProduct.categoryTitle || newProduct.categoryName || "General Equipment",
      categoryName: newProduct.categoryTitle || newProduct.categoryName || "General Equipment",
      status: newProduct.status || "Active",
      details: newProduct.details || [
        {
          type: "text",
          title: "Overview",
          body: newProduct.description?.trim() || `${newProduct.name} tactical specification profile.`,
        },
      ],
    };

    try {
      const created = await productsApi.create(formattedProduct);
      setProducts((prev) => [created, ...prev]);

      // Ensure category is available
      if (created.categoryId) {
        setCategories((prev) => {
          if (!prev.some((c) => c.id === created.categoryId)) {
            return [
              ...prev,
              {
                id: created.categoryId,
                name: created.categoryTitle || created.categoryName || created.categoryId,
                division: created.division,
                tagline: `${created.categoryTitle || created.categoryName || "Tactical"} product series`,
              },
            ];
          }
          return prev;
        });
      }
      return created;
    } catch (err) {
      console.error("Backend error creating product:", err);
      setProducts((prev) => [formattedProduct, ...prev]);
      return formattedProduct;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const updated = await productsApi.update(id, updatedFields);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id || p._id === id) {
            return {
              ...p,
              ...updated,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
      return updated;
    } catch (err) {
      console.error("Backend error updating product:", err);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id || p._id === id) {
            return {
              ...p,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
    } catch (err) {
      console.error("Backend error deleting product:", err);
      setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
    }
  };

  const toggleProductStatus = async (id) => {
    try {
      await productsApi.toggleStatus(id);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id || p._id === id) {
            const nextStatus = p.status === "Inactive" ? "Active" : "Inactive";
            return {
              ...p,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Backend error toggling product status:", err);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === id || p._id === id) {
            const nextStatus = p.status === "Inactive" ? "Active" : "Inactive";
            return {
              ...p,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    }
  };

  const resetCatalog = () => {
    setDivisions([]);
    setCategories([]);
    setProducts([]);
    try {
      localStorage.removeItem(STORAGE_KEY_DIVISIONS);
      localStorage.removeItem(STORAGE_KEY_CATEGORIES);
      localStorage.removeItem(STORAGE_KEY_PRODUCTS);
      localStorage.removeItem("sky_wardens_divisions_v2");
      localStorage.removeItem("sky_wardens_categories_v2");
      localStorage.removeItem("sky_wardens_products_v2");
    } catch (e) {
      console.error(e);
    }
  };

  // Division-specific product getters
  const aerospaceProducts = products.filter((p) => p.division === "Aerospace");
  const defenceProducts = products.filter((p) => p.division === "Defence");
  const advancedSystemsProducts = products.filter((p) => p.division === "Advanced Systems");
  const petrochemicalProducts = products.filter((p) => p.division === "Petrochemicals");

  const value = {
    divisions,
    categories,
    products,
    aerospaceProducts,
    defenceProducts,
    advancedSystemsProducts,
    petrochemicalProducts,
    aerospaceCount: aerospaceProducts.length,
    defenceCount: defenceProducts.length,
    advancedSystemsCount: advancedSystemsProducts.length,
    petrochemicalsCount: petrochemicalProducts.length,
    addDivision,
    updateDivision,
    deleteDivision,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    resetCatalog,
    loading,
    refreshCatalog: fetchCatalogData,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
