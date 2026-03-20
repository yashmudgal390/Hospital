"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GalleryUploader } from "@/components/admin/GalleryUploader";

const serviceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  shortDescription: z.string().min(10, "Brief description required"),
  fullDescription: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ServiceValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: any; // To populate form if editing
}

export function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData?.id;

  const form = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      shortDescription: initialData?.shortDescription || "",
      fullDescription: initialData?.fullDescription || "",
      imageUrl: initialData?.imageUrl || "",
      sortOrder: initialData?.sortOrder || 0,
      isFeatured: initialData?.isFeatured ?? false,
      isActive: initialData?.isActive ?? true,
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
    },
  });

  // Auto-generate slug from name if slug is empty
  const watchName = form.watch("name");
  
  const handleGenerateSlug = () => {
    if (watchName && !form.getValues("slug")) {
      form.setValue("slug", watchName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldValidate: true });
    }
  };

  async function onSubmit(data: ServiceValues) {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/admin/services/${initialData.id}` : "/api/admin/services";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save service");
      }
      
      toast.success(`Service ${isEditing ? "updated" : "created"} successfully`);
      router.push("/admin/services");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/services"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-text">
            {isEditing ? "Edit Service" : "Add New Service"}
          </h1>
          <p className="text-brand-muted">Fill out the details below to publish a service.</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border space-y-6">
          <h2 className="text-xl font-heading font-semibold text-brand-text border-b border-brand-border pb-4 mb-6">Basic Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name <span className="text-red-500">*</span></Label>
              <Input id="service-name" {...form.register("name")} onBlur={handleGenerateSlug} placeholder="e.g. Comprehensive Dental Exam" className="h-12 rounded-xl" />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-slug">URL Slug <span className="text-red-500">*</span></Label>
              <Input id="service-slug" {...form.register("slug")} placeholder="e.g. dental-exam" className="h-12 rounded-xl font-mono text-sm" />
              {form.formState.errors.slug && <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
             <Label>Cover Image</Label>
             <GalleryUploader 
               folder="services" 
               defaultImage={initialData?.imageUrl}
               onUploadSuccess={(url) => form.setValue("imageUrl", url)} 
             />
             {form.watch("imageUrl") && (
               <input type="hidden" {...form.register("imageUrl")} />
             )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-short-desc">Short Description <span className="text-red-500">*</span></Label>
            <Textarea id="service-short-desc" {...form.register("shortDescription")} placeholder="A brief 1-2 sentence overview for the cards..." className="min-h-[100px] resize-y rounded-xl" />
            {form.formState.errors.shortDescription && <p className="text-xs text-red-500">{form.formState.errors.shortDescription.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-full-desc">Full HTML Description (Detailed Page Content)</Label>
            <Textarea id="service-full-desc" {...form.register("fullDescription")} placeholder="<h2>What to Expect...</h2><p>...</p>" className="min-h-[200px] font-mono text-sm resize-y rounded-xl bg-brand-50" />
            <p className="text-xs text-brand-muted">You can write standard HTML for rich text content here.</p>
          </div>
        </div>

        {/* Display & SEO */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border space-y-6">
          <h2 className="text-xl font-heading font-semibold text-brand-text border-b border-brand-border pb-4 mb-6">Display & SEO</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="flex items-center justify-between bg-brand-50 p-4 rounded-xl border border-brand-border">
                  <div>
                    <Label htmlFor="service-active" className="text-base font-semibold">Active Status</Label>
                    <p className="text-xs text-brand-muted">Should this service be visible publicly?</p>
                  </div>
                  <Switch
                    id="service-active"
                    checked={form.watch("isActive")}
                    onCheckedChange={(val) => form.setValue("isActive", val)}
                  />
               </div>
               
               <div className="flex items-center justify-between bg-brand-50 p-4 rounded-xl border border-brand-border">
                  <div>
                    <Label htmlFor="service-featured" className="text-base font-semibold">Featured</Label>
                    <p className="text-xs text-brand-muted">Pin this service to the homepage.</p>
                  </div>
                  <Switch
                    id="service-featured"
                    checked={form.watch("isFeatured")}
                    onCheckedChange={(val) => form.setValue("isFeatured", val)}
                  />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="service-sort">Sort Order</Label>
                 <Input id="service-sort" type="number" {...form.register("sortOrder")} className="h-12 rounded-xl w-32" />
                 <p className="text-xs text-brand-muted">Lower numbers appear first.</p>
               </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service-meta-title">SEO Meta Title</Label>
                <Input id="service-meta-title" {...form.register("metaTitle")} placeholder="Overwrites default page title" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-meta-desc">SEO Meta Description</Label>
                <Textarea id="service-meta-desc" {...form.register("metaDescription")} placeholder="Overwrites default meta description" className="min-h-[100px] resize-y rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pb-20">
          <Button type="button" variant="outline" asChild className="rounded-pill px-8" disabled={isSubmitting}>
             <Link href="/admin/services">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" className="rounded-pill px-8 bg-brand-primary shadow-button text-white hover:bg-brand-secondary" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Service</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
