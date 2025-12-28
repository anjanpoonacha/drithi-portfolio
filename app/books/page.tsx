import type { Metadata } from "next";
import { getAllStories, getAllCategories } from "@/lib/stories";
import { BooksListClient } from "@/components/BooksListClient";

export const metadata: Metadata = {
  title: "Story Library | Drithi's Magical Tales",
  description:
    "Explore Drithi's collection of magical stories filled with adventure, friendship, and valuable life lessons. Browse by category or search for your favorite tales.",
  openGraph: {
    title: "Story Library | Drithi's Magical Tales",
    description:
      "Explore Drithi's collection of magical stories filled with adventure, friendship, and valuable life lessons.",
    type: "website",
  },
};

export default async function BooksPage() {
  const stories = await getAllStories();
  const categories = await getAllCategories();

  return <BooksListClient stories={stories} categories={categories} />;
}
