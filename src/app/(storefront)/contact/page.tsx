import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["contact"];

export async function generateMetadata() {
  return getPageMetadata("/contact", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="contact" content={content} />;
}
