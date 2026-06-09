import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      loginUser(data);
      navigate("/");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-banner">
          <h2>Login</h2>
          <p>Get access to your Orders, Wishlist and Recommendations</p>
        </div>

        <div className="auth-form-wrapper">
          <h2>Welcome Back</h2>

          {error && (
            <div className="product-detail__message product-detail__message--error" style={{ marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn--primary">
              Login
            </button>
          </form>

          <p className="auth-terms">
            By continuing, you agree to FlipKart's Terms of Use and Privacy Policy.
          </p>

          <p className="auth-footer">
            New to FlipKart? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;