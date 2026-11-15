import { InformationPage } from "@/components/information-page";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["shipping-policy"];

export async function generateMetadata() {
  return getPageMetadata("/shipping-policy", content.title, content.description);
}

export default function Page() {
  return <InformationPage slug="shipping-policy" content={content} />;
}
