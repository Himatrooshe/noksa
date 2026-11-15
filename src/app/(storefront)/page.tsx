import Link from "next/link";
import { Icon } from "@/components/icons";
import { ProductGrid } from "@/components/product-grid";
import { getProducts } from "@/lib/products-server";
import { getPageMetadata } from "@/lib/site-url";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return getPageMetadata("/");
}
export default async function Home() {
  const products = await getProducts({ status: "storefront" });
  return (
    <main id="main-content">
      <section className="hero">
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
      <div className="brand-strip" aria-label="Noksa highlights">
        <span>Handmade Jute Products</span>
        <span>Handmade in Bangladesh</span>
        <span>available on Amazon</span>
        <span>available on Walmart</span>
        <span>Noksa</span>
      </div>
      <section className="collection section-space container" aria-labelledby="collection-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Thoughtful things, everyday use</p>
            <h2 id="collection-title">Naturally, your kind of everyday.</h2>
          </div>
          <Link href="/shop" className="inline-link">
            Explore the collection <Icon name="arrow" />
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
      <section id="our-story" className="story-section">
        <div className="container story-layout">
          <div className="story-visual">
            <span className="story-bangla" lang="bn" aria-hidden="true">
              পাট
            </span>
            <span>Jute. Our golden beginning.</span>
          </div>
          <div className="story-copy">
            <p className="eyebrow">Our story</p>
            <h2>
              From our roots,
              <br />
              to your everyday.
            </h2>
            <p>
              In Bangladesh, jute is known as the golden fiber. At Noksa, it’s the starting point
              for useful, beautiful things that feel at home in your life.
            </p>
            <p>
              We believe in natural materials, the character of handmade work, and thoughtful design
              that stays with you.
            </p>
            <Link href="/shop" className="inline-link">
              Find your everyday companion <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
      <section className="values-section container section-space" aria-label="Our values">
        <div>
          <Icon name="hand" />
          <h3>A human touch</h3>
          <p>Celebrating the care and character of work made by hand.</p>
        </div>
        <div>
          <Icon name="leaf" />
          <h3>Naturally considered</h3>
          <p>Jute at the heart of simple, practical design.</p>
        </div>
        <div>
          <Icon name="globe" />
          <h3>Rooted in Bangladesh</h3>
          <p>Local inspiration, made to be part of your everyday.</p>
        </div>
      </section>
      <section id="custom-orders" className="custom-section container">
        <div>
          <p className="eyebrow">Custom & bulk</p>
          <h2>
            Your idea.
            <br />A natural beginning.
          </h2>
        </div>
        <div>
          <p>
            Thoughtful gifts, a bag with your brand on it, or something made for a special occasion.
            Let’s make it yours.
          </p>
          <Link className="button button-outline" href="/contact#custom-bulk">
            Get in touch <Icon name="arrow" />
          </Link>
          <span className="custom-note">Custom order enquiries open at launch.</span>
        </div>
      </section>
    </main>
  );
}
