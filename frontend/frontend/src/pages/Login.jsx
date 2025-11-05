import { useState } from "react";
import { post } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function doLogin(e) {
    e.preventDefault();
    try {
      const res = await post("/api/auth/login", { email, password: pw });
      localStorage.setItem("token", res.access_token);
      navigate("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="flex flex-col items-center mt-20">
      <form
        onSubmit={doLogin}
        className="bg-white p-8 shadow-md rounded-xl w-80 space-y-4"
      >
        <h3 className="text-2xl font-bold text-center">Login</h3>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          placeholder="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Login
        </button>
      </form>
    </div>
  );
}
