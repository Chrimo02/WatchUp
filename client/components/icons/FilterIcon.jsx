// src/components/icons/FilterIcon.jsx
import React from "react";
import { Filter } from "lucide-react";

export default function FilterIcon({ className = "w-6 h-6", ...props }) {
  return <Filter className={className} {...props} />;
}