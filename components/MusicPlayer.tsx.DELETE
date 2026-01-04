"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  List,
  Music,
} from "lucide-react";

import { useMusicPlayer } from "@/lib/hooks/useMusicPlayer";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  className?: string;
}

/**
 * MusicPlayer Component
 * 
 * A beautiful, persistent music player with full controls.
 * Features:
 * - Compact and expanded modes
 * - Playback controls (play, pause, next, previous)
 * - Volume control with mute
 * - Progress bar with seek
 * - Playlist view
 * - Keyboard shortcuts
 * - Glass-morphism design
 */
export function MusicPlayer({ className }: MusicPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    volume,
    playlist,
    currentIndex,
    play,
    pause,
    togglePlay,
    next,
    previous,
    setVolume,
    selectTrack,
  } = useMusicPlayer();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showPlaylist, setShowPlaylist] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [previousVolume, setPreviousVolume] = React.useState(volume);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Mount animation
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get audio element from context (via DOM)
  React.useEffect(() => {
    // Find the audio element created by MusicContext
    const audioElements = document.getElementsByTagName("audio");
    if (audioElements.length > 0) {
      audioRef.current = audioElements[0] as HTMLAudioElement;
    }
  }, []);

  // Update progress bar
  React.useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);

    // Initial update
    updateTime();
    updateDuration();

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
    };
  }, [currentTrack]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          previous();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [togglePlay, next, previous, volume, setVolume]);

  // Mute/unmute logic
  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(previousVolume || 0.7);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Seek to position
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current && newTime !== undefined) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = (value[0] ?? 0.7) / 100;
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Don't render if no track loaded
  if (!currentTrack || playlist.length === 0) {
    return null;
  }

  // Compact mode
  if (!isExpanded) {
    return (
      <AnimatePresence>
        {isMounted && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-4 right-4 z-40",
              "md:bottom-4 md:right-4",
              className
            )}
          >
            <motion.button
              onClick={() => setIsExpanded(true)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-full",
                "bg-white/80 backdrop-blur-lg shadow-2xl",
                "border border-purple-200/50",
                "hover:bg-white/90 hover:shadow-purple-200/50 hover:shadow-xl",
                "transition-all duration-300",
                "group"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Expand music player"
            >
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{
                  duration: 3,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "linear",
                }}
                className="flex-shrink-0"
              >
                <Music className="h-5 w-5 text-purple-600" />
              </motion.div>
              
              <div className="flex flex-col items-start min-w-0 max-w-[150px]">
                <span className="text-sm font-medium text-purple-900 truncate w-full">
                  {currentTrack.title}
                </span>
                <span className="text-xs text-purple-600 truncate w-full">
                  {currentTrack.artist}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="flex-shrink-0 p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" fill="currentColor" />
                ) : (
                  <Play className="h-4 w-4" fill="currentColor" />
                )}
              </button>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Expanded mode
  return (
    <AnimatePresence>
      {isMounted && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-4 right-4 z-40",
            "w-[90vw] max-w-[320px]",
            "md:w-[320px]",
            className
          )}
        >
          <div
            className={cn(
              "relative rounded-2xl overflow-hidden",
              "bg-white/80 backdrop-blur-lg shadow-2xl",
              "border border-purple-200/50"
            )}
          >
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-white/50 pointer-events-none" />

            <div className="relative p-6 space-y-4">
              {/* Header with minimize button */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {currentTrack.coverArt && (
                    <div className="mb-4 relative">
                      <img
                        src={currentTrack.coverArt}
                        alt={currentTrack.title}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-purple-900/20 to-transparent" />
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-purple-900 truncate">
                    {currentTrack.title}
                  </h3>
                  <p className="text-sm text-purple-600 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex-shrink-0 ml-2 p-2 rounded-full hover:bg-purple-100 transition-colors"
                  aria-label="Minimize player"
                >
                  <Minimize2 className="h-4 w-4 text-purple-600" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                  aria-label="Seek position"
                />
                <div className="flex justify-between text-xs text-purple-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={previous}
                  className="p-3 rounded-full hover:bg-purple-100 transition-colors"
                  disabled={playlist.length <= 1}
                  aria-label="Previous track"
                >
                  <SkipBack className="h-5 w-5 text-purple-600" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" fill="currentColor" />
                  ) : (
                    <Play className="h-6 w-6" fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={next}
                  className="p-3 rounded-full hover:bg-purple-100 transition-colors"
                  disabled={playlist.length <= 1}
                  aria-label="Next track"
                >
                  <SkipForward className="h-5 w-5 text-purple-600" />
                </button>

                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={cn(
                    "p-3 rounded-full transition-colors",
                    showPlaylist
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-purple-100 text-purple-600"
                  )}
                  aria-label="Toggle playlist"
                  aria-expanded={showPlaylist}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Volume control */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMuteToggle}
                  className="p-2 rounded-full hover:bg-purple-100 transition-colors flex-shrink-0"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-purple-600" />
                  )}
                </button>
                
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                  aria-label="Volume control"
                />
                
                <span className="text-xs text-purple-600 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Playlist */}
              <AnimatePresence>
                {showPlaylist && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-purple-200/50">
                      <h4 className="text-sm font-semibold text-purple-900 mb-2">
                        Playlist ({playlist.length} {playlist.length === 1 ? "track" : "tracks"})
                      </h4>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
                        {playlist.map((track, index) => (
                          <button
                            key={track.id}
                            onClick={() => selectTrack(index)}
                            className={cn(
                              "w-full text-left p-2 rounded-lg transition-colors",
                              "hover:bg-purple-100",
                              index === currentIndex
                                ? "bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200"
                                : "border border-transparent"
                            )}
                            aria-label={`Play ${track.title} by ${track.artist}`}
                            aria-current={index === currentIndex ? "true" : "false"}
                          >
                            <div className="flex items-center gap-2">
                              {index === currentIndex && isPlaying ? (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <Music className="h-3 w-3 text-purple-600" />
                                </motion.div>
                              ) : (
                                <div className="h-3 w-3" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-purple-900 truncate">
                                  {track.title}
                                </p>
                                <p className="text-xs text-purple-600 truncate">
                                  {track.artist}
                                </p>
                              </div>
                              <span className="text-xs text-purple-500">
                                {formatTime(track.duration)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cherry blossom decoration */}
              <div className="absolute top-2 right-2 opacity-20 pointer-events-none">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="2" fill="#ec4899" />
                  <circle cx="12" cy="6" r="3" fill="#ec4899" opacity="0.6" />
                  <circle cx="17" cy="9" r="3" fill="#ec4899" opacity="0.6" />
                  <circle cx="17" cy="15" r="3" fill="#ec4899" opacity="0.6" />
                  <circle cx="12" cy="18" r="3" fill="#ec4899" opacity="0.6" />
                  <circle cx="7" cy="15" r="3" fill="#ec4899" opacity="0.6" />
                  <circle cx="7" cy="9" r="3" fill="#ec4899" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
