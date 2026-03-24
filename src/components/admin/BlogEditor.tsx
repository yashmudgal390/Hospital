"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SimpleImageUploader } from "@/components/admin/SimpleImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

const blogSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
  excerpt: z.string().min(10, "Excerpt is required"),
  content: z.string().min(10, "Post content is required"),
  coverImageUrl: z.string().optional().nullable(),
  category: z.string().min(2, "Category is required"),
  tags: z.string().optional(), // We'll parse this to an array on the backend
  isPublished: z.boolean(),
  publishedAt: z.string().optional().nullable(),
  readingTimeMinutes: z.coerce.number().int().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type BlogValues = z.infer<typeof blogSchema>;

interface BlogEditorProps {
  initialData?: any; 
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData?.id;

  // Transform array of tags to comma separated string for the input
  let initialTags = "";
  if (initialData?.tags) {
    try {
      initialTags = JSON.parse(initialData.tags).join(", ");
    } catch(e) {}
  }

  // Format date correctly for datetime-local input
  let initialDate = "";
  if (initialData?.publishedAt) {
    const d = new Date(initialData.publishedAt);
    initialDate = format(d, "yyyy-MM-dd'T'HH:mm");
  } else {
    initialDate = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  }

  const form = useForm<BlogValues>({
    resolver: zodResolver(blogSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      coverImageUrl: initialData?.coverImageUrl || "",
      category: initialData?.category || "Health Tips",
      tags: initialTags,
      isPublished: initialData?.isPublished ?? false,
      publishedAt: initialDate,
      readingTimeMinutes: initialData?.readingTimeMinutes || undefined,
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
    },
  });

  const watchTitle = form.watch("title");
  const handleGenerateSlug = () => {
    if (watchTitle && !form.getValues("slug")) {
      form.setValue("slug", watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldValidate: true });
    }
  };

  async function onSubmit(data: BlogValues) {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/admin/blog/${initialData.id}` : "/api/admin/blog";
      const method = isEditing ? "PUT" : "POST";

      // Parse tags into JSON string array
      const tagsArray = data.tags 
        ? JSON.stringify(data.tags.split(",").map(t => t.trim()).filter(Boolean)) 
        : null;

      const { publishedAt: rawDate, ...rest } = data;

      const payload = {
        ...rest,
        tags: tagsArray,
        readingTimeMinutes: data.readingTimeMinutes ?? 3,
        publishedAt: data.isPublished ? new Date(rawDate as string) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save blog post");
      }
      
      toast.success(`Blog post ${isEditing ? "updated" : "drafted"} successfully`);
      router.push("/admin/blog");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Set explicit min height on TipTap wrapper manually if needed, 
  // currently styled in global.css and RichTextEditor.tsx directly

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/blog"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-brand-text">
              {isEditing ? "Edit Article" : "Write Article"}
            </h1>
            <p className="text-brand-muted">Craft engaging and informative health content.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button type="button" variant="outline" asChild className="rounded-pill" disabled={isSubmitting}>
             <Link href="/admin/blog">Discard</Link>
           </Button>
           <Button onClick={form.handleSubmit(onSubmit as any)} size="lg" className="rounded-pill bg-brand-primary shadow-button text-white hover:bg-brand-secondary" disabled={isSubmitting}>
             {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Post</>}
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Main Editor */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border space-y-6">
              <div className="space-y-2">
                <Label htmlFor="blog-title" className="text-lg">Post Title</Label>
                <Input id="blog-title" {...form.register("title")} onBlur={handleGenerateSlug} placeholder="The Benefits of Regular Checkups" className="h-14 text-xl font-heading rounded-xl font-semibold placeholder:font-normal" />
                {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Post Content</p>
                <div className="min-h-[400px]">
                  <RichTextEditor 
                    content={form.watch("content")} 
                    onChange={(html) => form.setValue("content", html, { shouldValidate: true })}
                  />
                </div>
                {form.formState.errors.content && <p className="text-xs text-red-500">{form.formState.errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-excerpt">Post Excerpt</Label>
                <Textarea id="blog-excerpt" {...form.register("excerpt")} placeholder="A quick summary for the blog listing page..." className="h-24 resize-y rounded-xl" />
                {form.formState.errors.excerpt && <p className="text-xs text-red-500">{form.formState.errors.excerpt.message}</p>}
              </div>
           </div>
           
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border space-y-6">
              <div className="space-y-2">
                <Label htmlFor="blog-slug">URL Slug (Auto-generated from title)</Label>
                <Input id="blog-slug" {...form.register("slug")} className="rounded-xl font-mono text-sm" />
                {form.formState.errors.slug && <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>}
              </div>
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-border space-y-6">
             <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="blog-publish" className="text-base font-semibold">Publish Status</Label>
                  <p className="text-xs text-brand-muted">{form.watch("isPublished") ? "Public" : "Draft"}</p>
                </div>
                <Switch
                  id="blog-publish"
                  checked={form.watch("isPublished")}
                  onCheckedChange={(val) => form.setValue("isPublished", val)}
                  className="data-[state=checked]:bg-green-500"
                />
             </div>
             
             {form.watch("isPublished") && (
               <div className="space-y-2 animate-fade-in pt-4 border-t border-brand-border">
                 <Label htmlFor="blog-date">Publication Date</Label>
                 <Input id="blog-date" type="datetime-local" {...form.register("publishedAt")} className="rounded-xl" />
               </div>
             )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-border space-y-6">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-brand-muted mb-4">Categorization</h3>
            
            <div className="space-y-2">
              <Label htmlFor="blog-category">Category</Label>
              <select id="blog-category" {...form.register("category")} className="flex h-12 w-full items-center justify-between rounded-xl border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                <option value="Health Tips">Health Tips</option>
                <option value="Medical News">Medical News</option>
                <option value="Clinic Updates">Clinic Updates</option>
                <option value="Patient Stories">Patient Stories</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-tags">Tags (Comma separated)</Label>
              <Input id="blog-tags" {...form.register("tags")} placeholder="cardiology, checkup, heart" className="rounded-xl" />
            </div>

            <div className="space-y-2">
               <Label htmlFor="blog-read-time">Manual Read Time (Min)</Label>
               <Input id="blog-read-time" type="number" {...form.register("readingTimeMinutes")} placeholder="Auto" className="rounded-xl w-24" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-border space-y-4">
             <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-brand-muted mb-2">Cover Image</h3>
             <SimpleImageUploader 
               folder="blog" 
               defaultImage={initialData?.coverImageUrl}
               onUploadSuccess={(url) => form.setValue("coverImageUrl", url)} 
             />
             {form.watch("coverImageUrl") && (
               <input type="hidden" {...form.register("coverImageUrl")} />
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
