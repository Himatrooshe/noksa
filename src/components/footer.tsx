import Link from "next/link";
export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-main container">
        <div>
          <Link href="/" className="footer-brand">
            NOKSA<span>নকশা</span>
          </Link>
          <p>
            The art of sustainable living.
            <br />
            Rooted in Bangladesh. Made for every day.
          </p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/shop">Shop the collection</Link>
          <Link href="/#our-story">Our story</Link>
          <Link href="/#custom-orders">Custom & bulk orders</Link>
        </div>
        <div>
          <h3>Let’s stay in touch</h3>
          <p>
            For product questions, collaborations,
            <br />
            and a little conversation.
          </p>
          <p className="contact-pending">Contact details coming at launch.</p>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Noksa. Made with care.</span>
        <span>Thoughtfully made. Naturally yours.</span>
      </div>
    </footer>
  );
}
