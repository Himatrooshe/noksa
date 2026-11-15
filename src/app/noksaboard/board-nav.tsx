"use client";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/noksaboard", label: "Home", exact: true },
  { href: "/noksaboard/orders", label: "Orders" },
  { href: "/noksaboard/products", label: "Products" },
  { href: "/noksaboard/collections", label: "Collections" },
  { href: "/noksaboard/customers", label: "Customers" },
];

function NavLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      <span>{label}</span>
      {pending && (
        <span className="board-nav-pending" role="status">
          <span className="board-nav-spinner" aria-hidden="true" />
          <span className="sr-only">Loading {label}…</span>
        </span>
      )}
    </>
  );
}

export function BoardNav() {
  const pathname = usePathname();
  return (
    <nav className="board-nav" aria-label="Dashboard">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "board-nav-link active" : "board-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            <NavLabel label={link.label} />
          </Link>
        );
      })}
    </nav>
  );
}
