"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { useCart } from "./cart-provider";
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, open } = useCart();
  const pathname = usePathname();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="site-header">
      <div className="top-border" aria-hidden="true" />
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Noksa home">
          <span className="brand-symbol" aria-hidden="true">
            ন
          </span>
          <span>NOKSA</span>
        </Link>
        <nav
          id="main-navigation"
          className={`main-nav ${menuOpen ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <Link
            href="/shop"
            aria-current={pathname.startsWith("/shop") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Shop
          </Link>
          <Link href="/#our-story" onClick={() => setMenuOpen(false)}>
            Our Story
          </Link>
          <Link href="/#custom-orders" onClick={() => setMenuOpen(false)}>
            Custom & Bulk
          </Link>
          <Link href="/#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </nav>
        <div className="header-actions">
          <Link href="/shop" className="button button-small header-shop">
            Shop now
          </Link>
          <button
            className="icon-button bag-toggle"
            onClick={open}
            aria-label={`Open shopping bag, ${count} items`}
          >
            <Icon name="bag" />
            {count > 0 && <span className="bag-count">{count}</span>}
          </button>
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}
