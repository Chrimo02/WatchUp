// src/components/AdvancedSearch.jsx
import { useState, useEffect } from "react";
import {
  Search,
  CheckSquare,
  Square,
  CheckCircle,
  Circle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMovies } from "../contexts/MovieContext";

// module‐scope storage for persistence across unmounts
let savedFilters = {
  selectedGenres: [],
  selectedLanguages: [],
  selectedCountries: [],
  fromYear: "",
  toYear: "",
  selectedAgeRating: "all",
  scoreRange: [0, 10],
  runtimeRange: [0, 360],
};

export default function AdvancedSearch({
  onSearch,
  onClose,
  dateField = "primary_release_date", 
}) {
  const { isAuthenticated } = useAuth();
  const { region } = useLanguage();
  const { getSupportedRegions } = useLanguage();
  const { genres, fetchGenres } = useMovies();

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Initialize state from savedFilters
  const [selectedGenres, setSelectedGenres] = useState(
    () => savedFilters.selectedGenres
  );
  const [selectedLanguages, setSelectedLanguages] = useState(
    () => savedFilters.selectedLanguages
  );
  const [selectedCountries, setSelectedCountries] = useState(
    () => savedFilters.selectedCountries
  );
  const [fromYear, setFromYear] = useState(() => savedFilters.fromYear);
  const [toYear, setToYear] = useState(() => savedFilters.toYear);
  const [selectedAgeRating, setSelectedAgeRating] = useState(
    () => savedFilters.selectedAgeRating
  );
  const [scoreRange, setScoreRange] = useState(
    () => savedFilters.scoreRange
  );
  const [runtimeRange, setRuntimeRange] = useState(
    () => savedFilters.runtimeRange
  );

  // Persist state back into module‐scope storage
  useEffect(() => { savedFilters.selectedGenres = selectedGenres }, [selectedGenres]);
  useEffect(() => { savedFilters.selectedLanguages = selectedLanguages }, [selectedLanguages]);
  useEffect(() => { savedFilters.selectedCountries = selectedCountries }, [selectedCountries]);
  useEffect(() => { savedFilters.fromYear = fromYear }, [fromYear]);
  useEffect(() => { savedFilters.toYear = toYear }, [toYear]);
  useEffect(() => { savedFilters.selectedAgeRating = selectedAgeRating }, [selectedAgeRating]);
  useEffect(() => { savedFilters.scoreRange = scoreRange }, [scoreRange]);
  useEffect(() => { savedFilters.runtimeRange = runtimeRange }, [runtimeRange]);

  const ageRatings = ["G", "PG", "PG-13", "R", "NC-17"];
  const languages = [
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "ja", name: "日本語 (Japanese)" },
    { code: "ko", name: "한국어 (Korean)" },
  ];

  const toggle = (val, arr, setter) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const resetAll = () => {
    setSelectedGenres([]);
    setSelectedLanguages([]);
    setSelectedCountries([]);
    setFromYear("");
    setToYear("");
    setSelectedAgeRating("all");
    setScoreRange([0, 10]);
    setRuntimeRange([0, 360]);
    savedFilters = {
      selectedGenres: [],
      selectedLanguages: [],
      selectedCountries: [],
      fromYear: "",
      toYear: "",
      selectedAgeRating: "all",
      scoreRange: [0, 10],
      runtimeRange: [0, 360],
    };
  };

    const handleSearch = () => {
    const payload = {
      ...(selectedGenres.length && { with_genres: selectedGenres.join(",") }),
      ...(selectedLanguages.length && {
        with_original_language: selectedLanguages.join("|"),
      }),
      ...(selectedCountries.length && {
        with_origin_country: selectedCountries.join(","),
      }),
      ...(fromYear && { [`${dateField}.gte`]: `${fromYear}-01-01` }),
      ...(toYear && { [`${dateField}.lte`]: `${toYear}-12-31` }),
      "vote_average.gte": scoreRange[0],
      "vote_average.lte": scoreRange[1],
      "with_runtime.gte": runtimeRange[0],
      "with_runtime.lte": runtimeRange[1],
      ...(selectedAgeRating !== "all" && {
        certification_country: region,
        "certification.lte": selectedAgeRating,
      }),
    };

    onSearch(payload);
    onClose?.();
  };

  const renderOptionGrid = (items, selected, setter, isCountry = false) => (
    <div className="grid grid-cols-2 gap-2 p-2 bg-movie-card rounded">
      {items.map((item) => {
        const code = isCountry ? item.code : item.id ?? item.code;
        const name = item.name;
        const isChecked = selected.includes(code);
        return (
          <div
            key={code}
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => toggle(code, selected, setter)}
          >
            {isChecked ? (
              <CheckSquare size={18} className="text-red-500" />
            ) : (
              <Square size={18} className="text-gray-500" />
            )}
            <span className="text-movie-text text-sm">{name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full bg-movie-card rounded-2xl border-2 border-red-500 p-6 overflow-hidden">
      <div className="space-y-6">
        {/* Genre */}
        <details className="bg-transparent">
          <summary className="flex justify-between items-center cursor-pointer select-none mb-2 list-none">
            <h3 className="text-movie-text font-medium">Genre</h3>
            <ChevronDown size={20} className="transition-transform details-open:rotate-180" />
          </summary>
          {renderOptionGrid(genres, selectedGenres, setSelectedGenres)}
        </details>

        {/* Language */}
        <details className="bg-transparent">
          <summary className="flex justify-between items-center cursor-pointer select-none mb-2 list-none">
            <h3 className="text-movie-text font-medium">Language</h3>
            <ChevronDown size={20} className="transition-transform details-open:rotate-180" />
          </summary>
          {renderOptionGrid(languages, selectedLanguages, setSelectedLanguages)}
        </details>

        {/* Country */}
        <details className="bg-transparent">
          <summary className="flex justify-between items-center cursor-pointer select-none mb-2 list-none">
            <h3 className="text-movie-text font-medium">Country</h3>
            <ChevronDown size={20} className="transition-transform details-open:rotate-180" />
          </summary>
          {renderOptionGrid(getSupportedRegions(), selectedCountries, setSelectedCountries, true)}
        </details>

        {/* Release Year */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Release Year</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="From"
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value.replace(/\D/g, ""))}
              className="flex-1 h-10 bg-movie-card text-black"
            />
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="To"
              value={toYear}
              onChange={(e) => setToYear(e.target.value.replace(/\D/g, ""))}
              className="flex-1 h-10 bg-movie-card text-black"
            />
          </div>
        </section>

        {/* Age Rating */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Age Rating</h3>
          <div className="flex flex-wrap gap-4 p-2 bg-movie-card rounded">
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setSelectedAgeRating("all")}
            >
              {selectedAgeRating === "all" ? (
                <CheckCircle size={18} className="text-red-500" />
              ) : (
                <Circle size={18} className="text-gray-500" />
              )}
              <span className="text-movie-text text-sm">All</span>
            </div>
            {ageRatings.map((r) => (
              <div
                key={r}
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setSelectedAgeRating(r)}
              >
                {selectedAgeRating === r ? (
                  <CheckCircle size={18} className="text-red-500" />
                ) : (
                  <Circle size={18} className="text-gray-500" />
                )}
                <span className="text-movie-text text-sm">{r}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Score */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Score</h3>
          <div className="p-4 bg-movie-card rounded">
            <Slider value={scoreRange} onValueChange={setScoreRange} min={0} max={10} step={0.1} />
            <p className="text-white text-sm mt-2">
              {scoreRange[0]} – {scoreRange[1]}
            </p>
          </div>
        </section>

        {/* Runtime */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Runtime (min)</h3>
          <div className="p-4 bg-movie-card rounded">
            <Slider value={runtimeRange} onValueChange={setRuntimeRange} min={0} max={360} step={5} />
            <p className="text-white text-sm mt-2">
              {runtimeRange[0]} – {runtimeRange[1]}
            </p>
          </div>
        </section>
      </div>

      {/* Footer controls */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={resetAll}>
          Reset
        </Button>
        <Button onClick={handleSearch} leftIcon={<Search />}>
          Search
        </Button>
      </div>
    </div>
  );
}