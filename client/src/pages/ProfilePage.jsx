import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

function ProfilePage() {
  const { user, loginUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone || "");
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/users/profile", { name, email, phone });
      setProfile(data);
      setEditing(false);
      loginUser({ ...user, name: data.name, email: data.email });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/users/address", newAddress);
      setProfile({ ...profile, addresses: data });
      setShowAddressForm(false);
      setNewAddress({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">❌</div>
        <h2>Failed to load profile</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {/* Profile Info */}
      <div className="profile-card">
        {editing ? (
          <form onSubmit={handleUpdateProfile}>
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" disabled={saving} className="btn btn--blue">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn--outline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-info__details">
              <h2>{profile.name}</h2>
              <div className="profile-info__row">📧 {profile.email}</div>
              <div className="profile-info__row">📱 {profile.phone || "Not provided"}</div>
              <div className="profile-info__meta">
                Role: {profile.role} • Joined: {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
            <button onClick={() => setEditing(true)} className="btn btn--blue btn--sm">
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="profile-card">
        <div className="profile-header">
          <h2>Saved Addresses</h2>
          <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn btn--blue btn--sm">
            {showAddressForm ? "Cancel" : "+ Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="review-form" style={{ marginBottom: "20px" }}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" className="form-input" placeholder="Full Name" value={newAddress.fullName} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" className="form-input" placeholder="Phone" value={newAddress.phone} onChange={handleAddressChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Address Line 1</label>
              <input type="text" name="addressLine1" className="form-input" placeholder="Address Line 1" value={newAddress.addressLine1} onChange={handleAddressChange} required />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input type="text" name="addressLine2" className="form-input" placeholder="Address Line 2 (optional)" value={newAddress.addressLine2} onChange={handleAddressChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" className="form-input" placeholder="City" value={newAddress.city} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" className="form-input" placeholder="State" value={newAddress.state} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" className="form-input" placeholder="Pincode" value={newAddress.pincode} onChange={handleAddressChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: "auto" }}>
              Save Address
            </button>
          </form>
        )}

        {profile.addresses?.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No saved addresses</p>
        ) : (
          profile.addresses?.map((addr, idx) => (
            <div key={idx} className="address-item">
              <strong>{addr.fullName}</strong> — {addr.phone}
              <br />
              {addr.addressLine1}
              {addr.addressLine2 && `, ${addr.addressLine2}`}
              <br />
              {addr.city}, {addr.state} — {addr.pincode}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProfilePage;