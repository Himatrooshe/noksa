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
          <Link href="/about">Our story</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/#custom-orders">Custom & bulk orders</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>Customer care</h3>
          <Link href="/faq">Frequently asked questions</Link>
          <Link href="/shipping-policy">Shipping policy</Link>
          <Link href="/refund-policy">Returns & refunds</Link>
        </div>
        <div>
          <h3>Let’s stay in touch</h3>
          <p>
            For product questions, collaborations,
            <br />
            and a little conversation.
          </p>
          <Link href="/contact">Support & inquiries</Link>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} Noksa. Made with care.</span>
        <nav aria-label="Legal information" className="footer-legal">
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/terms-and-conditions">Terms & conditions</Link>
        </nav>
      </div>
    </footer>
  );
}
