"use client";

import * as React from "react";
import type { Story } from "@/lib/types";
import { filterStories } from "@/lib/utils";
import { CherryBlossomBackground } from "@/components/CherryBlossomBackground";
import { FadeInSection } from "@/components/FadeInSection";
import { BooksFilter } from "@/components/BooksFilter";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface BooksListClientProps {
  stories: Story[];
  categories: string[];
}

export function BooksListClient({
  stories,
  categories,
}: BooksListClientProps) {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );

  const filteredStories = React.useMemo(
    () => filterStories(stories, searchQuery, selectedCategory),
    [stories, searchQuery, selectedCategory]
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== null;

  return (
    <div className="min-h-screen relative">
      <CherryBlossomBackground />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <FadeInSection>
            <div className="text-center mb-12">
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-pacifico bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                style={{
                  lineHeight: 1.3,
                  paddingBottom: '0.2em',
                  overflow: 'visible'
                }}
              >
                Story Library
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Explore magical tales and adventures filled with wonder,
                friendship, and valuable lessons
              </p>
            </div>
          </FadeInSection>

          {/* Filter Section */}
          <FadeInSection delay={0.1}>
            <div className="mb-8">
              <BooksFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
              />
            </div>
          </FadeInSection>

          {/* Results Count */}
          {hasActiveFilters && (
            <FadeInSection delay={0.2}>
              <div className="mb-6 text-center text-gray-600">
                <p>
                  Found{" "}
                  <span className="font-semibold text-purple-600">
                    {filteredStories.length}
                  </span>{" "}
                  {filteredStories.length === 1 ? "story" : "stories"}
                </p>
              </div>
            </FadeInSection>
          )}

          {/* Stories Grid */}
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredStories.map((story, index) => (
                <FadeInSection key={story.id} delay={0.1 * (index % 8)}>
                  <BookCard story={story} index={index} />
                </FadeInSection>
              ))}
            </div>
          ) : (
            /* Empty State */
            <FadeInSection delay={0.2}>
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="mb-6 text-purple-300">
                  <BookOpen className="w-24 h-24" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-3 text-center">
                  No stories found
                </h2>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  {hasActiveFilters
                    ? "Try adjusting your search or filters to discover more magical tales!"
                    : "It looks like there are no stories available at the moment."}
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </FadeInSection>
          )}
        </div>
      </div>
    </div>
  );
}
