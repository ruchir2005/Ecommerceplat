import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();

  const emptyForm = {
    name: "", description: "", price: "", discountPrice: "",
    category: "", brand: "", stock: "", isFeatured: false,
    imageUrl: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/admin/products");
      setProducts(data);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      category: form.category,
      brand: form.brand || "Unbranded",
      stock: Number(form.stock) || 0,
      isFeatured: form.isFeatured,
      images: form.imageUrl ? [{ url: form.imageUrl, altText: form.name }] : [],
    };

    try {
      if (editing) {
        await api.put(`/admin/products/${editing}`, payload);
        toast.success("Product updated!");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Product created!");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      isFeatured: product.isFeatured,
      imageUrl: product.images?.[0]?.url || "",
    });
    setEditing(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Failed to delete product"); }
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div><p>Loading products...</p></div>;
  }

  return (
    <div>
      <h1>Manage Products</h1>

      {/* Modal Form */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-input" rows={3} value={form.description} onChange={handleChange} required style={{ resize: "vertical" }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" name="price" className="form-input" value={form.price} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Discount Price (₹)</label>
                  <input type="number" name="discountPrice" className="form-input" value={form.discountPrice} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" className="form-input" value={form.category} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" name="brand" className="form-input" value={form.brand} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" name="stock" className="form-input" value={form.stock} onChange={handleChange} min="0" />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "28px" }}>
                  <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} id="isFeatured" />
                  <label htmlFor="isFeatured" style={{ textTransform: "none", fontSize: "14px" }}>Featured Product</label>
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" name="imageUrl" className="form-input" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="submit" className="btn btn--blue">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn--outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span>{products.length} products</span>
          <button onClick={handleNew} className="btn btn--blue btn--sm">+ Add Product</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={p.images?.[0]?.url} alt={p.name} /></td>
                <td style={{ fontWeight: 500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>₹{p.discountPrice || p.price}</div>
                  {p.discountPrice > 0 && p.discountPrice < p.price && (
                    <div style={{ textDecoration: "line-through", color: "var(--text-hint)", fontSize: "12px" }}>₹{p.price}</div>
                  )}
                </td>
                <td>
                  <span style={{ color: p.stock > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                    {p.stock}
                  </span>
                </td>
                <td>{p.category}</td>
                <td>{p.isFeatured ? "⭐" : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => handleEdit(p)} className="btn btn--blue btn--sm">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="btn btn--danger-text btn--sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProducts;
