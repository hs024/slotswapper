import { useEffect, useState } from "react";
import { get, post, patch, del } from "../api";
import { useNavigate } from "react-router-dom";
import SlotCalendar from "./SlotCalendar";

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
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

    const start_time = new Date(`${startDate}T${startTime}`);
    const end_time = new Date(`${endDate}T${endTime}`);

    if (end_time <= start_time) {
      alert("End date/time must be after start date/time.");
      return;
    }

    try {
      await post("/api/slots", {
        title,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
      });

      setTitle("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setShowCreate(false);
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function makeSwappable(id) {
    await patch(`/api/slots/${id}`, { status: "SWAPPABLE" });
    load();
  }

  async function delSlot(id) {
    if (confirm("Delete this slot?")) {
      try {
        await del(`/api/slots/${id}`);
        load();
      } catch (err) {
        alert(err.message);
      }
    }
  }

  if (!localStorage.getItem("token")) {
    return <div className="text-center mt-10">Please login first.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4 md:px-6 flex flex-col md:flex-row gap-6 items-start justify-center">
      {/* Left Column: Slots List */}
      <div className="w-full md:w-1/2 bg-white p-4 sm:p-6 rounded-2xl shadow flex flex-col">
        <h2 className="text-2xl font-semibold mb-4 text-center md:text-left">
          My Slots
        </h2>
        {err && (
          <div className="text-red-600 text-center md:text-left mb-4">
            {err}
          </div>
        )}
        <ul className="space-y-2 mb-6">
          {slots.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
            >
              <div className="wrap-break-words">
                <b>{s.title}</b> | {s.status} |{" "}
                {new Date(s.start_time).toLocaleString()}
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                {s.status === "BUSY" && (
                  <button
                    onClick={() => makeSwappable(s.id)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                  >
                    Make Swappable
                  </button>
                )}
                <button
                  onClick={() => delSlot(s.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Calendar + Create Slot */}
      <div className="w-full md:w-1/2 bg-white p-4 sm:p-6 rounded-2xl shadow flex flex-col gap-4">
        <div
          className="flex justify-between items-center mb-4
        bg-white p-4 rounded-2xl shadow"
        >
          <h3 className="text-xl font-medium">Create Slot</h3>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Close" : "Create Slot"}
          </button>
        </div>

        {/* Create Slot Form */}
        {showCreate && (
          <form onSubmit={create} className="space-y-4 mb-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        )}

        {/* Calendar */}
        <h3 className="text-xl font-medium">My Slots Calendar</h3>
        <SlotCalendar slots={slots} />
      </div>
    </div>
  );
}
