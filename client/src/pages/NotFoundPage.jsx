import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="empty-state" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="empty-state__icon" style={{ fontSize: "80px" }}>404</div>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn--blue" style={{ display: "inline-block" }}>
        Go to Homepage
      </Link>
    </div>
  );
}

export default NotFoundPage;
