import ChapterGrid from "../../components/ChapterGrid";
import { secondPaper } from "../../data/topics";

export const metadata = {
  title: "Physics 2nd Paper Simulations — PhysicsLab BD",
  description:
    "Interactive Physics 2nd paper simulations for HSC, chapter by chapter: " +
    "thermodynamics, electricity, magnetism, optics, modern physics and astrophysics.",
};

export default function SecondPaperPage() {
  return (
    <>
      <nav className="breadcrumb">Home › 2nd Paper</nav>
      <h1 className="section-title" style={{ marginTop: 4 }}>
        📗 Physics 2nd Paper
      </h1>
      <p className="section-sub">Pick a chapter to see its simulations.</p>
      <ChapterGrid basePath="/second-paper" chapters={secondPaper.chapters} />
    </>
  );
}
