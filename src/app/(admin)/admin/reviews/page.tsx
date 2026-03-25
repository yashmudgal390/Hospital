"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleApproval(id: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
      );
      toast.success(currentStatus ? "Review hidden from site" : "Review approved and published!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  }

  async function deleteReview(id: string) {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Deletion failed");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted permanently");
    } catch (err) {
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-3xl text-brand-text mb-2">Patient Reviews</h1>
        <p className="text-gray-500">Moderate customer feedback before it appears on your website.</p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-primary" />
            <p>Loading patient reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquareText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
            <p className="max-w-sm mx-auto">
              When patients submit feedback through the public form, it will appear here for you to approve.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-1/3">Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} className={!review.isApproved ? "bg-orange-50/30" : ""}>
                  <TableCell className="text-sm whitespace-nowrap text-gray-500">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">{review.patientName}</TableCell>
                  <TableCell>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 line-clamp-2" title={review.comment}>
                      "{review.comment}"
                    </p>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {review.isApproved ? "Published" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleApproval(review.id, review.isApproved)}
                        className={review.isApproved ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                      >
                        {review.isApproved ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1.5" /> Hide
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setReviewToDelete(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!reviewToDelete} onOpenChange={(open: boolean) => !open && setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This review will be permanently deleted from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                if (reviewToDelete) deleteReview(reviewToDelete);
              }}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
