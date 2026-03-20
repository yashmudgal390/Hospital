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
  id?: string;
}

export function GalleryUploader({ 
  onUploadSuccess, 
  folder = "clinic",
  className = "",
  defaultImage,
  id
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
      console.error("[GalleryUploader Error]:", error);
      let errorMessage = "Failed to upload image.";
      
      try {
        // Attempt to parse if the error is a JSON string from res.text()
        const parsed = JSON.parse(error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        // Not JSON, use the raw message if it exists
        if (error.message) errorMessage = error.message;
      }

      toast.error(errorMessage);
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
        <div className="space-y-4">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
              hover:bg-brand-50 hover:border-brand-primary/50 group
              ${isDragActive ? 'border-brand-primary bg-brand-50 scale-[1.02]' : 'border-brand-border/80'}
            `}
          >
            <input {...getInputProps()} id={id || "gallery-upload-input"} aria-label="Upload image" />
            <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-brand-100 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-brand-text text-sm font-medium mb-1">
              {isDragActive ? "Drop image here..." : "Drag & drop or Click to upload"}
            </p>
            <p className="text-[10px] text-brand-muted">
              JPG, PNG, WEBP (Max 5MB)
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-brand-muted font-medium">Or Use External Link</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
              <label htmlFor="external-url-input" className="sr-only">External Image URL</label>
              <input 
                id="external-url-input"
                name="external-url"
                type="text"
                placeholder="https://example.com/photo.jpg"
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-brand-border text-xs focus:ring-1 focus:ring-brand-primary outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const url = (e.target as HTMLInputElement).value;
                    if (url.startsWith('http')) {
                      setPreview(url);
                      onUploadSuccess(url, "external");
                      toast.success("Image link added!");
                    }
                  }
                }}
                onBlur={(e) => {
                  const url = e.target.value;
                  if (url.startsWith('http')) {
                    setPreview(url);
                    onUploadSuccess(url, "external");
                    toast.success("Image link added!");
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
