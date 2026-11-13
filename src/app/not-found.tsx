import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="container not-found">
      <p className="eyebrow">Page not found</p>
      <h1>Let’s find your way back.</h1>
      <p>The page or product you’re looking for isn’t here.</p>
      <Link href="/shop" className="button">
        Explore the collection
      </Link>
    </main>
  );
}
