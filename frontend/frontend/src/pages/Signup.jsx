import React, { useState } from "react";
import { post } from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function doSignup(e) {
    e.preventDefault();
    setLoading(true);
    // console.log("here");
    
    try {
        // console.log("under try before call");
        
      const res = await post("/api/auth/signup", { email, password: pw, name });
        
      // If your backend just returns user info (not token)
      if (res.id || res.email) {
        alert("Signup successful. Please log in.");
        navigate("/login");
      } else if (res.access_token) {
        // If your backend *does* return token (optional)
        localStorage.setItem("token", res.access_token);
        alert("Signup successful. Redirecting...");
        navigate("/");
      } else {
        alert("Unexpected response. Check backend output.");
        console.log("Signup response:", res);
      }
    } catch (err) {
      alert("Signup failed: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <form
        onSubmit={doSignup}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
          Create Account
        </h2>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-700 text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            placeholder="********"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
