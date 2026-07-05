import Link from "next/link";
import { notFound } from "next/navigation";
import TopicGrid from "../../../../components/TopicGrid";
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

  // Adapt the chapter's sims to the shape TopicGrid expects.
  const topics = ch.sims.map((s) => ({ ...s, ready: true, chapter: `Chapter ${ch.num}` }));

  return (
    <>
      <nav className="breadcrumb">
        <Link href="/">Home</Link>
        {" › "}
        <Link href="/first-paper">1st Paper</Link>
        {" › "}
        {ch.name}
      </nav>
      <h1 className="section-title" style={{ marginTop: 4 }}>
        {ch.emoji} {ch.name}
      </h1>
      <p className="section-sub">
        Chapter {ch.num} · {ch.sims.length} simulation{ch.sims.length > 1 ? "s" : ""} — tap one to open it.
      </p>
      <TopicGrid basePath="/first-paper" topics={topics} />
    </>
  );
}
