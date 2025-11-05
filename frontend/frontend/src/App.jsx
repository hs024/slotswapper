import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";
import Signup from "./pages/Signup";

import Navbar from "./pages/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
