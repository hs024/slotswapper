import { useEffect, useState } from "react";
import { get, post } from "../api";

export default function Requests() {
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await get("/api/my-swap-requests");
      setRequests(data);
    } catch (err) {
      console.error("Error loading requests:", err);
      alert("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id, accept) {
    try {
      await post(`/api/swap-response/${id}`, { accept });
      alert(accept ? "Swap accepted" : "Swap rejected");
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to respond");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Swap Requests</h2>

      <div>
        <h3 className="font-medium mb-2">Received Requests</h3>
        {requests.received.length === 0 ? (
          <p className="text-gray-500">No received requests</p>
        ) : (
          <ul className="space-y-2">
            {requests.received.map((r) => (
              <li
                key={r.id}
                className="border p-3 rounded flex justify-between"
              >
               
                <span>
                  Request #{r.id} | User: {r.username} | Status: {r.status}
                </span>

                {r.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(r.id, true)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(r.id, false)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-medium mb-2">Sent Requests</h3>
        {requests.sent.length === 0 ? (
          <p className="text-gray-500">No sent requests</p>
        ) : (
          <ul className="space-y-2">
            {requests.sent.map((r) => (
              <li key={r.id} className="border p-3 rounded">
                Request #{r.id} | Status: {r.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
