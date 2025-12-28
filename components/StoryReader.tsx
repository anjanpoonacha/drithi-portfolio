"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";

import { DecorativeBorder } from "@/components/DecorativeBorder";
import { FadeInSection } from "@/components/FadeInSection";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/types";

interface StoryReaderProps {
  story: Story;
}

export function StoryReader({ story }: StoryReaderProps) {
  const [imageError, setImageError] = React.useState(false);
  
  // Split story text into paragraphs
  const paragraphs = React.useMemo(() => {
    // Split by double newline or single newline
    const parts = story.story.split(/\n\n|\n/).filter((p) => p.trim().length > 0);
    return parts;
  }, [story.story]);

  return (
    <article className="w-full">
      <DecorativeBorder variant="soft" showAnimation={true} className="p-6 md:p-12">
        {/* Character Photo */}
        <FadeInSection className="flex justify-center mb-8 md:mb-12">
          <div className="relative w-full max-w-[400px] md:w-[400px]">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-purple-200 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 pointer-events-none z-10" />
              {!imageError ? (
                <Image
                  src={story.characterPhoto}
                  alt={`${story.title} character illustration`}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 80vw, 400px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                  <svg
                    className="w-32 h-32 text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
              )}
              <div
                className="absolute inset-0 shadow-[inset_0_0_40px_rgba(155,89,182,0.3)] pointer-events-none z-20"
                aria-hidden="true"
              />
            </div>
          </div>
        </FadeInSection>

        {/* Story Content */}
        <div className="max-w-[65ch] mx-auto space-y-6">
          {/* Title and Author */}
          <FadeInSection delay={0.2} className="text-center space-y-3">
            <h1
              className={cn(
                "text-4xl md:text-5xl font-pacifico",
                "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent",
                "leading-tight"
              )}
            >
              {story.title}
            </h1>
            <p className="text-purple-700 text-lg font-medium">By {story.author}</p>
          </FadeInSection>

          {/* Category Badges */}
          <FadeInSection delay={0.3} className="flex flex-wrap justify-center gap-2">
            {story.labels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
              >
                {label}
              </Badge>
            ))}
          </FadeInSection>

          {/* Story Text */}
          <div className="prose prose-purple max-w-none pt-6">
            {paragraphs.map((paragraph, index) => (
              <FadeInSection
                key={index}
                delay={0.4 + index * 0.1}
                className="mb-6 last:mb-0"
              >
                <p
                  className={cn(
                    "text-gray-700 text-base md:text-lg leading-relaxed",
                    "first-letter:text-5xl first-letter:font-pacifico first-letter:text-purple-600",
                    "first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:mt-1"
                  )}
                >
                  {paragraph}
                </p>
              </FadeInSection>
            ))}
          </div>

          {/* Thank You Section */}
          <FadeInSection delay={0.6 + paragraphs.length * 0.1}>
            <Separator className="my-8 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            
            <div
              className={cn(
                "relative overflow-hidden rounded-xl p-6 md:p-8",
                "bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50",
                "border-2 border-purple-200",
                "text-center space-y-4"
              )}
            >
              {/* Animated background glow */}
              <div
                className={cn(
                  "absolute inset-0 opacity-50",
                  "bg-gradient-to-br from-purple-200/30 via-pink-200/30 to-purple-200/30",
                  "animate-pulse"
                )}
                aria-hidden="true"
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icons */}
                <div className="flex justify-center items-center gap-3 mb-3">
                  <Heart
                    className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse"
                    aria-hidden="true"
                  />
                  <Sparkles
                    className="w-7 h-7 text-purple-500 fill-purple-500"
                    aria-hidden="true"
                  />
                  <Heart
                    className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                    aria-hidden="true"
                  />
                </div>

                {/* Heading */}
                <h2
                  className={cn(
                    "text-2xl md:text-3xl font-pacifico",
                    "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  )}
                >
                  Thank You for Reading!
                </h2>

                {/* Message */}
                <p className="text-purple-700 text-base md:text-lg font-medium">
                  I hope you enjoyed this story!
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </DecorativeBorder>
    </article>
  );
}

StoryReader.displayName = "StoryReader";
