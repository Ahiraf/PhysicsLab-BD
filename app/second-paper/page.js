import PaperMenu from "../../components/PaperMenu";
import { secondPaper } from "../../data/topics";

export const metadata = {
  title: "Physics 2nd Paper Simulations — PhysicsLab BD",
  description:
    "Interactive Physics 2nd paper simulations for HSC, chapter by chapter: " +
    "thermodynamics, electricity, magnetism, optics, modern physics and astrophysics.",
};

export default function SecondPaperPage() {
  // Heading + chapter grid live in a client component so they follow the
  // navbar language toggle; this server page keeps the metadata above.
  return <PaperMenu paper={secondPaper} />;
}
