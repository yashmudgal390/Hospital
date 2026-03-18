import { Metadata } from "next";
import NextImage from "next/image";
import { isDbConfigured } from "@/db";
import { getGalleryImages } from "@/lib/gallery";
import { getClinicSettings, getSiteMetadata } from "@/lib/settings";
import { Image as ImageIcon } from "lucide-react";

export const revalidate = 3600; // Enable ISR for better performance

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteMetadata();
  
  return {
    title: `Photo Gallery | ${s?.clinicName || "Clinic"}`,
    description: "Take a virtual tour of our state-of-the-art clinic facilities.",
  };
}

export default async function GalleryPage() {
  let photos: any[] = [];
  if (isDbConfigured) {
    photos = await getGalleryImages();
  }

  // Group photos by category
  const categories: Record<string, typeof photos> = {};
  photos.forEach((photo) => {
    const cat = photo.category || "General";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(photo);
  });

  return (
    <>
      <section className="bg-brand-bg pt-20 pb-16 border-b border-brand-border text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-text mb-4">Hospital Gallery</h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Take a look inside our modern, comfortable facilities designed for your well-being.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white min-h-[50vh]">
        <div className="container mx-auto px-4 md:px-6">
          {photos.length === 0 ? (
             <div className="text-center py-20 bg-brand-50 rounded-2xl border border-brand-border max-w-2xl mx-auto">
               <ImageIcon className="h-16 w-16 mx-auto text-brand-primary opacity-30 mb-4" />
               <h2 className="text-2xl font-heading font-semibold text-brand-text mb-2">No Photos Yet</h2>
               <p className="text-brand-muted">Gallery photos will appear here once added from the admin panel.</p>
             </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(categories).map(([category, items]) => (
                <div key={category}>
                  {category !== "General" && (
                    <h2 className="text-2xl font-heading font-bold text-brand-text mb-8 flex items-center gap-3">
                      <span className="h-1 w-8 bg-brand-primary rounded-full"></span>
                      {category}
                    </h2>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((photo) => (
                      <div key={photo.id} className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all aspect-[3/2] border border-brand-border cursor-pointer bg-brand-50">
                        <NextImage 
                          src={photo.imageUrl} 
                          alt={photo.altText || "Hospital photo"} 
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 w-full p-4">
                               <p className="text-white font-medium text-sm">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
