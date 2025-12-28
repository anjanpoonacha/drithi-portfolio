/**
 * Custom hook to consume music player context
 * @module hooks/useMusicPlayer
 */

import { useMusicContext } from "@/lib/contexts/MusicContext";

/**
 * Hook to access music player state and actions
 * 
 * Provides access to the music player state and control functions.
 * Must be used within a MusicProvider component.
 * 
 * @returns Music player state and actions
 * @throws Error if used outside MusicProvider
 * 
 * @example
 * ```tsx
 * function MusicControls() {
 *   const { isPlaying, currentTrack, togglePlay, next, previous } = useMusicPlayer();
 *   
 *   return (
 *     <div>
 *       <p>Now playing: {currentTrack?.title}</p>
 *       <button onClick={previous}>Previous</button>
 *       <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
 *       <button onClick={next}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMusicPlayer() {
  return useMusicContext();
}
