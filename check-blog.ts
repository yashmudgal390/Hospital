
import { db } from "./src/db";
import { blog } from "./src/db/schema/blog";

async function checkBlogSize() {
  try {
    const res = await db.select().from(blog);
    
    console.log("--- Blog Table ---");
    res.forEach(b => {
      const imgSize = (b.coverImageUrl?.length || 0) / 1024;
      const contentSize = (b.content?.length || 0) / 1024;
      if (imgSize > 10 || contentSize > 10) {
        console.log(`Blog: ${b.title}, Image: ${imgSize.toFixed(2)} KB, Content: ${contentSize.toFixed(2)} KB`);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

checkBlogSize();
