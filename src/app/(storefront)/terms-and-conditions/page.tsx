import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["terms-and-conditions"];

export async function generateMetadata() {
  return getPageMetadata("/terms-and-conditions", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="terms-and-conditions" content={content} />;
}
