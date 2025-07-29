// src/components/AdvancedSearch.jsx
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [selectedAgeRating, setSelectedAgeRating] = useState("all");
  const [scoreRange, setScoreRange] = useState([0, 10]);
  const [runtimeRange, setRuntimeRange] = useState([0, 360]);

  const ageRatings = ["G", "PG", "PG-13", "R", "NC-17"];
  const languages = [
    { code: "en", name: "English" },
    { code: "de", name: "German" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    // add more as needed
  ];

  const toggle = (val, arr, setter) =>
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const resetAll = () => {
    setSelectedGenres([]);
    setSelectedLanguages([]);
    setSelectedCountries([]);
    setFromYear("");
    setToYear("");
    setSelectedAgeRating("all");
    setScoreRange([0, 10]);
    setRuntimeRange([0, 360]);
  };

  const handleSearch = () => {
    onSearch({
      ...(selectedGenres.length && { with_genres: selectedGenres.join(",") }),
      ...(selectedLanguages.length && { with_original_language: selectedLanguages.join("|") }),
      ...(selectedCountries.length && { with_origin_country: selectedCountries.join(",") }),
      ...(fromYear && { "primary_release_date.gte": `${fromYear}-01-01` }),
      ...(toYear && { "primary_release_date.lte": `${toYear}-12-31` }),
      "vote_average.gte": scoreRange[0],
      "vote_average.lte": scoreRange[1],
      "with_runtime.gte": runtimeRange[0],
      "with_runtime.lte": runtimeRange[1],
      ...(selectedAgeRating !== "all" && { "certification.lte": selectedAgeRating }),
    });
  };

  return (
    <div className="w-full bg-movie-bg rounded-2xl border-2 border-movie-card p-6">
      {/* Reset button */}
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={resetAll}>Reset</Button>
      </div>

      <div className="space-y-6">
        {/* Genre */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Genre</h3>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-movie-card rounded">
            {genres.map(g => (
              <label key={g.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(g.id)}
                  onChange={() => toggle(g.id, selectedGenres, setSelectedGenres)}
                />
                <span className="text-movie-text text-sm">{g.name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Language */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Language</h3>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-movie-card rounded">
            {languages.map(l => (
              <label key={l.code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(l.code)}
                  onChange={() => toggle(l.code, selectedLanguages, setSelectedLanguages)}
                />
                <span className="text-movie-text text-sm">{l.name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Country */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Country</h3>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-movie-card rounded">
            {getSupportedRegions().map(c => (
              <label key={c.code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(c.code)}
                  onChange={() => toggle(c.code, selectedCountries, setSelectedCountries)}
                />
                <span className="text-movie-text text-sm">{c.name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Year Range */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Release Year</h3>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="From"
              value={fromYear}
              onChange={e => setFromYear(e.target.value)}
              className="flex-1 h-10 bg-movie-card text-black"
            />
            <Input
              type="number"
              placeholder="To"
              value={toYear}
              onChange={e => setToYear(e.target.value)}
              className="flex-1 h-10 bg-movie-card text-black"
            />
          </div>
        </section>

        {/* Age Rating */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Age Rating</h3>
          <div className="flex flex-wrap gap-4 p-2 bg-movie-card rounded">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ageRating"
                checked={selectedAgeRating === "all"}
                onChange={() => setSelectedAgeRating("all")}
              />
              <span className="text-movie-text text-sm">All</span>
            </label>
            {ageRatings.map(r => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ageRating"
                  checked={selectedAgeRating === r}
                  onChange={() => setSelectedAgeRating(r)}
                />
                <span className="text-movie-text text-sm">{r}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Score Slider */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Score</h3>
          <div className="p-4 bg-movie-card rounded">
            <Slider value={scoreRange} onValueChange={setScoreRange} min={0} max={10} step={0.1} />
            <p className="text-white text-sm mt-2">
              {scoreRange[0]} – {scoreRange[1]}
            </p>
          </div>
        </section>

        {/* Runtime Slider */}
        <section>
          <h3 className="mb-2 text-movie-text font-medium">Runtime (min)</h3>
          <div className="p-4 bg-movie-card rounded">
            <Slider value={runtimeRange} onValueChange={setRuntimeRange} min={0} max={360} step={5} />
            <p className="text-white text-sm mt-2">
              {runtimeRange[0]} – {runtimeRange[1]}
            </p>
          </div>
        </section>

        {/* Search */}
        <div className="text-right">
          <Button onClick={handleSearch} leftIcon={<Search />}>
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}