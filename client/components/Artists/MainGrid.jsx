// client/components/ui/MainGrid.jsx
import React from 'react';

export default function MainGrid({ children }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-6 mt-6">
      {children}
    </div>
  );
}