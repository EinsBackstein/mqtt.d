'use client';

import React from "react";

type MultiSelectProps = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder,
}) => {
  // Add/remove logic
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.length === 0 && (
          <span className="text-gray-400">{placeholder || "Bitte auswählen"}</span>
        )}
        {selected.map((value) => (
          <span
            key={value}
            className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
          >
            {value}
            <button
              type="button"
              className="ml-1 text-blue-500 hover:text-red-500"
              onClick={() => handleToggle(value)}
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={`px-2 py-1 rounded border text-xs ${
              selected.includes(option)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
            }`}
            onClick={() => handleToggle(option)}
            aria-pressed={selected.includes(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
