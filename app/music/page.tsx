"use client";

import * as React from "react";
import { useMusicPlayer } from "@/lib/hooks/useMusicPlayer";
import { CherryBlossomBackground } from "@/components/CherryBlossomBackground";
import { FadeInSection } from "@/components/FadeInSection";
import { AnimatedCard } from "@/components/AnimatedCard";
import { Play, Pause, Music as MusicIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Music Page
 * Browse and play music tracks with a beautiful gallery view
 */
export default function MusicPage() {
  const {
    playlist,
    currentTrack,
    currentIndex,
    isPlaying,
    selectTrack,
    togglePlay,
  } = useMusicPlayer();

  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTrackClick = (index: number) => {
    if (currentIndex === index) {
      togglePlay();
    } else {
      selectTrack(index);
    }
  };

  const handleImageError = (trackId: string) => {
    setImageErrors(prev => new Set(prev).add(trackId));
  };

  return (
    <div className="min-h-screen relative pt-24">
      <CherryBlossomBackground />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <FadeInSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl sparkle-text mb-4">
                Music Library
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Relaxing melodies to accompany your reading journey
              </p>
            </div>
          </FadeInSection>

          {/* Music Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {playlist.map((track, index) => {
              const isCurrentTrack = currentIndex === index;
              const isCurrentlyPlaying = isCurrentTrack && isPlaying;

              return (
                <FadeInSection key={track.id} delay={0.1 * (index % 6)}>
                  <div
                    onClick={() => handleTrackClick(index)}
                    className="cursor-pointer"
                  >
                    <AnimatedCard
                      hoverScale={1.02}
                      hoverY={-8}
                      className={cn(
                        "group overflow-hidden",
                        "bg-white/80 backdrop-blur-sm",
                        "border-2",
                        isCurrentTrack
                          ? "border-purple-500 shadow-lg shadow-purple-200/50"
                          : "border-transparent hover:border-purple-300"
                      )}
                    >
                      {/* Album Art */}
                      <div className="relative w-full aspect-square overflow-hidden rounded-t-xl bg-gradient-to-br from-purple-100 to-pink-100">
                        {!imageErrors.has(track.id) && track.coverArt ? (
                          <img
                            src={track.coverArt}
                            alt={track.title}
                            className={cn(
                              "object-cover w-full h-full",
                              "transition-transform duration-500 ease-out",
                              "group-hover:scale-105"
                            )}
                            onError={() => handleImageError(track.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MusicIcon className="w-24 h-24 text-purple-300" />
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
                          <div className="p-4 rounded-full bg-white/90 shadow-xl">
                            {isCurrentlyPlaying ? (
                              <Pause
                                className="h-8 w-8 text-purple-600"
                                fill="currentColor"
                              />
                            ) : (
                              <Play
                                className="h-8 w-8 text-purple-600"
                                fill="currentColor"
                              />
                            )}
                          </div>
                        </div>

                        {/* Now Playing Indicator */}
                        {isCurrentlyPlaying && (
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-lg animate-pulse">
                            Now Playing
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="p-4 space-y-2">
                        <h3
                          className={cn(
                            "font-semibold text-lg",
                            isCurrentTrack
                              ? "text-purple-600"
                              : "text-purple-900 group-hover:text-purple-600",
                            "transition-colors duration-300",
                            "min-h-[3em]"
                          )}
                          style={{
                            lineHeight: 1.5,
                            paddingBottom: "0.2em",
                            overflow: "visible",
                          }}
                        >
                          {track.title}
                        </h3>

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{track.artist}</span>
                          <span className="text-purple-500 font-medium">
                            {formatDuration(track.duration)}
                          </span>
                        </div>
                      </div>
                    </AnimatedCard>
                  </div>
                </FadeInSection>
              );
            })}
          </div>

          {/* Empty State */}
          {playlist.length === 0 && (
            <FadeInSection delay={0.2}>
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <MusicIcon className="w-24 h-24 text-purple-300 mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-3 text-center">
                  No music available
                </h2>
                <p className="text-gray-500 text-center max-w-md">
                  Check back soon for new tracks to accompany your reading!
                </p>
              </div>
            </FadeInSection>
          )}
        </div>
      </div>
    </div>
  );
}
