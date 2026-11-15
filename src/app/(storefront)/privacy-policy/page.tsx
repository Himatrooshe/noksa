import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["privacy-policy"];

export async function generateMetadata() {
  return getPageMetadata("/privacy-policy", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="privacy-policy" content={content} />;
}
