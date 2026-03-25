"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reviews");
        if (res.ok) {
          const data = await res.json();
          setReviews(data || []);
        }
      } catch (err) {
        console.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-brand-border/50 text-center shadow-sm">
        <div className="h-16 w-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
          <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
        </div>
        <h3 className="font-heading font-bold text-2xl text-brand-text mb-2">No Reviews Yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          We'd love to hear about your experience! Be the first to leave a review below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
            >
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col relative group hover:shadow-md transition-shadow">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors" />
                
                <div className="flex gap-1 mb-6 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-8 italic leading-relaxed flex-grow">
                  "{review.comment}"
                </p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="h-10 w-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {review.patientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text">{review.patientName}</p>
                    <p className="text-xs text-gray-400">Verified Patient</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reviews.length > 3 && (
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-colors bg-white shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-colors bg-white shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
