// client/components/ui/PersonalInfoCard.jsx
import React from 'react';

export default function PersonalInfoCard({ info }) {
  return (
    <aside className="self-start col-span-1 bg-[#131313] border border-gray-700 rounded-2xl p-8">
      <h2 className="text-3xl font-extrabold mb-8 text-white">
        Personal Info
      </h2>

      {Object.entries(info).map(([label, val]) => (
        <div key={label} className="mb-6">
          <div className="text-lg font-semibold text-white">{label}</div>
          <div className="mt-1 text-base text-gray-300">{val}</div>
        </div>
      ))}
    </aside>
  );
}