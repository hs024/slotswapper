import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { get } from "../api";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [name, setName] = useState("");

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    if (token) {
      get("/api/me") // endpoint to get current user info
        .then((data) => setName(data.name))
        .catch(() => logout());
    }
  }, [token]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      <div className="font-bold text-indigo-600 text-2xl">SlotSwapper</div>
      <div className="flex gap-6 text-sm items-center">
        {token ? (
          <>
            <span className="font-medium">Hi, {name}</span>
            <Link to="/" className="hover:text-indigo-600">
              Dashboard
            </Link>
            <Link to="/market" className="hover:text-indigo-600">
              Marketplace
            </Link>
            <Link to="/requests" className="hover:text-indigo-600">
              Requests
            </Link>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-indigo-600">
              Login
            </Link>
            <Link to="/signup" className="hover:text-indigo-600">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
