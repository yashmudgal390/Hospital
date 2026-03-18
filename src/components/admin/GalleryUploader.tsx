"use client";

import { useState, useCallback } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface GalleryUploaderProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  folder?: string;
  className?: string;
  defaultImage?: string | null;
}

export function GalleryUploader({ 
  onUploadSuccess, 
  folder = "clinic",
  className = "",
  defaultImage 
}: GalleryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    // Set local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Image uploaded successfully");
      onUploadSuccess(data.url, data.publicId);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to upload image.");
      setPreview(defaultImage || null); // Revert on failure
    } finally {
      setIsUploading(false);
    }
  }, [folder, onUploadSuccess, defaultImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className={`w-full ${className}`}>
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-brand-50 shadow-sm group">
          <img 
            src={preview} 
            alt="Preview" 
            className={`w-full h-auto object-cover max-h-64 ${isUploading ? 'opacity-50 grayscale' : ''}`}
          />
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <span className="text-sm font-medium text-white">Uploading...</span>
            </div>
          )}
          {!isUploading && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                className="h-8 w-8 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  onUploadSuccess("", ""); // clear the parent form field
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            hover:bg-brand-50 hover:border-brand-primary/50 group
            ${isDragActive ? 'border-brand-primary bg-brand-50 scale-[1.02]' : 'border-brand-border/80'}
          `}
        >
          <input {...getInputProps()} />
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-brand-100 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="text-brand-text font-medium mb-1">
            {isDragActive ? "Drop image here..." : "Drag & drop an image, or click to select"}
          </p>
          <p className="text-xs text-brand-muted">
            Supports JPG, PNG, WEBP (Max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
