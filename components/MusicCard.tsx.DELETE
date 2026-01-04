"use client";

import * as React from "react";
import { AnimatedCard } from "@/components/AnimatedCard";
import { Play, Pause, Music as MusicIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MusicTrack } from "@/lib/types";

interface MusicCardProps {
  track: MusicTrack;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onTrackClick: () => void;
  imageError: boolean;
  onImageError: () => void;
}

const MusicCard = React.forwardRef<HTMLDivElement, MusicCardProps>(
  ({ track, index, isCurrentTrack, isPlaying, onTrackClick, imageError, onImageError }, ref) => {
    const isCurrentlyPlaying = isCurrentTrack && isPlaying;
    
    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div ref={ref} onClick={onTrackClick} className="cursor-pointer">
        <AnimatedCard
          initialDelay={0.1 * (index % 6)}
          hoverScale={1.02}
          hoverY={-8}
          className={cn(
            "group overflow-hidden",
            "bg-white/80 backdrop-blur-sm",
            "border-2",
            isCurrentTrack
              ? "border-purple-500 shadow-lg shadow-purple-200/50"
              : "border-transparent hover:border-purple-300",
            "flex flex-row sm:flex-col",
            "h-auto sm:h-full"
          )}
        >
        {/* Album Art */}
        <div className="relative w-24 sm:w-full h-32 sm:aspect-square sm:h-auto overflow-hidden rounded-l-xl sm:rounded-l-none sm:rounded-t-xl bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0">
          {!imageError && track.coverArt ? (
            <img
              src={track.coverArt}
              alt={track.title}
              className={cn(
                "object-cover w-full h-full",
                "transition-transform duration-500 ease-out",
                "group-hover:scale-105"
              )}
              onError={onImageError}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <MusicIcon className="w-12 sm:w-24 h-12 sm:h-24 text-purple-300" />
            </div>
          )}

          {/* Play/Pause Overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/40 backdrop-blur-sm",
              "transition-opacity duration-300",
              isCurrentlyPlaying
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            <div className="p-3 sm:p-4 rounded-full bg-white/90 shadow-xl">
              {isCurrentlyPlaying ? (
                <Pause
                  className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600"
                  fill="currentColor"
                />
              ) : (
                <Play
                  className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600"
                  fill="currentColor"
                />
              )}
            </div>
          </div>

          {/* Now Playing Indicator */}
          {isCurrentlyPlaying && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-lg animate-pulse">
              Now Playing
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2 flex-1 flex flex-col justify-between">
          <h3
            className={cn(
              "font-semibold text-sm sm:text-lg",
              isCurrentTrack
                ? "text-purple-600"
                : "text-purple-900 group-hover:text-purple-600",
              "transition-colors duration-300",
              "line-clamp-2 sm:min-h-[3em]"
            )}
            style={{
              lineHeight: 1.5,
              paddingBottom: "0.2em",
              overflow: "hidden",
            }}
            title={track.title}
          >
            {track.title}
          </h3>

          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <span className="truncate flex-1">{track.artist}</span>
            <span className="text-purple-500 font-medium ml-2 flex-shrink-0">
              {formatDuration(track.duration)}
            </span>
          </div>
        </div>
        </AnimatedCard>
      </div>
    );
  }
);

MusicCard.displayName = "MusicCard";

export { MusicCard };
export type { MusicCardProps };
