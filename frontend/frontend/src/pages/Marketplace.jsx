import { useEffect, useState } from "react";
import { get, post } from "../api";

export default function Marketplace() {
  const [market, setMarket] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedTheir, setSelectedTheir] = useState(null);

  async function load() {
    setMarket(await get("/api/swappable-slots"));
    setMySwappables(await get("/api/my-slots"));
  }

  useEffect(() => {
    load();
  }, []);

  async function requestSwap(mySlotId) {
    if (!selectedTheir) return alert("Select a target first");
    await post("/api/swap-request", {
      mySlotId,
      theirSlotId: selectedTheir.id,
    });
    alert("Requested");
    load();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4 md:px-6 space-y-8">
      <h2 className="text-2xl font-semibold text-center">Marketplace</h2>

      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <h3 className="font-medium text-lg">Available Slots</h3>
        <ul className="space-y-2">
          {market.map((s) => (
            <li
              key={s.id}
              className="border p-3 rounded flex items-center gap-2 flex-wrap"
            >
              <input
                type="radio"
                name="their"
                onChange={() => setSelectedTheir(s)}
              />
              <span className="wrap-break-words">
                {s.title} | {new Date(s.start_time).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <h3 className="font-medium text-lg">Your Swappable Slots</h3>
        <ul className="space-y-2">
          {mySwappables
            .filter((s) => s.status === "SWAPPABLE")
            .map((ms) => (
              <li
                key={ms.id}
                className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
              >
                <span className="wrap-break-words">{ms.title}</span>
                <button
                  onClick={() => requestSwap(ms.id)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Offer Swap
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
