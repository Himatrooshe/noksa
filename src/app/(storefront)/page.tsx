import Link from "next/link";
import { Icon } from "@/components/icons";
import { imageUrl } from "@/lib/image-url";
import { getCategoryCovers } from "@/lib/products-server";
import { getShowcasedVideo } from "@/lib/videos-server";
import { VideoShowcase } from "@/components/video-showcase";
import { HomeMotion } from "@/components/home-motion";
import { CategoryPanels } from "@/components/category-panels";
import { getPageMetadata } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return getPageMetadata("/");
}
const ABOUT_IMAGE = "https://ik.imagekit.io/7w1lv8vah/noksa/about/jute-harvesting.jpg";

export default async function Home() {
  const [covers, showcasedVideo] = await Promise.all([
    getCategoryCovers(
      ["fanny-bag-desert-sand", "sling-bag-tuscan-green", "tote-bag-orange-wave"],
      ["grocery-bags"],
    ),
    getShowcasedVideo(),
  ]);
  const productImage = (slug: string) => covers[slug] ?? null;
  const collectionImage = (handle: string) => covers[handle] ?? null;
  const bulkImage = collectionImage("grocery-bags");
  const categories = [
    {
      key: "fanny",
      label: "Fanny Pack",
      note: "Hands-free, every day",
      filter: "Fanny bags",
      image: productImage("fanny-bag-desert-sand"),
    },
    {
      key: "sling",
      label: "Sling Bag",
      note: "Woven, light, crossbody",
      filter: "Sling bags",
      image: productImage("sling-bag-tuscan-green"),
    },
    {
      key: "grocery",
      label: "Heavy Grocery / Beach Bag",
      note: "Strong enough for market days",
      filter: "Grocery bags",
      image: collectionImage("grocery-bags"),
    },
    {
      key: "tote",
      label: "Signature Tote",
      note: "Our wave-weave classic",
      filter: "Tote bags",
      image: productImage("tote-bag-orange-wave"),
    },
  ];
  return (
    <main id="main-content">
      <section className="hero">
        {/* The sun sits behind the backdrop so the mountains stay in front as it rises. */}
        <span className="hero-sun-wrap" aria-hidden="true">
          <img className="hero-sun" src="/noksa-hero-sun.svg" alt="" />
        </span>
        <img
          className="hero-backdrop"
          src="/Background Image p1-cropped.svg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">Handmade Jute Products</p>
            <h1>
              The Art of
              <br />
              <span>
                Sustainable
                <br />
                Living
              </span>
            </h1>
            <p className="hero-description">
              Bangladesh’s golden fiber, shaped by skilled hands into bags you’ll carry every day.
            </p>
            <Link href="/shop" className="button hero-button">
              Shop now <Icon name="arrow" />
            </Link>
            <div className="hero-values">
              <div>
                Handmade<span>by artisans</span>
              </div>
              <div>
                Natural jute<span>Golden fiber</span>
              </div>
              <div>
                Made to travel<span>Every day, everywhere</span>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <img
              className="hero-logo"
              src="/noksa-logo.svg"
              alt="Noksa — The art of sustainable living"
              width="355"
              height="354"
            />
          </div>
        </div>
      </section>
      <div className="notice-strip" aria-label="Where to buy Noksa">
        <KanthaVine />
        <p>
          For USA retail, discover NOKSA only at <strong>Amazon</strong>.
          <br className="notice-break" /> For bulk orders, visit our own platform:{" "}
          <a href="https://bizbeeofficial.com/noksa/" target="_blank" rel="noopener noreferrer">
            bizbeeofficial.com/noksa
          </a>
        </p>
        <KanthaVine mirrored />
      </div>
      <section className="categories" aria-labelledby="categories-title">
        <div className="container">
          <div className="categories-head">
            <div>
              <p className="eyebrow">Shop by category</p>
              <h2 id="categories-title">
                Find your <span>everyday</span> bag.
              </h2>
            </div>
            <div className="categories-intro">
              <p>Four shapes, one golden fiber. Handmade in Bangladesh and made to be carried.</p>
              <Link href="/shop" className="inline-link">
                Shop all products <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <CategoryPanels
            categories={categories.map((category) => ({
              key: category.key,
              label: category.label,
              note: category.note,
              image: category.image,
              href: `/shop?category=${encodeURIComponent(category.filter)}`,
            }))}
          />
        </div>
      </section>
      {showcasedVideo && (
        <VideoShowcase title={showcasedVideo.title} caption={showcasedVideo.caption} url={showcasedVideo.url} />
      )}
      <section id="our-story" className="about-teaser" aria-labelledby="about-teaser-title">
        <div className="container about-teaser-inner">
          <figure className="about-teaser-visual">
            <span className="about-teaser-frame">
              <img
                src={imageUrl(ABOUT_IMAGE, 960)}
                srcSet={[640, 960, 1400].map((w) => `${imageUrl(ABOUT_IMAGE, w)} ${w}w`).join(", ")}
                sizes="(max-width: 900px) 100vw, 45vw"
                alt="A farmer harvesting tall jute plants in a field in Bangladesh"
                loading="lazy"
              />
            </span>
            <span className="about-teaser-tag">Golden fiber · Bangladesh</span>
            <figcaption className="photo-credit">
              Photo:{" "}
              <a href="https://commons.wikimedia.org/wiki/File:Jute_Harvesting.jpg" target="_blank" rel="noopener noreferrer">
                হানিফ আলী
              </a>
              ,{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
                CC BY 4.0
              </a>
            </figcaption>
          </figure>
          <div className="about-teaser-copy">
            <span className="about-teaser-watermark" lang="bn" aria-hidden="true">
              পাট
            </span>
            <p className="eyebrow">About NOKSA</p>
            <h2 id="about-teaser-title">
              Every piece tells a <span>story</span>.
            </h2>
            <blockquote className="about-teaser-lead">
              Of skilled hands, creativity, and dedication. What began with a passion for preserving our
              heritage has grown into a vision of sharing Bangladeshi craftsmanship with the world.
            </blockquote>
            <p>
              At Noksa, we don’t simply create products; we celebrate the people, traditions, and purpose
              behind them. Our journey is rooted in nature, shaped by craftsmanship, and driven by a dream to
              make a meaningful difference, one creation at a time.
            </p>
            <Link href="/about" className="inline-link">
              Read our story <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
      <section className="values" aria-labelledby="values-title">
        <div className="container">
          <p className="eyebrow values-eyebrow" id="values-title">
            Why NOKSA
          </p>
          <p className="values-statement" data-scrub-words>
            Every NOKSA piece is <em>made by hand</em>, shaped from <em>natural jute</em>, and{" "}
            <em>rooted in Bangladesh</em>, the land of the golden fiber.
          </p>
          <ul className="values-row">
            {[
              {
                icon: "hand" as const,
                title: "A human touch",
                text: "The care and character of work made by hand, so no two pieces are quite the same.",
              },
              {
                icon: "leaf" as const,
                title: "Naturally considered",
                text: "A renewable fiber, shaped into simple, practical things you’ll use every day.",
              },
              {
                icon: "globe" as const,
                title: "Rooted in Bangladesh",
                text: "Local heritage, carried from the golden fields of Bangladesh to your everyday.",
              },
            ].map((value) => (
              <li key={value.title} className="value">
                <span className="value-line" aria-hidden="true" />
                <span className="value-icon">
                  <Icon name={value.icon} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="custom-orders" className="bulk" aria-labelledby="bulk-title">
        <div className="container">
          <div className="bulk-card">
            <div className="bulk-copy">
              <p className="eyebrow">Custom & bulk</p>
              <h2 id="bulk-title">
                Your idea. <span>A natural beginning.</span>
              </h2>
              <p className="bulk-lead">
                Thoughtful gifts, a bag with your brand on it, or something made for a special occasion. Let’s
                make it yours, by hand, in jute.
              </p>
              <ul className="bulk-uses" aria-label="What we can make">
                <li>Corporate gifts</li>
                <li>Branded totes</li>
                <li>Events & weddings</li>
                <li>Retail & wholesale</li>
              </ul>
              <div className="bulk-actions">
                <Link className="button bulk-primary" href="/contact#custom-bulk">
                  Start a custom order <Icon name="arrow" />
                </Link>
                <a
                  className="bulk-secondary"
                  href="https://bizbeeofficial.com/noksa/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Order in bulk at bizbeeofficial.com/noksa
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className="bulk-note">Custom order enquiries open at launch.</p>
            </div>
            <figure className="bulk-visual">
              {bulkImage && (
                <img
                  src={imageUrl(bulkImage, 960)}
                  srcSet={[640, 960, 1400].map((w) => `${imageUrl(bulkImage, w)} ${w}w`).join(", ")}
                  sizes="(max-width: 900px) 100vw, 40vw"
                  alt="Two handmade jute grocery bags with leather Noksa patches"
                  loading="lazy"
                />
              )}
              <svg className="bulk-badge" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <path id="bulk-badge-circle" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0" />
                </defs>
                <circle cx="60" cy="60" r="58" />
                <text>
                  <textPath href="#bulk-badge-circle" textLength="274" lengthAdjust="spacing">
                    Made to order · Handmade in Bangladesh ·
                  </textPath>
                </text>
                <path className="bulk-badge-leaf" d="M60 44c9 6 10 18 0 30-10-12-9-24 0-30Z" />
              </svg>
            </figure>
          </div>
        </div>
      </section>
      <HomeMotion />
    </main>
  );
}

// Nakshi kantha vine: a hand-stitched tendril that blooms into a lotus beside the text.
function KanthaVine({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <span className={`kantha-vine${mirrored ? " kantha-vine-mirrored" : ""}`} aria-hidden="true">
      <span className="kantha-vine-line" />
      <svg className="kantha-lotus" viewBox="0 0 36 28">
        <path className="lotus-outer" d="M18 24C11 25 5 22 2 17c6-1 12 2 16 7Z" />
        <path className="lotus-outer" d="M18 24c7 1 13-2 16-7-6-1-12 2-16 7Z" />
        <path className="lotus-side" d="M18 24C11 21 7 15 7 9c6 2 10 8 11 15Z" />
        <path className="lotus-side" d="M18 24c7-3 11-9 11-15-6 2-10 8-11 15Z" />
        <path className="lotus-center" d="M18 3c-4 6-4 15 0 21 4-6 4-15 0-21Z" />
        <circle className="lotus-center" cx="11" cy="27" r="0.9" />
        <circle className="lotus-center" cx="18" cy="27" r="0.9" />
        <circle className="lotus-center" cx="25" cy="27" r="0.9" />
      </svg>
    </span>
  );
}
