import Link from "next/link";
import type { ReactNode } from "react";
import type { ProductStatus } from "@/lib/products";
import {
  FULFILLMENT_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  type FulfillmentStatus,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/orders";

// Small presentational pieces shared across dashboard pages. No hooks, so
// they work in both Server and Client Components.

type Tone = "neutral" | "success" | "warning" | "critical" | "info";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`board-badge board-badge-${tone}`}>{children}</span>;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const tone: Record<ProductStatus, Tone> = { active: "success", draft: "info", archived: "neutral" };
  return <Badge tone={tone[status]}>{status[0].toUpperCase() + status.slice(1)}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const tone: Record<PaymentStatus, Tone> = {
    pending: "warning",
    paid: "neutral",
    refunded: "neutral",
    voided: "neutral",
  };
  return <Badge tone={tone[status]}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const tone: Record<FulfillmentStatus, Tone> = {
    unfulfilled: "warning",
    fulfilled: "info",
    delivered: "success",
  };
  return <Badge tone={tone[status]}>{FULFILLMENT_STATUS_LABEL[status]}</Badge>;
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "open") return null;
  return <Badge tone={status === "cancelled" ? "critical" : "neutral"}>{status === "cancelled" ? "Cancelled" : "Archived"}</Badge>;
}

export function PageHeader({
  title,
  back,
  badges,
  actions,
  subtitle,
}: {
  title: ReactNode;
  back?: { href: string; label: string };
  badges?: ReactNode;
  actions?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="board-page-header">
      <div className="board-page-heading">
        {back && (
          <Link href={back.href} className="board-back" aria-label={back.label}>
            ←
          </Link>
        )}
        <div>
          <div className="board-title-row">
            <h1 className="board-title">{title}</h1>
            {badges}
          </div>
          {subtitle && <p className="board-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="board-page-actions">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  flush = false,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={flush ? "board-card board-card-flush" : "board-card"}>
      {(title || actions) && (
        <div className="board-card-header">
          {title && <h2 className="board-card-title">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

/** Tab strip driven by a search param (server-rendered links). */
export function Tabs({
  tabs,
  active,
}: {
  tabs: { key: string; label: string; href: string; count?: number }[];
  active: string;
}) {
  return (
    <nav className="board-tabs" aria-label="Views">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={t.key === active ? "board-tab active" : "board-tab"}
          aria-current={t.key === active ? "page" : undefined}
        >
          {t.label}
          {typeof t.count === "number" && t.count > 0 && <span className="board-tab-count">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** GET search box that keeps other params (e.g. the active tab). */
export function SearchBox({
  placeholder,
  defaultValue,
  hidden,
}: {
  placeholder: string;
  defaultValue?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form className="board-search" role="search">
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input type="search" name="q" placeholder={placeholder} defaultValue={defaultValue} aria-label={placeholder} />
    </form>
  );
}
