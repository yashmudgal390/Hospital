"use client";

import { useState } from "react";
import { Star, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const patientName = formData.get("patientName") as string;
    const comment = formData.get("comment") as string;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName, rating, comment }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setIsSuccess(true);
      toast.success("Review submitted! It will appear once approved.");
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-green-50 text-green-800 p-8 rounded-2xl text-center border border-green-100 flex flex-col items-center animate-fade-in shadow-sm">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
          <Star className="h-8 w-8 fill-current" />
        </div>
        <h3 className="font-heading font-bold text-2xl mb-2">Thank you for your feedback!</h3>
        <p className="max-w-md mx-auto opacity-90">
          Your review has been successfully submitted and is currently pending moderation. We appreciate you taking the time to share your experience!
        </p>
        <Button 
          variant="outline" 
          className="mt-6 border-green-200 text-green-700 hover:bg-green-100"
          onClick={() => {
            setIsSuccess(false);
            setRating(0);
          }}
        >
          Submit another review
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-brand-primary/5 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-brand-text mb-2">Leave a Review</h3>
        <p className="text-gray-500 mb-8">Share your experience with our clinic. Your feedback helps us improve.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">How was your visit?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating === 0 && <p className="text-xs text-brand-primary font-medium">Click to select rating</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="patientName" className="text-sm font-semibold text-gray-700">Your Name</label>
            <input
              id="patientName"
              name="patientName"
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow bg-gray-50/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-semibold text-gray-700">Your Experience</label>
            <textarea
              id="comment"
              name="comment"
              required
              rows={4}
              placeholder="The doctor was very professional and the staff was friendly..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow bg-gray-50/50 resize-y"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto px-8 py-6 h-auto text-base rounded-xl bg-brand-primary hover:bg-brand-secondary shadow-lg shadow-brand-primary/25 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
    </div>
  );
}
