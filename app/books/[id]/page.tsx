/**
 * Individual Story Page (Dynamic Route)
 * Server Component with static generation for all stories
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getStoryById,
  getAllStories,
  getNextStory,
  getPreviousStory,
} from "@/lib/stories";
import { CherryBlossomBackground } from "@/components/CherryBlossomBackground";
import { StoryReader } from "@/components/StoryReader";
import { StoryNavigation } from "@/components/StoryNavigation";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Generate static params for all stories at build time
 * Enables Static Site Generation (SSG) for all story pages
 */
export async function generateStaticParams() {
  const stories = await getAllStories();
  return stories.map((story) => ({
    id: story.id,
  }));
}

/**
 * Generate metadata for SEO and social sharing
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    return {
      title: "Story Not Found | Drithi Sparkle",
      description: "The story you are looking for could not be found.",
    };
  }

  return {
    title: `${story.title} | Drithi Sparkle`,
    description: story.description,
    openGraph: {
      title: story.title,
      description: story.description,
      images: [
        {
          url: story.coverImage,
          alt: story.title,
        },
      ],
      type: "article",
      authors: [story.author],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description,
      images: [story.coverImage],
    },
  };
}

/**
 * Individual Story Page Component
 * Displays full story with navigation to previous/next stories
 */
export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  
  // Fetch current story
  const story = await getStoryById(id);

  // Handle 404 if story not found
  if (!story) {
    notFound();
  }

  // Fetch adjacent stories for navigation
  const previousStory = await getPreviousStory(id);
  const nextStory = await getNextStory(id);

  return (
    <>
      {/* Cherry Blossom Background */}
      <CherryBlossomBackground />

      {/* Main Content */}
      <div className="min-h-screen py-12 px-4 pb-32">
        <article className="max-w-4xl mx-auto">
          <StoryReader story={story} />
        </article>
      </div>

      {/* Fixed Bottom Navigation */}
      <StoryNavigation
        previousStory={previousStory}
        nextStory={nextStory}
        currentStoryId={story.id}
      />
    </>
  );
}
