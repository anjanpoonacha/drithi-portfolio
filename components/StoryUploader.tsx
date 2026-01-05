"use client";

import * as React from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateImage, formatBytes } from "@/lib/image-optimizer";

interface StoryUploaderProps {
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
}

export function StoryUploader({
  onFilesChange,
  multiple = true,
  accept = "image/jpeg,image/png,image/webp",
  maxFiles = 50,
}: StoryUploaderProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    
    // Validate each file
    for (const file of fileArray) {
      const validation = validateImage(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
    }

    // Check max files
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError("");
    const newFiles = [...files, ...fileArray];
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Generate previews
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-purple-400 hover:bg-purple-50",
          error ? "border-red-400 bg-red-50" : "border-gray-300"
        )}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          JPG, PNG or WebP (max 5MB per file)
        </p>
        {multiple && (
          <p className="text-xs text-gray-500 mt-1">
            Multiple files supported (max {maxFiles})
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                <div className="truncate">{files[index]?.name}</div>
                <div className="text-gray-300">
                  {files[index] && formatBytes(files[index].size)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="text-sm text-gray-600">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

StoryUploader.displayName = "StoryUploader";
