import ChapterGrid from "../../components/ChapterGrid";
import { firstPaper } from "../../data/topics";

// Per-page SEO: this title/description helps students find the 1st paper page.
export const metadata = {
  title: "Physics 1st Paper Simulations — PhysicsLab BD",
  description:
    "Interactive Physics 1st paper simulations for HSC, chapter by chapter: " +
    "measurement, vectors, dynamics, energy, gravitation, matter, SHM, waves and gases.",
};

export default function FirstPaperPage() {
  return (
    <>
      <nav className="breadcrumb">Home › 1st Paper</nav>
      <h1 className="section-title" style={{ marginTop: 4 }}>
        📘 Physics 1st Paper
      </h1>
      <p className="section-sub">Pick a chapter to see its simulations.</p>
      <ChapterGrid basePath="/first-paper" chapters={firstPaper.chapters} />
    </>
  );
}
