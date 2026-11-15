import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["refund-policy"];

export async function generateMetadata() {
  return getPageMetadata("/refund-policy", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="refund-policy" content={content} />;
}
