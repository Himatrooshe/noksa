import Link from "next/link";
import type { InformationContent } from "@/components/information-page";
import type { StorefrontPageSlug } from "@/lib/storefront-pages";

export const informationContent: Record<StorefrontPageSlug, InformationContent> = {
  about: {
    title: "About Noksa",
    description: "Meet Noksa: handmade jute bags, home essentials, and accessories rooted in Bangladesh.",
    intro: "Rooted in Bangladesh. Made for every day.",
    sections: [
      {
        id: "our-story", title: "Our golden beginning",
        content: <><p>In Bangladesh, jute is known as the golden fiber. At Noksa, it is the starting point for bags, home essentials, and small accessories designed for everyday use.</p><p>We bring together natural materials, the character of handmade work, and simple, useful shapes. Our collection takes its inspiration from the material and the hands that shape it.</p></>,
      },
      {
        id: "our-materials", title: "Natural materials, individual character",
        content: <><p>Our collection centers on jute. The weave, texture, and color of handmade pieces can vary slightly; check each product page for its materials, dimensions, and available options.</p><p>Care for jute by spot cleaning gently with a damp cloth, allowing it to air dry fully, and storing it in a dry place. Avoid soaking or machine washing.</p></>,
      },
      {
        id: "our-collection", title: "Explore the collection",
        content: <><p>Browse the collection to see our current designs. This website is being prepared for U.S. customers, with prices displayed in U.S. dollars. Online checkout is not yet available.</p><p><Link href="/shop">Discover the Noksa collection</Link> or read our <Link href="/faq">frequently asked questions</Link>.</p></>,
      },
    ],
  },
  contact: {
    title: "Contact Noksa",
    description: "Customer support, product questions, and custom or bulk order information for Noksa.",
    intro: "Product questions, a custom idea, or help with a purchase: start here.",
    sections: [
      {
        id: "customer-support", title: "Customer support",
        content: <><p>Our public support email, business contact details, and support hours will be published here before the store opens for orders. We are not accepting orders or payments through this website yet.</p><p>In the meantime, our <Link href="/faq">FAQ</Link>, <Link href="/shipping-policy">shipping policy</Link>, and <Link href="/refund-policy">returns and refunds page</Link> explain the current store status.</p></>,
      },
      {
        id: "product-questions", title: "Questions about a product",
        content: <p>Check the product page for available options, dimensions, materials, and care instructions. When support opens, include the product name or page link with your question so we can help you find the right piece.</p>,
      },
      {
        id: "custom-bulk", title: "Custom & bulk inquiries",
        content: <p>For a future custom or bulk inquiry, prepare the product type, quantity, preferred dimensions or design, delivery destination, and desired date. Availability, pricing, and lead times will need to be confirmed before an order is accepted.</p>,
      },
      {
        id: "marketplace-orders", title: "Orders placed elsewhere",
        content: <p>If you bought a Noksa item through another retailer or marketplace, use the support or return options in that retailer’s order history. This website cannot access an order placed on another platform.</p>,
      },
      {
        id: "privacy-questions", title: "Privacy questions",
        content: <p>Read our <Link href="/privacy-policy">privacy policy</Link> for details about browsing data and your shopping bag. A dedicated contact route for privacy requests will be added with our public support details.</p>,
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    description: "Answers about Noksa jute products, care, U.S. pricing, shipping, returns, and store availability.",
    intro: "A few useful things to know about Noksa and your everyday jute pieces.",
    sections: [
      {
        id: "ordering", title: "Can I place an order yet?",
        content: <p>Not yet. You can browse products and save items to your shopping bag, but checkout and online payments are not available. Adding an item to your bag does not place an order or reserve stock.</p>,
      },
      {
        id: "currency", title: "What currency are prices in?",
        content: <p>Prices are shown in U.S. dollars (USD). Catalog prices may change before launch. Final product prices, shipping charges, and applicable taxes must be confirmed before a purchase is completed.</p>,
      },
      {
        id: "materials", title: "What are the products made from?",
        content: <p>Jute is the main material in our collection. Check each product’s description for details about its construction, dimensions, and options. Handmade textures, colors, and measurements may vary slightly.</p>,
      },
      {
        id: "care", title: "How do I care for jute?",
        content: <p>Spot clean gently with a damp cloth. Air dry completely and store in a dry place. Avoid soaking, machine washing, or prolonged exposure to moisture.</p>,
      },
      {
        id: "shipping", title: "Do you ship to the United States?",
        content: <p>We are preparing the store for U.S. customers. Shipping destinations, fulfillment origin, rates, and delivery estimates will be confirmed before orders open. See the <Link href="/shipping-policy">shipping policy</Link> for the current status.</p>,
      },
      {
        id: "returns", title: "What is the return policy?",
        content: <p>The return window, eligibility, return shipping costs, and refund timing will be published before checkout launches. Visit <Link href="/refund-policy">returns and refunds</Link> for details. Purchases through another retailer follow that retailer’s published policy.</p>,
      },
      {
        id: "bag", title: "Will my shopping bag be saved?",
        content: <p>Your bag is saved in your browser on this device when browser storage is available. Clearing site data, using another browser, or using a different device can reset it. The bag does not reserve items.</p>,
      },
      {
        id: "custom", title: "Can I request custom or bulk products?",
        content: <p>Custom and bulk inquiry details will be available when public support opens. Our <Link href="/contact#custom-bulk">contact page</Link> explains what information to prepare.</p>,
      },
    ],
  },
  "shipping-policy": {
    title: "Shipping policy",
    description: "Noksa’s current U.S. shipping status and information about delivery, rates, and order tracking.",
    intro: "Clear delivery information, before you place an order.",
    policy: true,
    sections: [
      {
        id: "availability", title: "Current shipping availability",
        content: <p>Noksa is preparing this store for U.S. customers. We are not currently accepting online orders, collecting payments, or arranging shipments through this website. Products in a shopping bag are not confirmed orders.</p>,
      },
      {
        id: "destinations", title: "Destinations & fulfillment origin",
        content: <p>Supported destinations and the location from which orders ship will be published before checkout opens. Service to Alaska, Hawaii, U.S. territories, military addresses, P.O. boxes, and destinations outside the United States has not yet been confirmed.</p>,
      },
      {
        id: "rates-timing", title: "Rates & delivery estimates",
        content: <p>Shipping charges, processing times, delivery estimates, carriers, and any free-shipping conditions are still being finalized. We are not promising a delivery date or offering a shipping promotion at this stage. Applicable shipping costs and taxes will need to be disclosed before an order is placed.</p>,
      },
      {
        id: "tracking", title: "Tracking, delays & delivery issues",
        content: <p>Tracking availability and procedures for delayed, missing, or damaged deliveries will be published with our fulfillment details. For a purchase placed through another retailer, use the delivery and support tools provided by that retailer.</p>,
      },
      {
        id: "questions", title: "Questions before ordering",
        content: <p>See our <Link href="/contact">contact page</Link> for support availability and our <Link href="/refund-policy">returns and refunds page</Link> for the current policy status. We will update this page before accepting orders.</p>,
      },
    ],
  },
  "refund-policy": {
    title: "Returns & refunds",
    description: "Noksa return, refund, cancellation, and damaged-item policy status before online ordering launches.",
    intro: "Know where you stand before you buy.",
    policy: true,
    sections: [
      {
        id: "current-status", title: "Current policy status",
        content: <p>This website does not yet accept orders or payments. The purchase return and refund policy is being finalized and will be published before checkout becomes available. This page does not establish a return window or promise a refund for a future purchase.</p>,
      },
      {
        id: "eligibility", title: "Return window & eligibility",
        content: <p>Before launch, we will state the return request window, item-condition requirements, proof-of-purchase requirements, exchange availability, and any exclusions for custom or final-sale items.</p>,
      },
      {
        id: "return-process", title: "Requesting a return & shipping costs",
        content: <p>Return request instructions, the authorized return address, responsibility for return shipping, and any applicable fees will be published before orders open. No return address is currently provided by this website; do not send items to an unconfirmed address.</p>,
      },
      {
        id: "damaged-items", title: "Damaged, defective, or incorrect items",
        content: <p>Our reporting process and available remedies for damaged, defective, or incorrect items will be set out in the launch policy. Keep your proof of purchase and any relevant photographs. If you bought through another retailer, contact that retailer through your order history.</p>,
      },
      {
        id: "refunds-cancellations", title: "Refunds & cancellations",
        content: <p>Refund approval criteria, refund method, processing times, treatment of original shipping charges, and cancellation conditions will be confirmed before checkout launches. No payment has been taken by adding items to this website’s shopping bag.</p>,
      },
      {
        id: "other-retailers", title: "Marketplace purchases & your rights",
        content: <><p>Orders placed through another retailer or marketplace are subject to that retailer’s published return and refund procedures. This website’s prelaunch information does not replace those procedures.</p><p>Nothing on this page limits consumer rights that apply under law. Our <Link href="/contact">contact page</Link> will list public support details when available.</p></>,
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy policy",
    description: "How Noksa collects, uses, shares, and protects personal information, and the privacy choices and rights available to you.",
    intro: "A clear explanation of how we handle your information. Noksa values your trust: this policy explains what information we may collect, why we use it, when it may be shared, and the choices and rights that may be available to you.",
    policy: true,
    updatedLabel: "Effective date: November 17, 2026",
    sections: [
      {
        id: "introduction", title: "1. Introduction",
        content: <><p>At Noksa, we value your trust and respect your privacy. We believe a great shopping experience begins with confidence, transparency, and care.</p><p>This Privacy Policy explains how we collect, use, protect, and manage personal information when you visit our website, make a purchase, or communicate with us.</p><p>Our commitment is simple: your personal information deserves the same care and attention that we put into every handcrafted product.</p></>,
      },
      {
        id: "information", title: "2. Information we collect",
        content: <><p>When you interact with Noksa, we may collect information needed to provide our services, including:</p><ul><li><strong>Personal information:</strong> name, email address, phone number, and billing or shipping address.</li><li><strong>Order information:</strong> products purchased, order history, payment status, and delivery details.</li><li><strong>Payment information:</strong> payment details handled by our payment service providers. We do not intentionally store complete payment-card details on our own systems.</li><li><strong>Technical information:</strong> IP address, browser type, device information, website activity, and cookie data.</li><li><strong>Communication information:</strong> messages, questions, feedback, and customer-support inquiries.</li></ul></>,
      },
      {
        id: "use", title: "3. How we use your information",
        content: <><p>We may use information to:</p><ul><li>Process and fulfill orders and arrange shipping and delivery.</li><li>Send order confirmations and delivery updates.</li><li>Respond to questions and customer-support requests.</li><li>Improve our website, products, and shopping experience.</li><li>Help detect fraud, protect customers, and maintain website security.</li><li>Send promotional communications where permitted and, when required, with your consent.</li></ul></>,
      },
      {
        id: "sharing", title: "4. Sharing your information",
        content: <><p>Noksa does not sell personal information for money. We may share limited information with service providers when needed to operate our business, including payment processors, shipping and delivery companies, website and e-commerce providers, analytics and marketing providers, and legal or regulatory authorities when required by law.</p><p>Service providers should receive only the information reasonably needed to perform their services and are subject to applicable contractual and legal requirements.</p></>,
      },
      {
        id: "cookies", title: "5. Cookies and similar technologies",
        content: <><p>Our website may use cookies and similar technologies to remember preferences, support essential shopping functions, understand website traffic, improve performance, and measure marketing effectiveness. For example, your shopping bag is saved in your browser’s local storage, and the site loads Google Tag Manager, which may load analytics or advertising tags (see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s privacy policy</a>).</p><p>You can manage cookies through your browser settings. Disabling certain cookies may affect some website features. Where required by law, we will provide appropriate cookie choices and disclosures.</p></>,
      },
      {
        id: "payment-security", title: "6. Payment security",
        content: <><p>Payments are handled through third-party payment processors and their payment systems. Payment information is subject to the privacy and security practices of the relevant provider.</p><p>Noksa takes reasonable measures to protect customer information against unauthorized access, misuse, alteration, or disclosure. However, no online transmission or electronic storage system can be guaranteed to be completely secure.</p></>,
      },
      {
        id: "retention", title: "7. Data retention",
        content: <><p>We retain personal information for as long as reasonably necessary to fulfill orders, provide customer support, maintain business records, resolve disputes, and meet applicable legal obligations.</p><p>When information is no longer needed, we take reasonable steps to delete it or securely dispose of it, subject to legal retention requirements.</p></>,
      },
      {
        id: "rights", title: "8. Your privacy rights",
        content: <><p>Depending on your location and applicable law, including certain U.S. state privacy laws, you may have rights to request access to, correction of, or deletion of certain personal information; obtain a copy of certain information; opt out of certain targeted advertising or other covered processing; or withdraw consent where processing is based on consent.</p><p>To submit a request, contact us using the details in the <a href="#contact">Contact us</a> section. We may need to verify your identity before acting on certain requests. We will not unlawfully discriminate against you for exercising applicable privacy rights.</p><p>The rights available to you depend on the law that applies to your circumstances.</p></>,
      },
      {
        id: "third-parties", title: "9. Third-party websites and marketplaces",
        content: <p>Our website may link to third-party platforms, including Amazon and other online marketplaces. These platforms operate independently and have their own privacy policies and terms. Noksa is not responsible for the privacy practices of external websites. Please review their policies before sharing personal information with them.</p>,
      },
      {
        id: "children", title: "10. Children’s privacy",
        content: <p>Our website is not directed to children under 13, and we do not knowingly collect personal information online from children under 13 for our own purposes without appropriate parental consent. If we learn that we have collected such information improperly, we will take reasonable steps to address it.</p>,
      },
      {
        id: "international", title: "11. International customers and data transfers",
        content: <><p>Noksa is a Bangladesh-based brand serving customers in international markets, including the United States. Information may be processed or stored in Bangladesh or other countries where our service providers operate.</p><p>Where required by applicable law, we take appropriate measures for international transfers of personal information.</p></>,
      },
      {
        id: "changes", title: "12. Changes to this privacy policy",
        content: <p>We may update this Privacy Policy to reflect changes in our business practices, services, or applicable laws. We will publish updates on this page and revise the effective date. We encourage you to review this policy periodically.</p>,
      },
      {
        id: "contact", title: "13. Contact us",
        content: <><p>If you have questions about this Privacy Policy, your personal information, or a privacy-rights request, please contact us:</p><p><strong>Noksa Customer Support</strong><br />Website: <a href="https://noksaofficial.com" target="_blank" rel="noopener noreferrer">noksaofficial.com</a><br />Contact: see our <Link href="/contact">contact page</Link><br />Business location: Bangladesh</p><p>At Noksa, we believe trust is built through honesty, care, and transparency. Thank you for choosing thoughtfully crafted products and being part of our journey.</p></>,
      },
    ],
  },
  "terms-and-conditions": {
    title: "Terms & conditions",
    description: "Terms for browsing Noksa, using the shopping bag, and viewing product information before checkout launches.",
    intro: "The terms for using the current Noksa website.",
    policy: true,
    sections: [
      {
        id: "website-use", title: "Using this website",
        content: <p>These terms cover browsing the Noksa website and using its shopping bag. Please use the site lawfully and avoid interfering with its operation, attempting unauthorized access, or misusing its content or services.</p>,
      },
      {
        id: "store-status", title: "Store status & shopping bag",
        content: <p>This is a prelaunch storefront. Online checkout and payments are not available. Adding a product to your bag does not submit an order, create a purchase contract, reserve inventory, or guarantee a price. We are not accepting payment through the current shopping bag.</p>,
      },
      {
        id: "product-information", title: "Products, prices & availability",
        content: <><p>Prices are displayed in U.S. dollars. Catalog information, prices, variants, and availability may change before launch. Final product prices, applicable taxes, and shipping charges must be disclosed before a future purchase is completed.</p><p>Handmade jute products may vary slightly in texture, color, and dimensions. Screen settings can also affect the appearance of product colors. Check the individual product description for details.</p></>,
      },
      {
        id: "future-orders", title: "Future orders, delivery & returns",
        content: <p>Purchase conditions, accepted payment methods, order acceptance, delivery commitments, cancellations, and returns will be finalized before checkout opens. Please review our <Link href="/shipping-policy">shipping policy</Link> and <Link href="/refund-policy">returns and refunds page</Link> for their current status. Nothing in these browsing terms removes rights provided by applicable law.</p>,
      },
      {
        id: "content", title: "Website content",
        content: <p>Noksa branding, text, and images are provided to help you learn about the collection. Rights in this material belong to their respective owners. Do not reuse protected content for commercial purposes without appropriate permission.</p>,
      },
      {
        id: "external-services", title: "External services & availability",
        content: <p>Links to outside retailers or services are governed by those providers’ terms. Website availability and product information may change as the store is developed. If information appears incorrect, check it again before relying on it to make a future purchase.</p>,
      },
      {
        id: "privacy", title: "Privacy",
        content: <p>Our <Link href="/privacy-policy">privacy policy</Link> explains the current site’s technical data, browser storage, and Google Tag Manager integration.</p>,
      },
      {
        id: "changes-contact", title: "Changes & contact details",
        content: <p>Updated terms will be posted here with a revised date. Legal business details and public support information will be added before ordering opens. Visit the <Link href="/contact">contact page</Link> for the current support status.</p>,
      },
    ],
  },
};
