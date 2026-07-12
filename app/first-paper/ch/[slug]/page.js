import { notFound } from "next/navigation";
import ChapterView from "../../../../components/ChapterView";
import { firstPaper, findChapter } from "../../../../data/topics";

// Pre-render one page per chapter at build time.
export function generateStaticParams() {
  return firstPaper.chapters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const ch = findChapter(firstPaper, slug);
  if (!ch) return {};
  return {
    title: `${ch.name} — Physics 1st Paper — PhysicsLab BD`,
    description: `${ch.name} simulations for HSC Physics 1st paper: ${ch.blurb}`,
  };
}

export default async function FirstPaperChapterPage({ params }) {
  const { slug } = await params;
  const ch = findChapter(firstPaper, slug);
  if (!ch) notFound();

  // Headings + grid render in a client component so they follow the language
  // toggle; this server page keeps the SEO metadata and static params.
  return <ChapterView paper={firstPaper} chapter={ch} />;
}
