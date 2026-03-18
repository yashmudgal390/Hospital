import { Metadata } from "next";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const metadata: Metadata = {
  title: "Write Article | Admin",
};

export default function NewBlogPage() {
  return <BlogEditor />;
}
