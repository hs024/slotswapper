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
    <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4 md:px-6 space-y-8">
      <h2 className="text-2xl font-semibold text-center">Swap Requests</h2>

      {/* Received Requests */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <h3 className="font-medium text-lg">Received Requests</h3>
        {requests.received.length === 0 ? (
          <p className="text-gray-500">No received requests</p>
        ) : (
          <ul className="space-y-2">
            {requests.received.map((r) => (
              <li
                key={r.id}
                className="border p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
              >
                <span className="wrap-break-words">
                  Request #{r.id} | User: {r.username} | Status: {r.status}
                </span>

                {r.status === "PENDING" && (
                  <div className="flex gap-2 flex-wrap">
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

      {/* Sent Requests */}
      <div className="bg-white p-4 rounded-2xl shadow space-y-4">
        <h3 className="font-medium text-lg">Sent Requests</h3>
        {requests.sent.length === 0 ? (
          <p className="text-gray-500">No sent requests</p>
        ) : (
          <ul className="space-y-2">
            {requests.sent.map((r) => (
              <li key={r.id} className="border p-3 rounded wrap-break-words">
                Request #{r.id} | Status: {r.status}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
