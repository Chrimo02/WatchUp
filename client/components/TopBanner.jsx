import React, { useState } from "react";
import { cn } from "@/lib/utils";
import seatsImg from "../assets/seats.png"; // <-- Bild importieren

const genres = ["All Genres", "Action", "Crime", "Drama", "Fantasy"];
const sortOptions = [
  "Date Added",
  "Title",
  "Rating",
  "Release Date",
  "Duration",
];

function TopBanner() {
  const [filterBy, setFilterBy] = useState("All Genres");
  const [sortBy, setSortBy] = useState("Date Added");
  const [sortDirection, setSortDirection] = useState("up");
  const [viewMode, setViewMode] = useState("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div
      className="relative w-screen h-[250px] flex flex-col items-center justify-between bg-movie-dark font-sans"
      style={{
        backgroundImage: `linear-gradient(to top, #141414, rgba(68,68,68,0.27)), url(${seatsImg})`,
        backgroundSize: 'cover', // Bild strecken/füllen
        backgroundRepeat: 'no-repeat', // kein Kacheln
      }}
    >


      <h1 className="relative z-10 text-white text-5xl font-bold text-center px-4 mt-[80px]">
        Top Rated
      </h1>


      <div className="relative w-screen flex justify-between mb-6">
        <div className="flex items-center gap-6 flex-wrap ml-7">


          <div className="relative">
            <text className="flex items-center justify-between w-33 h-10 px-4 py-2 bg-movie-card rounded-xl text-movie-text text-sm font-bold">
              1 - 50 of 950 titles
            </text>
          </div>


          {/* Filter Genres */}
          <div className="relative">
            <button
              className="flex items-center justify-between w-32 h-10 px-4 py-2 bg-movie-card rounded-xl text-movie-text text-sm font-normal"
            >
              <span>{filterBy}</span>
              <svg
                viewBox="0 0 16 12"
                className="w-4 h-3 fill-white flex-shrink-0"
              >
                <path d="M0 1.2C0 0.88174 0.126428 0.576515 0.351472 0.351472C0.576516 0.126428 0.88174 0 1.2 0H14.8C15.1183 6.70682e-09 15.4235 0.126428 15.6485 0.351472C15.8736 0.576515 16 0.88174 16 1.2C16 1.51826 15.8736 1.82348 15.6485 2.04853C15.4235 2.27357 15.1183 2.4 14.8 2.4H1.2C0.88174 2.4 0.576516 2.27357 0.351472 2.04853C0.126428 1.82348 0 1.51826 0 1.2ZM3.2 6C3.2 5.68174 3.32643 5.37652 3.55147 5.15147C3.77652 4.92643 4.08174 4.8 4.4 4.8H11.6C11.9183 4.8 12.2235 4.92643 12.4485 5.15147C12.6736 5.37652 12.8 5.68174 12.8 6C12.8 6.31826 12.6736 6.62348 12.4485 6.84853C12.2235 7.07357 11.9183 7.2 11.6 7.2H4.4C4.08174 7.2 3.77652 7.07357 3.55147 6.84853C3.32643 6.62348 3.2 6.31826 3.2 6ZM6.8 9.6C6.48174 9.6 6.17652 9.72643 5.95147 9.95147C5.72643 10.1765 5.6 10.4817 5.6 10.8C5.6 11.1183 5.72643 11.4235 5.95147 11.6485C6.17652 11.8736 6.48174 12 6.8 12H9.2C9.51826 12 9.82348 11.8736 10.0485 11.6485C10.2736 11.4235 10.4 11.1183 10.4 10.8C10.4 10.4817 10.2736 10.1765 10.0485 9.95147C9.82348 9.72643 9.51826 9.6 9.2 9.6H6.8Z" />
              </svg>
            </button>
          </div>


          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSortOpen(!sortOpen);
                setFilterOpen(false);
              }}
              className="flex items-center justify-between w-32 h-10 px-3 py-2 bg-movie-card rounded-xl text-movie-text text-sm font-normal"
            >
              <span>{sortBy}</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="w-5 h-5 stroke-movie-text flex-shrink-0"
              >
                <path
                  d="M16.6004 7.4585L11.1671 12.8918C10.5254 13.5335 9.47539 13.5335 8.83372 12.8918L3.40039 7.4585"
                  stroke="#E5E5E5"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>


          {/* Sort Direction Toggle */}
          <button
            className="flex items-center justify-center w-8 h-6 transition-transform duration-200"
            style={{
              transform:
                sortDirection === "down" ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <svg
              className="stroke-white"
              viewBox="0 0 24 25"
              fill="none"
              width="24"
              height="24"
            >
              <path
                d="M12 21.5V4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 10.5L12 3.5L5 10.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>


        </div>

        <div className="flex items-center gap-6 flex-wrap mr-12">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-3 ml-[100px] ">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200",
                viewMode === "list" ? "bg-white" : "bg-transparent",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                style={{ fill: viewMode === "list" ? "#161717" : "#fff" }}
              >
                <path d="M1.5 13.5C2.325 13.5 3 12.825 3 12C3 11.175 2.325 10.5 1.5 10.5C0.675 10.5 0 11.175 0 12C0 12.825 0.675 13.5 1.5 13.5ZM1.5 18.5C2.325 18.5 3 17.825 3 17C3 16.175 2.325 15.5 1.5 15.5C0.675 15.5 0 16.175 0 17C0 17.825 0.675 18.5 1.5 18.5ZM1.5 8.5C2.325 8.5 3 7.825 3 7C3 6.175 2.325 5.5 1.5 5.5C0.675 5.5 0 6.175 0 7C0 7.825 0.675 8.5 1.5 8.5ZM6.357 13.5H22.643C23.389 13.5 24 12.825 24 12C24 11.175 23.39 10.5 22.643 10.5H6.357C5.611 10.5 5 11.175 5 12C5 12.825 5.61 13.5 6.357 13.5ZM6.357 18.5H22.643C23.389 18.5 24 17.825 24 17C24 16.175 23.39 15.5 22.643 15.5H6.357C5.611 15.5 5 16.175 5 17C5 17.825 5.61 18.5 6.357 18.5ZM5 7C5 7.825 5.61 8.5 6.357 8.5H22.643C23.389 8.5 24 7.825 24 7C24 6.175 23.39 5.5 22.643 5.5H6.357C5.611 5.5 5 6.175 5 7Z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200",
                viewMode === "grid" ? "bg-white" : "bg-transparent",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                style={{ fill: viewMode === "grid" ? "#161717" : "#fff" }}
              >
                <path d="M4.8 14H7.2C7.64 14 8 13.7 8 13.333V10.667C8 10.3 7.64 10 7.2 10H4.8C4.36 10 4 10.3 4 10.667V13.333C4 13.7 4.36 14 4.8 14ZM4.8 8H7.2C7.64 8 8 7.7 8 7.333V4.667C8 4.3 7.64 4 7.2 4H4.8C4.36 4 4 4.3 4 4.667V7.333C4 7.7 4.36 8 4.8 8ZM4.8 20H7.2C7.64 20 8 19.7 8 19.333V16.667C8 16.3 7.64 16 7.2 16H4.8C4.36 16 4 16.3 4 16.667V19.333C4 19.7 4.36 20 4.8 20ZM10.8 20H13.2C13.64 20 14 19.7 14 19.333V16.667C14 16.3 13.64 16 13.2 16H10.8C10.36 16 10 16.3 10 16.667V19.333C10 19.7 10.36 20 10.8 20ZM16.8 20H19.2C19.64 20 20 19.7 20 19.333V16.667C20 16.3 19.64 16 19.2 16H16.8C16.36 16 16 16.3 16 16.667V19.333C16 19.7 16.36 20 16.8 20ZM10.8 14H13.2C13.64 14 14 13.7 14 13.333V10.667C14 10.3 13.64 10 13.2 10H10.8C10.36 10 10 10.3 10 10.667V13.333C10 13.7 10.36 14 10.8 14ZM10.8 8H13.2C13.64 8 14 7.7 14 7.333V4.667C14 4.3 13.64 4 13.2 4H10.8C10.36 4 10 4.3 10 4.667V7.333C10 7.7 10.36 8 10.8 8ZM16 10.667V13.333C16 13.7 16.36 14 16.8 14H19.2C19.64 14 20 13.7 20 13.333V10.667C20 10.3 19.64 10 19.2 10H16.8C16.36 10 16 10.3 16 10.667ZM16 4.667V7.333C16 7.7 16.36 8 16.8 8H19.2C19.64 8 20 7.7 20 7.333V4.667C20 4.3 19.64 4 19.2 4H16.8C16.36 4 16 4.3 16 4.667Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

// Standard-Export für Kompatibilität (optional, falls noch genutzt)
export default TopBanner;

// Benannter Export für direkten Import
export { TopBanner };
