import { useState, useEffect } from "react";
import { ChevronDown, Search, Circle, CircleCheckBig, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAuth } from '../contexts/AuthContext';

function AdvancedSearch() {
    const [selectedType, setSelectedType] = useState("all");
    const [watchlistFilter, setWatchlistFilter] = useState("all");
    const [ratingsFilter, setRatingsFilter] = useState("all");
    const { isAuthenticated } = useAuth();

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

    useEffect(() => {
        console.log("ScoreRange updated:", scoreRange);
    }, [scoreRange]);

    useEffect(() => {
        console.log("RuntimeRange updated:", runtimeRange);
    }, [runtimeRange]);



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
    }) => {
        const isSelected = currentValue === value;

        return (
            <div
                className={cn(
                    "flex items-center gap-[8px] cursor-pointer",
                    className
                )}
                onClick={() => onChange(isSelected ? "all" : value)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        onChange(isSelected ? "all" : value);
                    }
                }}
            >
                {/* Outer circle with inner dot */}
                <div className="w-[25px] h-[25px] flex items-center justify-center">
                    {isSelected ? (
                        <CircleCheckBig size={16} strokeWidth={3}  />
                    ) : (
                        <Circle size={16} />
                    )}
                </div>

                {/* Label text */}
                <span
                    className={"text-movie-text text-[12px] transition-colors"}
                >
                    {children}
                </span>
            </div>
        );
    };


    const TypeButton = ({
        type,
        label,
        isActive,
        onClick,
    }) => (
        <button
            className={cn(
                "flex-1 h-full rounded-[10px] flex items-center justify-center cursor-pointer transition-colors",
                isActive ? "bg-movie-accent" : "bg-transparent"
            )}
            onClick={onClick}
        >
            <span
                className={cn(
                    "text-[14px]",
                    isActive ? "text-white font-bold underline" : "text-movie-text font-medium"
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

    return (

                <div className="w-full bg-movie-bg rounded-[50px] border-2 border-movie-card border-red-600 ">
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
                                {isAuthenticated && (
                                    <div className="w-full bg-movie-card rounded-[10px] p-[16px]">
                                        <div className="mb-[10px]">
                                            <span className="text-movie-text text-[14px]">
                                                Watchlist
                                            </span>
                                        </div>
                                        <div className="flex items-column gap-[8px]">
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
                                                In Watchlist
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
                                )}
                                {/* From Year */}
                                <div className="w-full">
                                    <Input
                                        placeholder="From Year"
                                        value={fromYear}
                                        maxLength={4}
                                        onChange={(e) => setFromYear(e.target.value)}
                                        className="h-[37px] bg-movie-card border-none text-black placeholder:text-movie-text/70"
                                    />
                                </div>

                                {/* Age Rating Dropdown */}
                                <DropdownButton
                                    label="Age Rating"
                                    isOpen={dropdowns.ageRating}
                                    onClick={() => toggleDropdown("ageRating")}
                                />

                                {/* Score Slider */}
                                <div className="p-4">
                                    <Slider
                                        value={scoreRange}
                                        onValueChange={(val) => {
                                            console.log("ScoreSlider changed:", val);
                                            setScoreRange(val);
                                        }}
                                        min={0}
                                        max={10}
                                        step={0.1}
                                        className="w-full"
                                    />
                                    <p className="text-white text-sm mt-2">Score: {scoreRange[0]} – {scoreRange[1]}</p>
                                </div>
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
                                {isAuthenticated && (
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
                                )}
                                {/* To Year */}
                                <div className="w-full">
                                    <Input
                                        placeholder="To Year"
                                        value={toYear}
                                        onChange={(e) => setToYear(e.target.value)}
                                        maxLength={4}
                                        className="h-[37px] bg-movie-card border-none text-black placeholder:text-movie-text/70"
                                    />
                                </div>

                                {/* Streaming Services Dropdown */}
                                <DropdownButton
                                    label="Streaming services"
                                    isOpen={dropdowns.streaming}
                                    onClick={() => toggleDropdown("streaming")}
                                />

                                {/* Runtime Slider */}
                                <div className="p-4">
                                    <Slider
                                        value={runtimeRange}
                                        onValueChange={(val) => {
                                            console.log("RuntimeSlider changed:", val);
                                            setRuntimeRange(val);
                                        }}
                                        min={0}
                                        max={360}
                                        step={5}
                                        className="w-full"
                                    />
                                    <p className="text-white text-sm mt-2">Runtime: {runtimeRange[0]} – {runtimeRange[1]}</p>
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