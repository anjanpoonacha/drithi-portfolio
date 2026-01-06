"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Image as ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Story } from "@/lib/types";

export default function AdminStoriesPage() {
  const [stories, setStories] = React.useState<Story[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [storageStats, setStorageStats] = React.useState<{
    totalSizeFormatted: string;
    maxSizeFormatted: string;
    percentUsed: number;
    fileCount: number;
    warning?: string;
  } | null>(null);
  const [password, setPassword] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [storyToDelete, setStoryToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchStories();
      fetchStorageStats();
    }
  }, [isAuthenticated]);

  const fetchStories = async () => {
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      const res = await fetch("/api/admin/storage-stats");
      const data = await res.json();
      setStorageStats(data);
    } catch (error) {
      console.error("Failed to fetch storage stats:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setStoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;

    try {
      const res = await fetch(`/api/stories/${storyToDelete}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password,
        },
      });

      if (res.ok) {
        setStories(stories.filter((s) => s.id !== storyToDelete));
        fetchStorageStats();
        toast.success("Story deleted successfully");
      } else {
        toast.error("Failed to delete story");
      }
    } catch (error) {
      toast.error("Error deleting story");
    } finally {
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple client-side check - real auth happens on API
    if (password) {
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Story Management</h1>
          <p className="text-gray-600 mt-1">{stories.length} total stories</p>
        </div>
        <Link href="/admin/stories/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Story
          </Button>
        </Link>
      </div>

      {/* Storage Stats */}
      {storageStats && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-lg font-semibold mb-4">Storage Usage</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Used: {storageStats.totalSizeFormatted}</span>
              <span className="text-gray-600">
                of {storageStats.maxSizeFormatted}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  storageStats.percentUsed > 90
                    ? "bg-red-500"
                    : storageStats.percentUsed > 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(storageStats.percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{storageStats.fileCount} files</span>
              <span>{storageStats.percentUsed.toFixed(1)}% used</span>
            </div>
            {storageStats.warning && (
              <div className="text-yellow-700 text-sm mt-2 p-2 bg-yellow-100 rounded">
                {storageStats.warning}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Story List */}
      {loading ? (
        <div className="text-center py-12">Loading stories...</div>
      ) : stories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No stories yet</p>
          <Link href="/admin/stories/new">
            <Button>Create Your First Story</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              {story.coverImage && (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                {/* Title and Type */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{story.title}</h3>
                  {story.contentType === "images" ? (
                    <ImageIcon className="h-5 w-5 text-purple-600 flex-shrink-0 ml-2" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Author and Labels */}
                <p className="text-sm text-gray-600 mb-3">by {story.author}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {story.labels.slice(0, 3).map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {story.labels.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{story.labels.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  {story.metadata?.imageCount && (
                    <div>{story.metadata.imageCount} pages</div>
                  )}
                  <div>
                    Created {new Date(story.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/admin/stories/${story.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(story.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the story. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
