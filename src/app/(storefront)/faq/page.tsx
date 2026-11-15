import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["faq"];

export async function generateMetadata() {
  return getPageMetadata("/faq", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="faq" content={content} />;
}
