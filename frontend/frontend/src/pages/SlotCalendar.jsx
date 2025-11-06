import { useState } from "react";

export default function SlotCalendar({ slots }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const daysInMonth = [];
  for (let d = 1; d <= endOfMonth.getDate(); d++) {
    daysInMonth.push(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d)
    );
  }

  const isSlot = (date) =>
    slots.some(
      (s) => new Date(s.start_time).toDateString() === date.toDateString()
    );

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          &lt;
        </button>
        <h2 className="font-semibold text-lg">
          {currentMonth.toLocaleString("default", { month: "long" })}{" "}
          {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {Array(startOfMonth.getDay())
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        {daysInMonth.map((date) => (
          <div
            key={date.toISOString()}
            className={`py-2 rounded cursor-pointer ${
              isSlot(date)
                ? "bg-indigo-600 text-white font-semibold"
                : "hover:bg-gray-200"
            }`}
          >
            {date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}
