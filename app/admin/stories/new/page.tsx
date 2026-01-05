"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
                  Upload Story Pages *
                </Label>
                <StoryUploader onFilesChange={setStoryPages} />
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
              <StoryUploader
                onFilesChange={(files) => setCoverImage(files[0] || null)}
                multiple={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="character-photo">
                Character Photo
              </Label>
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
