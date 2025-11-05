import { useEffect, useState } from "react";
import { get, post, patch,del } from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await get("/api/my-slots");
      if (Array.isArray(data)) setSlots(data);
      else throw new Error("Invalid response");
    } catch (e) {
      if (e.message.includes("401")) navigate("/login");
      setErr(e.message);
    }
  }

  async function create(e) {
    e.preventDefault();
    try {
      const start_time = `${startDate}T${startTime}`;
      const end_time = `${endDate}T${endTime}`;
      await post("/api/slots", { title, start_time, end_time });
      setTitle("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function makeSwappable(id) {
    await patch(`/api/slots/${id}`, { status: "SWAPPABLE" });
    load();
  }

  if (!localStorage.getItem("token")) {
    return <div className="text-center mt-10">Please login first.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center">My Slots</h2>
        {err && <div className="text-red-600 text-center mb-4">{err}</div>}

        <ul className="space-y-2 mb-6">
          {slots.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <b>{s.title}</b> | {s.status} |{" "}
                {new Date(s.start_time).toLocaleString()}
              </div>
              {s.status === "BUSY" && (
                <button
                  onClick={() => makeSwappable(s.id)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Make Swappable
                </button>
              )}
              <button
                onClick={async () => {
                  if (confirm("Delete this slot?")) {
                    try {
                      await del(`/api/slots/${s.id}`);
                      load();
                    } catch (err) {
                      alert(err.message);
                    }
                  }
                }}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={create} className="space-y-4">
          <h3 className="text-xl font-medium text-center">Create Slot</h3>

          <div>
            <label className="block text-sm text-gray-600">Title</label>
            <input
              placeholder="e.g. Project Discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
          </div>

          <button className="bg-green-600 text-white w-full py-2 rounded mt-2">
            Create Slot
          </button>
        </form>
      </div>
    </div>
  );
}
