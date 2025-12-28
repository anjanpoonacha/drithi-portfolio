"use client";

import * as React from "react";

import type { MusicTrack, MusicPlayerState } from "@/lib/types";

/**
 * Music player context value with state and actions
 */
interface MusicContextValue extends MusicPlayerState {
  /** Play current track */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause */
  togglePlay: () => void;
  /** Skip to next track */
  next: () => void;
  /** Go to previous track */
  previous: () => void;
  /** Adjust volume (0-1) */
  setVolume: (value: number) => void;
  /** Jump to specific track */
  selectTrack: (index: number) => void;
  /** Load new playlist */
  loadPlaylist: (tracks: MusicTrack[]) => void;
}

const MusicContext = React.createContext<MusicContextValue | null>(null);

interface MusicProviderProps {
  children: React.ReactNode;
}

const VOLUME_STORAGE_KEY = "drithi-music-player-volume";
const DEFAULT_VOLUME = 0.7;

/**
 * MusicProvider component - wraps app to provide music player state
 */
export function MusicProvider({ children }: MusicProviderProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Initialize volume from localStorage
  const getInitialVolume = (): number => {
    if (typeof window === "undefined") return DEFAULT_VOLUME;
    try {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Failed to load volume from localStorage:", error);
    }
    return DEFAULT_VOLUME;
  };

  const [state, setState] = React.useState<MusicPlayerState>({
    currentTrack: null,
    isPlaying: false,
    volume: getInitialVolume(),
    playlist: [],
    currentIndex: -1,
  });

  // Initialize audio element
  React.useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    // Handle track end - auto-play next
    const handleEnded = () => {
      next();
    };

    audio.addEventListener("ended", handleEnded);

    // Cleanup on unmount
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update audio source when track changes
  React.useEffect(() => {
    if (!audioRef.current) return;

    if (state.currentTrack) {
      audioRef.current.src = state.currentTrack.filePath;
      if (state.isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Failed to play audio:", error);
          setState((prev) => ({ ...prev, isPlaying: false }));
        });
      }
    } else {
      audioRef.current.src = "";
      audioRef.current.pause();
    }
  }, [state.currentTrack, state.isPlaying]);

  // Update audio volume when volume changes
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Persist volume to localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(VOLUME_STORAGE_KEY, state.volume.toString());
      } catch (error) {
        console.error("Failed to save volume to localStorage:", error);
      }
    }
  }, [state.volume]);

  const play = React.useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;

    audioRef.current.play().catch((error) => {
      console.error("Failed to play audio:", error);
      setState((prev) => ({ ...prev, isPlaying: false }));
    });

    setState((prev) => ({ ...prev, isPlaying: true }));
  }, [state.currentTrack]);

  const pause = React.useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = React.useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const next = React.useCallback(() => {
    if (state.playlist.length === 0) return;

    const nextIndex = (state.currentIndex + 1) % state.playlist.length;
    const nextTrack = state.playlist[nextIndex];

    if (!nextTrack) return;

    setState((prev) => ({
      ...prev,
      currentTrack: nextTrack,
      currentIndex: nextIndex,
      isPlaying: true,
    }));
  }, [state.playlist, state.currentIndex]);

  const previous = React.useCallback(() => {
    if (state.playlist.length === 0) return;

    const prevIndex =
      state.currentIndex <= 0
        ? state.playlist.length - 1
        : state.currentIndex - 1;
    const prevTrack = state.playlist[prevIndex];

    if (!prevTrack) return;

    setState((prev) => ({
      ...prev,
      currentTrack: prevTrack,
      currentIndex: prevIndex,
      isPlaying: true,
    }));
  }, [state.playlist, state.currentIndex]);

  const setVolume = React.useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setState((prev) => ({ ...prev, volume: clampedValue }));
  }, []);

  const selectTrack = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= state.playlist.length) {
        console.warn(`Invalid track index: ${index}`);
        return;
      }

      const track = state.playlist[index];
      if (!track) return;

      setState((prev) => ({
        ...prev,
        currentTrack: track,
        currentIndex: index,
        isPlaying: true,
      }));
    },
    [state.playlist]
  );

  const loadPlaylist = React.useCallback((tracks: MusicTrack[]) => {
    if (tracks.length === 0) {
      setState({
        currentTrack: null,
        isPlaying: false,
        volume: state.volume,
        playlist: [],
        currentIndex: -1,
      });
      return;
    }

    const firstTrack = tracks[0];
    if (!firstTrack) return;

    setState((prev) => ({
      ...prev,
      playlist: tracks,
      currentTrack: firstTrack,
      currentIndex: 0,
      isPlaying: false,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: MusicContextValue = {
    ...state,
    play,
    pause,
    togglePlay,
    next,
    previous,
    setVolume,
    selectTrack,
    loadPlaylist,
  };

  // Load playlist from music.json on mount
  React.useEffect(() => {
    const loadMusicData = async () => {
      try {
        const response = await fetch("/data/music.json");
        if (!response.ok) {
          throw new Error("Failed to load music data");
        }
        const tracks: MusicTrack[] = await response.json();
        loadPlaylist(tracks);
      } catch (error) {
        console.error("Failed to load music playlist:", error);
      }
    };

    loadMusicData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

/**
 * Access music player context
 * @throws Error if used outside MusicProvider
 */
export function useMusicContext(): MusicContextValue {
  const context = React.useContext(MusicContext);

  if (!context) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }

  return context;
}
