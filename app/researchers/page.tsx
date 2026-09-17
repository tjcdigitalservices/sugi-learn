import type { Metadata } from "next";

import { ResearchersPageView } from "@/components/researchers/researchers-page";

export const metadata: Metadata = {
  title: "Researchers | Suguidanon",
  description:
    "Meet the BSIT 4-D researchers from West Visayas State University Calinog Campus behind SugiLearn.",
};

export default function ResearchersPage() {
  return <ResearchersPageView />;
}
