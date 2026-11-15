import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["about"];

export async function generateMetadata() {
  return getPageMetadata("/about", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="about" content={content} />;
}
