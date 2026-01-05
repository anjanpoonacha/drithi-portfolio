"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HandwrittenViewerProps {
  pages: string[];
  title: string;
}

export function HandwrittenViewer({ pages, title }: HandwrittenViewerProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
      if (e.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No pages available for this story.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page viewer */}
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-lg overflow-hidden",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
      >
        <div className="relative aspect-[3/4] md:aspect-[4/5]">
          <Image
            src={pages[currentPage] || ""}
            alt={`${title} - Page ${currentPage + 1}`}
            fill
            className="object-contain"
            priority={currentPage === 0}
          />
        </div>

        {/* Navigation overlay */}
        <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
          <Button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="pointer-events-auto"
            variant="secondary"
            size="icon"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
            className="pointer-events-auto"
            variant="secondary"
            size="icon"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Page counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          Page {currentPage + 1} of {pages.length}
        </div>

        {/* Fullscreen button */}
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4"
          variant="secondary"
          size="icon"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={cn(
              "relative flex-shrink-0 w-20 h-28 rounded border-2 overflow-hidden transition-all",
              currentPage === index
                ? "border-purple-500 ring-2 ring-purple-200"
                : "border-gray-300 hover:border-purple-300"
            )}
          >
            <Image
              src={page}
              alt={`Page ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs text-center py-0.5">
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

HandwrittenViewer.displayName = "HandwrittenViewer";
