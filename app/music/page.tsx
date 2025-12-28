import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Music | Drithi Sparkle",
  description: "Listen to my favorite music while reading stories",
};

/**
 * Music Page
 * Redirects to home page where music player is available globally
 */
export default function MusicPage() {
  // Redirect to home page where the music player is accessible
  redirect("/");
}
