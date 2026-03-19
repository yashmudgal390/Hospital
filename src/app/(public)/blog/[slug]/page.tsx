import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Calendar, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/blog";
import { getClinicSettings } from "@/lib/settings";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post || !post.isPublished) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  const [s, relatedPosts] = await Promise.all([
    getClinicSettings(),
    getRelatedPosts(post.id)
  ]);

  let tagsArray: string[] = [];
  try {
    if (post.tags) tagsArray = JSON.parse(post.tags);
  } catch (e) {}

  // A generic absolute URL for sharing
  // A generic absolute URL for sharing
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(post.title);

  return (
    <article className="bg-brand-bg min-h-screen pb-20">
      
      {/* Article Header */}
      <header className="container mx-auto px-4 md:px-6 pt-16 lg:pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-brand-primary hover:text-brand-secondary mb-8 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Health Blog
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium text-brand-muted">
            <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full uppercase tracking-wider text-xs">
              {post.category}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTimeMinutes || estimateReadingTime(post.content)} min read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-text leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-xl md:text-2xl text-brand-muted leading-relaxed font-serif">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-b border-brand-border py-6 mt-10">
            <div className="flex items-center gap-4">
              {s?.doctorPhotoUrl ? (
                <img 
                  src={s.doctorPhotoUrl} 
                  alt={s.doctorName || ""} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-brand-primary/20"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-primary border-2 border-brand-primary/20 font-bold">
                  {(s?.doctorName || s?.clinicName || "D").charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold text-brand-text leading-tight">{s?.doctorName}</div>
                <div className="text-xs text-brand-muted">{s?.doctorTitle}</div>
              </div>
            </div>
            
            {/* Social Share (Links simulated) */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-brand-muted mr-2 hidden sm:inline">Share:</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-secondary hover:bg-brand-primary hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-secondary hover:bg-brand-primary hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-secondary hover:bg-brand-primary hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {post.coverImageUrl && (
        <div className="container mx-auto px-4 md:px-6 mb-16">
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-card relative aspect-video bg-brand-100">
            <img 
              src={post.coverImageUrl} 
              alt={post.title} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-border">
          {/* Tagged HTML rendered from TipTap */}
          <div 
            className="rendered-content text-lg"
            dangerouslySetInnerHTML={{ __html: post.content || "" }} 
          />

          {tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-brand-border">
              {tagsArray.map((tag, idx) => (
                <span key={idx} className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 bg-brand-50 text-brand-secondary rounded-lg">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20">
            <h3 className="text-2xl font-heading font-bold text-brand-text mb-8">Related Articles</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(rp => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group bg-white rounded-xl overflow-hidden border border-brand-border shadow-sm hover:shadow-card transition-all flex flex-col">
                  {rp.coverImageUrl && (
                    <div className="h-40 overflow-hidden relative">
                      <img src={rp.coverImageUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 flex-grow">
                    <h4 className="font-heading font-semibold text-lg mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">{rp.title}</h4>
                    {rp.publishedAt && (
                      <span className="text-xs font-medium text-brand-muted flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(rp.publishedAt)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </article>
  );
}
