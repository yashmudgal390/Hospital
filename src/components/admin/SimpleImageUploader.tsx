"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";

interface SimpleImageUploaderProps {
  folder?: string;
  defaultImage?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function SimpleImageUploader({ folder = "general", defaultImage, onUploadSuccess }: SimpleImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload immediately
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Upload failed");

      toast.success("Image uploaded successfully!");
      onUploadSuccess(data.url);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      setPreview(defaultImage || null); // revert preview on failure
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadSuccess("");
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed border-brand-border rounded-xl text-center cursor-pointer transition-colors group bg-brand-50/50 ${
          preview ? "p-2" : "p-8 hover:border-brand-primary"
        }`}
        onClick={() => !preview && !isUploading && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative h-48 w-full group overflow-hidden rounded-lg">
            <Image src={preview} alt="Upload preview" fill className="object-contain" />
            
            {/* Overlay to remove or change image */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                className="bg-white text-brand-text rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Change
              </button>
              <button
                type="button"
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-brand-muted">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-2" />
            ) : (
              <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-brand-100 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
            )}
            <p className="text-sm font-medium text-brand-text mb-1">
              {isUploading ? "Uploading..." : "Click to select image"}
            </p>
            {!isUploading && <p className="text-xs">JPG, PNG, WebP — max 10MB</p>}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
    </div>
  );
}
