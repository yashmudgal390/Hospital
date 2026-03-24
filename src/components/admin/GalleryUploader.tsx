"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

interface GalleryUploaderProps {
  onSuccess?: () => void;
}

export function GalleryUploader({ onSuccess }: GalleryUploaderProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Facility");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert selected file to base64 for preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageData) {
      toast.error("Please select an image first");
      return;
    }
    if (!altText.trim()) {
      toast.error("Alt text is required");
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData,   // base64 string
          altText: altText.trim(),
          caption: caption.trim(),
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Photo added to gallery!");
      
      // Reset form
      setImageData(null);
      setAltText("");
      setCaption("");
      setCategory("Facility");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
      {/* File picker */}
      <div 
        className="border-2 border-dashed border-brand-border 
          rounded-xl p-8 text-center cursor-pointer 
          hover:border-brand-primary transition-colors mb-6 group bg-brand-50/50"
        onClick={() => fileInputRef.current?.click()}
      >
        {imageData ? (
          <div className="relative h-48 w-full">
            <Image
              src={imageData}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-brand-muted">
            <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-brand-100 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-brand-text mb-1">Click to select image</p>
            <p className="text-xs">JPG, PNG, WebP — max 10MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="space-y-4">
        {/* Alt text (required) */}
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1">
            Alt Text* <span className="text-brand-muted font-normal">(required for SEO & Accessibility)</span>
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Modern clinic reception area"
            className="w-full h-11 border border-brand-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
            disabled={isUploading}
          />
        </div>

        {/* Caption (optional) */}
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1">
            Caption <span className="text-brand-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Our state-of-the-art equipment"
            className="w-full h-11 border border-brand-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
            disabled={isUploading}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-brand-text mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 border border-brand-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 bg-white"
            disabled={isUploading}
          >
            <option value="Facility">Facility & Rooms</option>
            <option value="Team">Team & Doctors</option>
            <option value="Events">Clinic Events</option>
            <option value="Equipment">Medical Equipment</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Submit */}
        {(!imageData || !altText.trim()) && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">
            {!imageData 
              ? "⬆️ Click the dashed area above to select an image first" 
              : "✏️ Fill in the Alt Text field above to enable upload"}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isUploading || !imageData || !altText.trim()}
          className={`w-full h-11 rounded-xl py-2 mt-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isUploading || !imageData || !altText.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-brand-primary text-white hover:bg-brand-secondary shadow-button"
          }`}
        >
          {isUploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
             "Save to Gallery"
          )}
        </button>
      </div>
    </div>
  );
}
