import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { get } from "../api";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
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
    <nav className="bg-white shadow-sm px-4 py-4 relative">
      <div className="flex justify-between items-center">
        <div className="font-bold text-indigo-600 text-2xl">SlotSwapper</div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center text-sm">
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

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-screen p-4 flex flex-col gap-4" : "max-h-0"
        }`}
      >
        {token ? (
          <>
            <span className="font-medium">Hi, {name}</span>
            <Link
              to="/"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/market"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/requests"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Requests
            </Link>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
