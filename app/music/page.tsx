"use client";

import * as React from "react";
import { useMusicPlayer } from "@/lib/hooks/useMusicPlayer";
import { CherryBlossomBackground } from "@/components/CherryBlossomBackground";
import { FadeInSection } from "@/components/FadeInSection";
import { MusicCard } from "@/components/MusicCard";
import { Music as MusicIcon } from "lucide-react";

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
            {playlist.map((track, index) => (
              <FadeInSection key={track.id} delay={0.1 * (index % 6)}>
                <MusicCard
                  track={track}
                  index={index}
                  isCurrentTrack={currentIndex === index}
                  isPlaying={isPlaying}
                  onTrackClick={() => handleTrackClick(index)}
                  imageError={imageErrors.has(track.id)}
                  onImageError={() => handleImageError(track.id)}
                />
              </FadeInSection>
            ))}
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
