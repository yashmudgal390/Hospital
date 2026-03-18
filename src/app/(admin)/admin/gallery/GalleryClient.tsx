"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GalleryUploader } from "@/components/admin/GalleryUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  caption: string | null;
  category: string;
  createdAt: Date;
};

export default function GalleryClient({ data }: { data: GalleryImage[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Image State
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newPublicId, setNewPublicId] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("Facility");

  const deletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo from the gallery?")) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete photo");
      
      toast.success("Photo deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUploadSuccess = (url: string, publicId: string) => {
    setNewImageUrl(url);
    setNewPublicId(publicId);
  };

  const saveNewImage = async () => {
    if (!newImageUrl) return toast.error("Please upload an image first");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: newImageUrl,
          cloudinaryPublicId: newPublicId,
          altText: newAltText || "Clinic Photo",
          caption: newCaption || null,
          category: newCategory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save image details");
      }
      
      toast.success("Image added to gallery!");
      
      // Reset form
      setNewImageUrl("");
      setNewPublicId("");
      setNewAltText("");
      setNewCaption("");
      setNewCategory("Facility");
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add image");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Clinic Gallery</h1>
        <p className="text-brand-muted">Manage photos displayed on the public gallery page.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border">
        <h2 className="text-xl font-heading font-semibold text-brand-text mb-6 flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-brand-primary" /> Add New Photo
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
           <div>
             <GalleryUploader 
               folder="gallery" 
               onUploadSuccess={handleUploadSuccess} 
             />
           </div>
           
           <div className="space-y-4">
              <div className="space-y-2">
                <Label>Required: Alt Text (for SEO & Accessibility)</Label>
                <Input 
                  value={newAltText} 
                  onChange={e => setNewAltText(e.target.value)} 
                  placeholder="e.g. Modern dental operating room" 
                  className="rounded-xl h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Optional: Caption</Label>
                <Input 
                  value={newCaption} 
                  onChange={e => setNewCaption(e.target.value)} 
                  placeholder="e.g. State-of-the-art equipment in Room A" 
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Facility">Facility & Rooms</option>
                  <option value="Team">Team & Doctors</option>
                  <option value="Events">Clinic Events</option>
                  <option value="Equipment">Medical Equipment</option>
                </select>
              </div>
              
              <Button 
                onClick={saveNewImage} 
                disabled={!newImageUrl || isSubmitting}
                className="w-full h-11 rounded-xl bg-brand-primary text-white shadow-button mt-4"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save to Gallery"}
              </Button>
           </div>
        </div>
      </div>

      {/* Grid Display Section */}
      <div>
        <h2 className="text-xl font-heading font-semibold text-brand-text mb-6">Existing Photos ({data.length})</h2>
        
        {data.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-brand-border text-brand-muted">
            No photos found in the gallery.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((img) => (
               <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-border hover:shadow-card transition-all">
                  <div className="aspect-[4/3] bg-brand-50 relative overflow-hidden">
                    <img 
                      src={img.imageUrl} 
                      alt={img.altText || "Clinic photo"} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-4 border-t border-brand-border">
                    <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">{img.category}</div>
                    <div className="text-sm text-brand-text truncate font-medium">{img.altText}</div>
                    {img.caption && <div className="text-xs text-brand-muted truncate mt-1">{img.caption}</div>}
                    <div className="text-xs text-brand-muted/70 mt-2">{format(new Date(img.createdAt), "MMM d, yyyy")}</div>
                  </div>

                  {/* Delete Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 rounded-full shadow-md"
                      onClick={() => deletePhoto(img.id)}
                      disabled={isDeleting === img.id}
                    >
                      {isDeleting === img.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
