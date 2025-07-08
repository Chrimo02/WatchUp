import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function AdvancedSearch() {
    const [selectedType, setSelectedType] = useState("all");
    const [watchlistFilter, setWatchlistFilter] = useState ("all");
    const [ratingsFilter, setRatingsFilter] = useState ("all");

        //Hier unsicher falls was net geht noch ChatGPT fragen
    const [scoreRange, setScoreRange] = useState([0, 10]);
    const [runtimeRange, setRuntimeRange] = useState([0, 360]);
    const [fromYear, setFromYear] = useState("");
    const [toYear, setToYear] = useState("");
    const [dropdowns, setDropdowns] = useState({
        genre: false,
        country: false,
        language: false,
        ageRating: false,
        streaming: false,
    });

    const toggleDropdown = (key) => {
        setDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const RadioOption = ({
        value,
        currentValue,
        onChange,
        children,
        className = "",
    }) => (
        <div
            className={cn("flex items-center gap-[2px] cursor-pointer", className)}
            onClick={() => onChange(value)}
        >
            <div className="w-[25px] h-[25px] flex items-center justify-center">
                <div className="w-[15px] h-[15px] rounded-full border border-white/50 flex items-center justify-center">
                    {currentValue === value && (
                        <div className="w-[7px] h-[7px] rounded-full bg-movie-accent" />
                    )}
                </div>
            </div>
            <span className="text-movie-text text-[10px]">{children}</span>
        </div>
    );

    const TypeButton = ({
        type,
        label,
        isActive,
        onClick,
    }) => (
        <button
            className={cn(
                "flex-1 h-full rounded-[10px] flex items-center justify-center cursor-pointer transition-colors",
                isActive ? "bg-movie-accent" : "bg-transparent",
            )}
            onClick={onClick}
        >
            <span
                className={cn(
                    "text-[14px] font-medium",
                    isActive ? "text-white" : "text-movie-text",
                )}
            >
                {label}
            </span>
        </button>
    );

    const DropdownButton = ({
        label,
        isOpen,
        onClick,
    }) => (
        <div
            className="w-full h-[37px] bg-movie-card rounded-[10px] px-[18px] py-[8px] flex items-center justify-between cursor-pointer hover:bg-movie-card/80 transition-colors"
            onClick={onClick}
        >
            <span className="text-movie-text text-[14px]">{label}</span>
            <ChevronDown
                className={cn(
                    "w-[20px] h-[20px] text-movie-text transition-transform duration-200",
                    isOpen && "rotate-180",
                )}
            />
        </div>
    );

    const SliderSection = ({
        title,
        range,
        onRangeChange,
        min,
        max,
        step = 1,
        labels,
    }) => (
        <div className="w-full px-[16px] flex flex-col gap-[10px]">
            <div className="flex items-center">
                <span className="text-white text-[16px] font-medium">{title}</span>
            </div>
            <div className="relative">
                <Slider
                    value={range}
                    onValueChange={onRangeChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full"
                />
                <div className="flex justify-between mt-2 text-[#B7B7B7] text-[15px]">
                    <span>{labels.min}</span>
                    {labels.mid && <span>{labels.mid}</span>}
                    <span>{labels.max}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-movie-bg font-poppins flex items-center justify-center p-4">
            <div className="w-full max-w-[666px] relative">
                {/* Header */}
                <div className="flex justify-center mb-[37px]">
                    <div className="w-[214px] h-[75px] bg-movie-bg rounded-[30px] flex items-center justify-center border border-movie-card">
                        <span className="text-movie-text text-[20px] font-medium">
                            Search Filters
                        </span>
                    </div>
                </div>

                {/* Main Container */}
                <div className="w-full bg-movie-bg rounded-[50px] border border-movie-card">
                    <div className="p-[28px]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[65px]">
                            {/* Left Column */}
                            <div className="flex flex-col gap-[20px]">
                                {/* Genre Dropdown */}
                                <DropdownButton
                                    label="Genre"
                                    isOpen={dropdowns.genre}
                                    onClick={() => toggleDropdown("genre")}
                                />

                                {/* Country Dropdown */}
                                <DropdownButton
                                    label="Country"
                                    isOpen={dropdowns.country}
                                    onClick={() => toggleDropdown("country")}
                                />

                                {/* Watchlist */}
                                <div className="w-full bg-movie-card rounded-[10px] p-[16px]">
                                    <div className="mb-[10px]">
                                        <span className="text-movie-text text-[14px]">
                                            Watchlist
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        <RadioOption
                                            value="all"
                                            currentValue={watchlistFilter}
                                            onChange={(value) => setWatchlistFilter(value)}
                                        >
                                            All
                                        </RadioOption>
                                        <RadioOption
                                            value="in"
                                            currentValue={watchlistFilter}
                                            onChange={(value) => setWatchlistFilter(value)}
                                        >
                                            In watchlist
                                        </RadioOption>
                                        <RadioOption
                                            value="not"
                                            currentValue={watchlistFilter}
                                            onChange={(value) => setWatchlistFilter(value)}
                                        >
                                            Not in watchlist
                                        </RadioOption>
                                    </div>
                                </div>

                                {/* From Year */}
                                <div className="w-full">
                                    <Input
                                        placeholder="From Year"
                                        value={fromYear}
                                        onChange={(e) => setFromYear(e.target.value)}
                                        className="h-[37px] bg-movie-card border-none text-movie-text placeholder:text-movie-text/70"
                                    />
                                </div>

                                {/* Age Rating Dropdown */}
                                <DropdownButton
                                    label="Age Rating"
                                    isOpen={dropdowns.ageRating}
                                    onClick={() => toggleDropdown("ageRating")}
                                />

                                {/* Score Slider */}
                                <SliderSection
                                    title="Score"
                                    range={scoreRange}
                                    onRangeChange={setScoreRange}
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    labels={{ min: "0", mid: "5", max: "10" }}
                                />
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-[20px]">
                                {/* Type Selector */}
                                <div className="w-full h-[37px] bg-movie-card rounded-[10px] flex">
                                    <TypeButton
                                        type="all"
                                        label="ALL"
                                        isActive={selectedType === "all"}
                                        onClick={() => setSelectedType("all")}
                                    />
                                    <TypeButton
                                        type="movie"
                                        label="Movie"
                                        isActive={selectedType === "movie"}
                                        onClick={() => setSelectedType("movie")}
                                    />
                                    <TypeButton
                                        type="series"
                                        label="Series"
                                        isActive={selectedType === "series"}
                                        onClick={() => setSelectedType("series")}
                                    />
                                </div>

                                {/* Language Dropdown */}
                                <DropdownButton
                                    label="Language"
                                    isOpen={dropdowns.language}
                                    onClick={() => toggleDropdown("language")}
                                />

                                {/* Ratings */}
                                <div className="w-full bg-movie-card rounded-[10px] p-[16px]">
                                    <div className="mb-[10px]">
                                        <span className="text-movie-text text-[14px]">Ratings</span>
                                    </div>
                                    <div className="flex items-center gap-[8px]">
                                        <RadioOption
                                            value="all"
                                            currentValue={ratingsFilter}
                                            onChange={(value) => setRatingsFilter(value)}
                                        >
                                            All
                                        </RadioOption>
                                        <RadioOption
                                            value="rated"
                                            currentValue={ratingsFilter}
                                            onChange={(value) => setRatingsFilter(value)}
                                        >
                                            Titles I rated
                                        </RadioOption>
                                        <RadioOption
                                            value="notRated"
                                            currentValue={ratingsFilter}
                                            onChange={(value) => setRatingsFilter(value)}
                                        >
                                            Titles I didn't rate
                                        </RadioOption>
                                    </div>
                                </div>

                                {/* To Year */}
                                <div className="w-full">
                                    <Input
                                        placeholder="To Year"
                                        value={toYear}
                                        onChange={(e) => setToYear(e.target.value)}
                                        className="h-[37px] bg-movie-card border-none text-movie-text placeholder:text-movie-text/70"
                                    />
                                </div>

                                {/* Streaming Services Dropdown */}
                                <DropdownButton
                                    label="Streaming services"
                                    isOpen={dropdowns.streaming}
                                    onClick={() => toggleDropdown("streaming")}
                                />

                                {/* Runtime Slider */}
                                <SliderSection
                                    title="Runtime"
                                    range={runtimeRange}
                                    onRangeChange={setRuntimeRange}
                                    min={0}
                                    max={360}
                                    step={5}
                                    labels={{ min: "0", mid: "120", max: "360" }}
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-center mt-[40px]">
                            <Button
                                className="bg-movie-accent hover:bg-movie-accent/90 text-white px-[40px] py-[12px] rounded-[25px] text-[16px] font-medium flex items-center gap-[8px]"
                                onClick={() => {
                                    console.log("Search filters:", {
                                        selectedType,
                                        watchlistFilter,
                                        ratingsFilter,
                                        scoreRange,
                                        runtimeRange,
                                        fromYear,
                                        toYear,
                                        dropdowns,
                                    });
                                }}
                            >
                                <Search className="w-5 h-5" />
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// Standard-Export für Kompatibilität (optional, falls noch genutzt)
export default AdvancedSearch;

// Benannter Export für direkten Import
export { AdvancedSearch };