import Link from "next/link";
import { Icon } from "@/components/icons";
import { AboutMotion } from "@/components/about-motion";
import { imageUrl } from "@/lib/image-url";
import { informationContent } from "@/lib/information-content";
import { getPageMetadata } from "@/lib/site-url";

const content = informationContent["about"];

const IMAGES = {
  tradition: "https://ik.imagekit.io/7w1lv8vah/noksa/about/jute-tradition.jpg",
  peeling: "https://ik.imagekit.io/7w1lv8vah/noksa/about/jute-peeling.jpg",
};

const ARTICLE_URL = "https://medium.com/@fahim.2jz/from-bogura-to-the-world-057ea48641c5";

const CREDITS = [
  {
    label: "Jute harvesting tradition",
    author: "Muhammad Amdad Hossain",
    source: "https://commons.wikimedia.org/wiki/File:Jute_Harvesting_Tradition.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    label: "Peeling off the jute fibre",
    author: "Nahid Hossain",
    source: "https://commons.wikimedia.org/wiki/File:Peeling_off_the_jute_fibre_(36306289172).jpg",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  {
    label: "Jute harvesting",
    author: "হানিফ আলী",
    source: "https://commons.wikimedia.org/wiki/File:Jute_Harvesting.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
];

export async function generateMetadata() {
  return getPageMetadata("/about", content.title, content.description);
}

function Photo({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <img
      src={imageUrl(src, 1200)}
      srcSet={[640, 960, 1400, 1920].map((w) => `${imageUrl(src, w)} ${w}w`).join(", ")}
      sizes="(max-width: 900px) 100vw, 50vw"
      alt={alt}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

export default function AboutPage() {
  return (
    <main id="main-content" className="about-page">
      <header className="about-hero">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>About</span>
          </nav>
          <p className="eyebrow">Our story</p>
          <h1>
            About <span>NOKSA</span>{" "}
            <span className="about-hero-bangla" lang="bn">
              নকশা
            </span>
          </h1>
          <p className="about-hero-intro">
            A Bangladeshi jute lifestyle brand, carrying the art and heritage of the golden fiber into the
            things you use every day.
          </p>
        </div>
      </header>

      <section className="about-split" aria-labelledby="what-is-noksa">
        <div className="about-split-copy">
          <p className="about-split-number" aria-hidden="true">01</p>
          <p className="eyebrow">Who we are</p>
          <h2 id="what-is-noksa">
            What is <span>NOKSA</span>
          </h2>
          <p className="about-split-lead">
            NOKSA (<span lang="bn">নকশা</span>) is an eco-friendly, fashion-forward Bangladeshi jute lifestyle
            brand. We create stylish, practical, and functional products using the natural beauty of
            Bangladeshi jute.
          </p>
          <p>
            Our vision is clearly defined: we are here to spread the art and heritage of Bangladeshi jute
            culture around the globe, through modern designs that people can use every day.
          </p>
          <p>
            NOKSA connects Bangladeshi culture and craftsmanship to people worldwide through the seamless union
            of natural resources.
          </p>
          <ul className="about-pillars" aria-label="What we stand for">
            <li>Eco-friendly</li>
            <li>Fashion-forward</li>
            <li>Made in Bangladesh</li>
          </ul>
        </div>
        <figure className="about-split-media">
          <Photo
            src={IMAGES.tradition}
            alt="Aerial view of jute bundles drying beside the water in a Bangladeshi village"
            eager
          />
        </figure>
      </section>

      <section className="about-split about-split-dark about-split-reverse" aria-labelledby="bangladeshi-jute">
        <figure className="about-split-media">
          <Photo src={IMAGES.peeling} alt="Workers standing in water, peeling jute fibre from the stalks" />
        </figure>
        <div className="about-split-copy">
          <p className="about-split-number" aria-hidden="true">02</p>
          <p className="eyebrow">The golden fiber</p>
          <h2 id="bangladeshi-jute">
            To know about <span>Bangladeshi</span> jute
          </h2>
          <p className="about-split-lead">
            Interested in learning more about the history, heritage, and importance of Bangladeshi jute?
          </p>
          <p>
            We invite you to explore this article by our owner, Fahim Shahria, about the country’s jute and its
            significance.
          </p>
          <a className="about-article" href={ARTICLE_URL} target="_blank" rel="noopener noreferrer">
            <span className="about-article-meta">Read on Medium · Fahim Shahria</span>
            <span className="about-article-title">From Bogura to the world</span>
            <span className="about-article-go" aria-hidden="true">
              <Icon name="arrow" />
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta-inner">
          <h2>
            Carry a piece of the <span>golden fiber</span>.
          </h2>
          <Link href="/shop" className="button">
            Explore the collection <Icon name="arrow" />
          </Link>
        </div>
      </section>

      <div className="container about-credits">
        <p>
          Photos from Wikimedia Commons:{" "}
          {CREDITS.map((credit, index) => (
            <span key={credit.source}>
              <a href={credit.source} target="_blank" rel="noopener noreferrer">
                {credit.label}
              </a>{" "}
              by {credit.author} (
              <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                {credit.license}
              </a>
              ){index < CREDITS.length - 1 ? "; " : "."}
            </span>
          ))}
        </p>
      </div>
      <AboutMotion />
    </main>
  );
}
