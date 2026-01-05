"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { StoryUploader } from "@/components/StoryUploader";
import type { Story, StoryContentType } from "@/lib/types";

interface EditStoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditStoryPage({ params }: EditStoryPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [story, setStory] = React.useState<Story | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
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

  React.useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const res = await fetch(`/api/stories/${resolvedParams.id}`);
      const data = await res.json();
      if (data.story) {
        const fetchedStory = data.story as Story;
        setStory(fetchedStory);
        
        // Pre-fill form fields
        setTitle(fetchedStory.title);
        setAuthor(fetchedStory.author);
        setDescription(fetchedStory.description);
        setContentType(fetchedStory.contentType);
        setLabels(fetchedStory.labels);
        setFeatured(fetchedStory.featured || false);
        
        if (fetchedStory.contentType === "text" && fetchedStory.story) {
          setStoryText(fetchedStory.story);
        }
      } else {
        setError("Story not found");
      }
    } catch (err) {
      setError("Failed to load story");
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

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
      } else if (contentType === "images" && storyPages.length > 0) {
        storyPages.forEach((file) => {
          formData.append("pages", file);
        });
      }

      if (coverImage) formData.append("coverImage", coverImage);
      if (characterPhoto) formData.append("characterPhoto", characterPhoto);

      const res = await fetch(`/api/stories/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "x-admin-password": password,
        },
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/stories");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update story");
      }
    } catch (err) {
      setError("An error occurred while updating the story");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center py-12">Loading story...</div>
      </div>
    );
  }

  if (error && !story) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Edit Story</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">
                Admin Password *
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-title">
                Story Title *
              </Label>
              <Input
                id="story-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Great Adventure"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">
                Author
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Drithi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your story..."
                className="min-h-24"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="label-input">
                Labels/Categories
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="label-input"
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setFeatured(checked === true)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Story
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Type</h2>
          
          <div className="space-y-4">
            <RadioGroup
              value={contentType}
              onValueChange={(value) => setContentType(value as StoryContentType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="content-text" />
                <Label htmlFor="content-text" className="cursor-pointer">
                  Typed Text
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="images" id="content-images" />
                <Label htmlFor="content-images" className="cursor-pointer">
                  Handwritten Pages
                </Label>
              </div>
            </RadioGroup>

            {contentType === "text" ? (
              <div className="space-y-2">
                <Label htmlFor="story-text">
                  Story Text *
                </Label>
                <Textarea
                  id="story-text"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Once upon a time..."
                  className="min-h-64 font-mono"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="story-pages">
                  Upload New Story Pages (optional)
                </Label>
                <p className="text-sm text-gray-600">
                  Leave empty to keep existing pages. Upload new pages to replace them.
                </p>
                <StoryUploader onFilesChange={setStoryPages} />
                {story?.metadata?.imageCount && (
                  <p className="text-sm text-gray-500 mt-2">
                    Current: {story.metadata.imageCount} pages
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover-image">
                Cover Image
              </Label>
              <p className="text-sm text-gray-600">
                Leave empty to keep existing image
              </p>
              <StoryUploader
                onFilesChange={(files) => setCoverImage(files[0] || null)}
                multiple={false}
              />
              {story?.coverImage && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Current cover:</p>
                  <img
                    src={story.coverImage}
                    alt="Current cover"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="character-photo">
                Character Photo
              </Label>
              <p className="text-sm text-gray-600">
                Leave empty to keep existing image
              </p>
              <StoryUploader
                onFilesChange={(files) => setCharacterPhoto(files[0] || null)}
                multiple={false}
              />
              {story?.characterPhoto && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Current character photo:</p>
                  <img
                    src={story.characterPhoto}
                    alt="Current character"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
