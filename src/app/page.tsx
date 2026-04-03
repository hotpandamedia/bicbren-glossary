import glossary from "@/data/glossary.json";
import { GlossaryClient } from "./GlossaryClient";

export default function Home() {
  return <GlossaryClient data={glossary} />;
}
