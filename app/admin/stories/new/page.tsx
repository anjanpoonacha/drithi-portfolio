"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StoryUploader } from "@/components/StoryUploader";
import type { StoryContentType } from "@/lib/types";

export default function NewStoryPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  
  // Form state
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("Drithi");
  const [description, setDescription] = React.useState("");
  const [contentType, setContentType] = React.useState<StoryContentType>("text");
  const [labels, setLabels] = React.useState<string[]>([]);
  const [labelInput, setLabelInput] = React.useState("");
  const [featured, setFeatured] = React.useState(false);
  
  // Content state
  const [storyText, setStoryText] = React.useState("");
  const [coverImage, setCoverImage] = React.useState<File | null>(null);
  const [characterPhoto, setCharacterPhoto] = React.useState<File | null>(null);
  const [storyPages, setStoryPages] = React.useState<File[]>([]);
  
  // Password (stored from admin login)
  const [password, setPassword] = React.useState("");

  const addLabel = () => {
    if (labelInput && !labels.includes(labelInput)) {
      setLabels([...labels, labelInput]);
      setLabelInput("");
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("description", description);
      formData.append("contentType", contentType);
      formData.append("labels", JSON.stringify(labels));
      formData.append("featured", String(featured));

      if (contentType === "text") {
        formData.append("storyContent", storyText);
      } else if (contentType === "images") {
        storyPages.forEach((file) => {
          formData.append("pages", file);
        });
      }

      if (coverImage) formData.append("coverImage", coverImage);
      if (characterPhoto) formData.append("characterPhoto", characterPhoto);

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/stories");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create story");
      }
    } catch (err) {
      setError("An error occurred while creating the story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Add New Story</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Admin Password *
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Story Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Great Adventure"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Author
              </label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Drithi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your story..."
                className="w-full px-3 py-2 border rounded-lg min-h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Labels/Categories
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
                  placeholder="Adventure, Magic, etc."
                />
                <Button type="button" onClick={addLabel}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <Badge key={label} className="cursor-pointer" onClick={() => removeLabel(label)}>
                    {label} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured Story
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Type</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="text"
                  checked={contentType === "text"}
                  onChange={(e) => setContentType(e.target.value as StoryContentType)}
                  className="w-4 h-4"
                />
                <span>Typed Text</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="images"
                  checked={contentType === "images"}
                  onChange={(e) => setContentType(e.target.value as StoryContentType)}
                  className="w-4 h-4"
                />
                <span>Handwritten Pages</span>
              </label>
            </div>

            {contentType === "text" ? (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Text *
                </label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Once upon a time..."
                  className="w-full px-3 py-2 border rounded-lg min-h-64 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Story Pages *
                </label>
                <StoryUploader onFilesChange={setStoryPages} />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Image
              </label>
              <StoryUploader
                onFilesChange={(files) => setCoverImage(files[0] || null)}
                multiple={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Character Photo
              </label>
              <StoryUploader
                onFilesChange={(files) => setCharacterPhoto(files[0] || null)}
                multiple={false}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Story"}
          </Button>
        </div>
      </form>
    </div>
  );
}
