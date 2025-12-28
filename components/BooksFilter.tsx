"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BooksFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
}

export function BooksFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: BooksFilterProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  // Debounced search - update parent after 300ms of no typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sync with parent if searchQuery changes externally
  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const handleCategoryClick = (category: string | null) => {
    if (selectedCategory === category) {
      // Deselect if clicking the same category
      onCategoryChange(null);
    } else {
      onCategoryChange(category);
    }
  };

  return (
    <div
      className={cn(
        "animate-in fade-in-50 duration-500",
        "bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-lg",
        "border border-purple-100"
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-full md:max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <Input
            type="text"
            placeholder="Search stories..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={cn(
              "pl-10 pr-10",
              "border-purple-200 focus:border-purple-500 focus:ring-purple-500/20",
              "transition-all duration-200",
              "focus:shadow-lg focus:shadow-purple-500/10"
            )}
            aria-label="Search stories"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-purple-400 hover:text-purple-600",
                "transition-all duration-200",
                "animate-in fade-in-0 zoom-in-95",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full",
                "p-0.5"
              )}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div
          className={cn(
            "flex flex-wrap gap-2",
            "md:flex-1",
            "overflow-x-auto scrollbar-hide",
            "-mx-4 px-4 md:mx-0 md:px-0"
          )}
          role="group"
          aria-label="Category filters"
        >
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {/* All Categories Option */}
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer select-none whitespace-nowrap",
                "transition-all duration-200",
                "hover:scale-105",
                selectedCategory === null
                  ? "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200 shadow-md"
                  : "border-purple-200 text-purple-600 hover:border-purple-500 hover:bg-purple-50"
              )}
              onClick={() => handleCategoryClick(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCategoryClick(null);
                }
              }}
              aria-pressed={selectedCategory === null}
            >
              All Categories
            </Badge>

            {/* Dynamic Category Pills */}
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={cn(
                  "cursor-pointer select-none whitespace-nowrap",
                  "transition-all duration-200",
                  "hover:scale-105",
                  selectedCategory === category
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                    : "border-purple-200 text-purple-600 hover:border-purple-500 hover:bg-purple-50"
                )}
                onClick={() => handleCategoryClick(category)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCategoryClick(category);
                  }
                }}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
