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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Marketplace</h2>
      <div>
        <h3 className="font-medium mb-2">Available Slots</h3>
        <ul className="space-y-2">
          {market.map((s) => (
            <li key={s.id} className="border p-3 rounded">
              <input
                type="radio"
                name="their"
                onChange={() => setSelectedTheir(s)}
              />{" "}
              {s.title} | {new Date(s.start_time).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium mb-2">Your Swappable Slots</h3>
        <ul className="space-y-2">
          {mySwappables
            .filter((s) => s.status === "SWAPPABLE")
            .map((ms) => (
              <li
                key={ms.id}
                className="border p-3 rounded flex justify-between"
              >
                {ms.title}
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
