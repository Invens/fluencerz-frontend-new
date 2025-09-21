"use client";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function DynamicListInput({ label, values, setValues }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      setValues([...values, input.trim()]);
      setInput("");
    }
  };

  const removeItem = (idx) => {
    setValues(values.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 border rounded-lg p-2">
        {values.map((val, idx) => (
          <span
            key={idx}
            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
          >
            {val}
            <XMarkIcon
              className="h-4 w-4 cursor-pointer"
              onClick={() => removeItem(idx)}
            />
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter"
          className="flex-1 p-2 outline-none border-none"
        />
      </div>
    </div>
  );
}
