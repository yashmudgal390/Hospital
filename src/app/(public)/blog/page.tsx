import { Metadata } from "next";
import Link from "next/link";
import { formatRelativeTime, estimateReadingTime } from "@/lib/utils";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { isDbConfigured } from "@/db";
import { getBlogPosts } from "@/lib/blog";
import { getClinicSettings, getSiteMetadata } from "@/lib/settings";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteMetadata();

  return {
    title: `Health Blog | ${s?.clinicName || "Clinic"}`,
    description: "Read the latest health advice, news, and updates from our doctors.",
  };
}

export default async function BlogIndexPage() {
  let posts: any[] = [];
  if (isDbConfigured) {
    posts = await getBlogPosts();
  }

  return (
    <>
      <section className="bg-brand-bg pt-20 pb-16 border-b border-brand-border text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-text mb-4">Health & Wellness Blog</h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Expert insights, tips, and the latest medical news.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white min-h-[50vh]">
        <div className="container mx-auto px-4 md:px-6">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-brand-50 rounded-2xl border border-brand-border max-w-2xl mx-auto">
               <h2 className="text-2xl font-heading font-semibold text-brand-text mb-2">No Articles Yet</h2>
               <p className="text-brand-muted">Check back later for new health and wellness content.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                let tagsArray: string[] = [];
                if (post.tags) {
                  try {
                    tagsArray = JSON.parse(post.tags);
                  } catch (e) {}
                }

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative h-56 overflow-hidden bg-brand-100">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-brand opacity-80" />
                      )}
                      
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-text text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {post.category}
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs font-medium text-brand-muted mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.publishedAt ? formatRelativeTime(post.publishedAt) : "Draft"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTimeMinutes || estimateReadingTime(post.content)} min read
                        </span>
                      </div>

                      <h2 className="text-2xl font-heading font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-brand-muted leading-relaxed line-clamp-3 mb-6 flex-grow">
                        {post.excerpt}
                      </p>

                      {tagsArray.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {tagsArray.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-brand-50 text-brand-secondary rounded-md uppercase tracking-wide">
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                          {tagsArray.length > 3 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-brand-50 text-brand-muted rounded-md tracking-wider">
                              +{tagsArray.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="pt-4 border-t border-brand-border flex items-center text-brand-secondary font-medium group-hover:text-brand-primary transition-colors mt-auto">
                        Read Article
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
