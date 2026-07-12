import PaperMenu from "../../components/PaperMenu";
import { firstPaper } from "../../data/topics";

// Per-page SEO: this title/description helps students find the 1st paper page.
export const metadata = {
  title: "Physics 1st Paper Simulations — PhysicsLab BD",
  description:
    "Interactive Physics 1st paper simulations for HSC, chapter by chapter: " +
    "measurement, vectors, dynamics, energy, gravitation, matter, SHM, waves and gases.",
};

export default function FirstPaperPage() {
  // Heading + chapter grid live in a client component so they follow the
  // navbar language toggle; this server page keeps the metadata above.
  return <PaperMenu paper={firstPaper} />;
}
