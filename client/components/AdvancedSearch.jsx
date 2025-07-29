// src/components/AdvancedSearch.jsx
import { useState, useEffect } from "react";
import { ChevronDown, Search, Circle, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMovies } from "../contexts/MovieContext";

export default function AdvancedSearch({ onSearch }) {
  const { isAuthenticated } = useAuth();
  const { getSupportedRegions } = useLanguage();
  const { genres, fetchGenres } = useMovies();

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Filter state
  const [watchlistFilter, setWatchlistFilter] = useState("all");
  const [ratingsFilter, setRatingsFilter]     = useState("all");
  const [scoreRange, setScoreRange]           = useState([0, 10]);
  const [runtimeRange, setRuntimeRange]       = useState([0, 360]);
  const [fromYear, setFromYear]               = useState("");
  const [toYear, setToYear]                   = useState("");

  // Multi-select state
  const [selectedGenres, setSelectedGenres]         = useState([]);
  const [selectedCountries, setSelectedCountries]   = useState([]);
  const [selectedLanguages, setSelectedLanguages]   = useState([]);
  const [selectedProviders, setSelectedProviders]   = useState([]);
  const [selectedAgeRatings, setSelectedAgeRatings] = useState([]);

  // Dropdown toggles
  const [dropdowns, setDropdowns] = useState({
    genre: false,
    country: false,
    language: false,
    ageRating: false,
    streaming: false,
  });
  const toggleDropdown = key =>
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleSelection = (id, list, setList) =>
    setList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // Reset all filters
  const resetAll = () => {
    setWatchlistFilter("all");
    setRatingsFilter("all");
    setScoreRange([0, 10]);
    setRuntimeRange([0, 360]);
    setFromYear("");
    setToYear("");
    setSelectedGenres([]);
    setSelectedCountries([]);
    setSelectedLanguages([]);
    setSelectedProviders([]);
    setSelectedAgeRatings([]);
  };

  const handleSearch = () => {
    const params = {
      watchlistFilter,
      ratingsFilter,
      "vote_average.gte": scoreRange[0],
      "vote_average.lte": scoreRange[1],
      "with_runtime.gte": runtimeRange[0],
      "with_runtime.lte": runtimeRange[1],
      ...(fromYear && { "primary_release_date.gte": `${fromYear}-01-01` }),
      ...(toYear && { "primary_release_date.lte": `${toYear}-12-31` }),
      ...(selectedGenres.length > 0 && { with_genres: selectedGenres.join(",") }),
      ...(selectedCountries.length > 0 && { with_origin_country: selectedCountries.join(",") }),
      // für mehrere Sprachen nun mit Pipe statt Komma
      ...(selectedLanguages.length > 0 && { with_original_language: selectedLanguages.join("|") }),
      ...(selectedAgeRatings.length === 1 && { "certification.lte": selectedAgeRatings[0] }),
      ...(selectedProviders.length > 0 && { with_watch_providers: selectedProviders.join(",") }),
    };
    onSearch(params);
  };

  // Static options
  const ageRatings = ["G", "PG", "PG-13", "R", "NC-17"];
  const streamingProviders = [
    { id: 8,   name: "Netflix" },
    { id: 9,   name: "Amazon Prime Video" },
    { id: 15,  name: "Disney+" },
    { id: 337, name: "HBO Max" },
    { id: 2,   name: "Apple TV+" },
    { id: 350, name: "Paramount+" },
    { id: 307, name: "Crunchyroll" },
    { id: 384, name: "Peacock" },
  ];
  const languages = [
    { code: "en", name: "English" },
    { code: "de", name: "German" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    // … weitere hinzufügen
  ];

  // UI components
  const RadioOption = ({ value, currentValue, onChange, children }) => {
    const isSelected = currentValue === value;
    return (
      <div
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          isSelected ? "text-white font-semibold" : "text-movie-text"
        )}
        onClick={() => onChange(isSelected ? "all" : value)}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {isSelected ? <CircleCheckBig size={16} /> : <Circle size={16} />}
        </div>
        <span className="text-sm">{children}</span>
      </div>
    );
  };
  const DropdownButton = ({ label, isOpen, onClick }) => (
    <div
      className="w-full h-10 bg-movie-card rounded-lg px-4 flex items-center justify-between cursor-pointer hover:bg-movie-card/80 transition"
      onClick={onClick}
    >
      <span className="text-[14px]">{label}</span>
      <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
    </div>
  );

  return (
    <div className="w-full bg-movie-bg rounded-2xl border-2 border-movie-card p-6">
      <div className="flex justify-between mb-4">
        <Button variant="outline" onClick={resetAll}>Reset</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Linke Spalte */}
        <div className="flex flex-col gap-6">
          {/* Genre */}
          <DropdownButton
            label={`Genre${selectedGenres.length ? ` (${selectedGenres.length})` : ""}`}
            isOpen={dropdowns.genre}
            onClick={() => toggleDropdown("genre")}
          />
          {dropdowns.genre && (
            <div className="mt-2 p-4 bg-movie-card rounded-lg max-h-48 overflow-auto">
              {genres.map(g => (
                <label key={g.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(g.id)}
                    onChange={() => toggleSelection(g.id, selectedGenres, setSelectedGenres)}
                  />
                  <span className="text-movie-text">{g.name}</span>
                </label>
              ))}
            </div>
          )}

          {/* Country */}
          <DropdownButton
            label={`Country${selectedCountries.length ? ` (${selectedCountries.length})` : ""}`}
            isOpen={dropdowns.country}
            onClick={() => toggleDropdown("country")}
          />
          {dropdowns.country && (
            <div className="mt-2 p-4 bg-movie-card rounded-lg max-h-48 overflow-auto grid grid-cols-2 gap-2">
              {getSupportedRegions().map(c => (
                <label key={c.code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(c.code)}
                    onChange={() => toggleSelection(c.code, selectedCountries, setSelectedCountries)}
                  />
                  <span className="text-movie-text">{c.name}</span>
                </label>
              ))}
            </div>
          )}

          {/* Watchlist */}
          {isAuthenticated && (
            <div className="bg-movie-card rounded-lg p-4">
              <p className="mb-2 text-movie-text font-medium">Watchlist</p>
              <div className="flex gap-4">
                {["all", "in", "not"].map(val => (
                  <RadioOption
                    key={val}
                    value={val}
                    currentValue={watchlistFilter}
                    onChange={setWatchlistFilter}
                  >
                    {val === "all" ? "All" : val === "in" ? "In Watchlist" : "Not in Watchlist"}
                  </RadioOption>
                ))}
              </div>
            </div>
          )}

          {/* From Year */}
          <Input
            placeholder="From Year"
            value={fromYear}
            maxLength={4}
            onChange={e => setFromYear(e.target.value)}
            className="h-10 bg-movie-card text-black"
          />

          {/* AgeRating */}
          <DropdownButton
            label={`Age Rating${selectedAgeRatings.length ? ` (${selectedAgeRatings.join(",")})` : ""}`}
            isOpen={dropdowns.ageRating}
            onClick={() => toggleDropdown("ageRating")}
          />
          {dropdowns.ageRating && (
            <div className="mt-2 p-4 bg-movie-card rounded-lg flex flex-wrap gap-2">
              {ageRatings.map(r => (
                <label key={r} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAgeRatings.includes(r)}
                    onChange={() => toggleSelection(r, selectedAgeRatings, setSelectedAgeRatings)}
                  />
                  <span className="text-movie-text">{r}</span>
                </label>
              ))}
            </div>
          )}

          {/* ScoreSlider */}
          <div className="bg-movie-card rounded-lg p-4">
            <Slider value={scoreRange} onValueChange={setScoreRange} min={0} max={10} step={0.1} />
            <p className="text-white text-sm mt-2">Score: {scoreRange[0]} – {scoreRange[1]}</p>
          </div>
        </div>

        {/* Rechte Spalte */}
        <div className="flex flex-col gap-6">
          {/* Language */}
          <DropdownButton
            label={`Language${selectedLanguages.length ? ` (${selectedLanguages.length})` : ""}`}
            isOpen={dropdowns.language}
            onClick={() => toggleDropdown("language")}
          />
          {dropdowns.language && (
            <div className="mt-2 p-4 bg-movie-card rounded-lg max-h-48 overflow-auto grid grid-cols-2 gap-2">
              {languages.map(l => (
                <label key={l.code} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(l.code)}
                    onChange={() => toggleSelection(l.code, selectedLanguages, setSelectedLanguages)}
                  />
                  <span className="text-movie-text">{l.name}</span>
                </label>
              ))}
            </div>
          )}

          {/* Ratings */}
          {isAuthenticated && (
            <div className="bg-movie-card rounded-lg p-4">
              <p className="mb-2 text-movie-text font-medium">Ratings</p>
              <div className="flex gap-4">
                {["all", "rated", "notRated"].map(val => (
                  <RadioOption
                    key={val}
                    value={val}
                    currentValue={ratingsFilter}
                    onChange={setRatingsFilter}
                  >
                    {val === "all" ? "All" : val === "rated" ? "Titles I rated" : "Not rated"}
                  </RadioOption>
                ))}
              </div>
            </div>
          )}

          {/* To Year */}
          <Input
            placeholder="To Year"
            value={toYear}
            maxLength={4}
            onChange={e => setToYear(e.target.value)}
            className="h-10 bg-movie-card text-black"
          />

          {/* Streaming */}
          <DropdownButton
            label={`Streaming${selectedProviders.length ? ` (${selectedProviders.length})` : ""}`}
            isOpen={dropdowns.streaming}
            onClick={() => toggleDropdown("streaming")}
          />
          {dropdowns.streaming && (
            <div className="mt-2 p-4 bg-movie-card rounded-lg flex flex-wrap gap-2">
              {streamingProviders.map(p => (
                <label key={p.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(p.id)}
                    onChange={() => toggleSelection(p.id, selectedProviders, setSelectedProviders)}
                  />
                  <span className="text-movie-text">{p.name}</span>
                </label>
              ))}
            </div>
          )}

          {/* RuntimeSlider */}
          <div className="bg-movie-card rounded-lg p-4">
            <Slider value={runtimeRange} onValueChange={setRuntimeRange} min={0} max={360} step={5} />
            <p className="text-white text-sm mt-2">Runtime: {runtimeRange[0]} – {runtimeRange[1]} min</p>
          </div>

          {/* Search */}
          <Button onClick={handleSearch} leftIcon={<Search />}>
            Search
          </Button>
        </div>
      </div>
    </div>
);
}