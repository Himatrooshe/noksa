import "server-only";
import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { isUuid } from "@/lib/products-server";
import {
  paymentMethodLabel,
  type CustomerDetail,
  type CustomerSummary,
  type FulfillmentStatus,
  type OrderDetail,
  type OrderStatus,
  type OrderSummary,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/orders";

/** Neon returns timestamptz as Date; normalize for serialization. */
function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}
function isoOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : iso(value);
}
function pgCode(err: unknown): string | undefined {
  return err && typeof err === "object" && "code" in err ? String(err.code) : undefined;
}

// ---------------------------------------------------------------------------
// Order list / detail
// ---------------------------------------------------------------------------

export type OrderTab = "all" | "unfulfilled" | "unpaid" | "open" | "archived";

type OrderSummaryRow = {
  id: string;
  order_number: number;
  created_at: unknown;
  customer_name: string;
  customer_phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  payment_method: PaymentMethod;
  total: number;
  item_count: number;
};

function mapSummary(r: OrderSummaryRow): OrderSummary {
  return {
    id: r.id,
    orderNumber: Number(r.order_number),
    createdAt: iso(r.created_at),
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    status: r.status,
    paymentStatus: r.payment_status,
    fulfillmentStatus: r.fulfillment_status,
    paymentMethod: r.payment_method,
    total: Number(r.total),
    itemCount: Number(r.item_count),
  };
}

export async function getOrders(opts: { tab?: OrderTab; q?: string; customerId?: string } = {}): Promise<OrderSummary[]> {
  const tab = opts.tab ?? "all";
  const raw = opts.q?.trim() ?? "";
  const numberQuery = /^#?\d+$/.test(raw) ? Number(raw.replace("#", "")) : null;
  const textQuery = raw && numberQuery === null ? `%${raw.replace(/[\\%_]/g, (c) => `\\${c}`)}%` : null;
  const customerId = opts.customerId && isUuid(opts.customerId) ? opts.customerId : null;

  const rows = (await sql`
    select o.id, o.order_number, o.created_at, o.customer_name, o.customer_phone,
           o.status, o.payment_status, o.fulfillment_status, o.payment_method, o.total,
           coalesce((select sum(quantity) from order_items i where i.order_id = o.id), 0)::int as item_count
    from orders o
    where (
        (${tab} = 'all' and o.status <> 'archived')
        or (${tab} = 'open' and o.status = 'open')
        or (${tab} = 'archived' and o.status = 'archived')
        or (${tab} = 'unfulfilled' and o.status = 'open' and o.fulfillment_status = 'unfulfilled')
        or (${tab} = 'unpaid' and o.status = 'open' and o.payment_status = 'pending')
      )
      and (${numberQuery}::int is null or o.order_number = ${numberQuery})
      and (${textQuery}::text is null or o.customer_name ilike ${textQuery} or o.customer_phone ilike ${textQuery})
      and (${customerId}::uuid is null or o.customer_id = ${customerId})
    order by o.created_at desc
    limit 200
  `) as unknown as OrderSummaryRow[];
  return rows.map(mapSummary);
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  if (!isUuid(id)) return null;
  const [orders, lines, events] = (await Promise.all([
    sql`
      select o.*,
             coalesce((select sum(quantity) from order_items i where i.order_id = o.id), 0)::int as item_count
      from orders o where o.id = ${id}
    `,
    sql`
      select id, product_id, variant_id, product_name, variant_title, sku, quantity, unit_price
      from order_items where order_id = ${id}
    `,
    sql`select id, message, created_at from order_events where order_id = ${id} order by created_at desc`,
  ])) as unknown as [Record<string, unknown>[], Record<string, unknown>[], Record<string, unknown>[]];
  const o = orders[0];
  if (!o) return null;

  return {
    ...mapSummary(o as unknown as OrderSummaryRow),
    customerId: (o.customer_id as string | null) ?? null,
    customerEmail: (o.customer_email as string | null) ?? null,
    shippingAddress: (o.shipping_address as string | null) ?? null,
    transactionId: (o.transaction_id as string | null) ?? null,
    subtotal: Number(o.subtotal),
    shippingFee: Number(o.shipping_fee),
    discount: Number(o.discount),
    note: String(o.note ?? ""),
    courier: (o.courier as string | null) ?? null,
    trackingNumber: (o.tracking_number as string | null) ?? null,
    paidAt: isoOrNull(o.paid_at),
    fulfilledAt: isoOrNull(o.fulfilled_at),
    deliveredAt: isoOrNull(o.delivered_at),
    cancelledAt: isoOrNull(o.cancelled_at),
    lines: lines.map((l) => ({
      id: String(l.id),
      productId: (l.product_id as string | null) ?? null,
      variantId: (l.variant_id as string | null) ?? null,
      productName: String(l.product_name),
      variantTitle: (l.variant_title as string | null) ?? null,
      sku: (l.sku as string | null) ?? null,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
    })),
    events: events.map((e) => ({ id: String(e.id), message: String(e.message), createdAt: iso(e.created_at) })),
  };
}

export async function getOrderTabCounts(): Promise<Record<"unfulfilled" | "unpaid", number>> {
  const [row] = (await sql`
    select
      count(*) filter (where status = 'open' and fulfillment_status = 'unfulfilled')::int as unfulfilled,
      count(*) filter (where status = 'open' and payment_status = 'pending')::int as unpaid
    from orders
  `) as unknown as { unfulfilled: number; unpaid: number }[];
  return row;
}

// ---------------------------------------------------------------------------
// Create order (manual: phone / Facebook / WhatsApp / in person)
// ---------------------------------------------------------------------------

export type CreateOrderInput = {
  customer: { name: string; phone: string; email: string | null; address: string | null; city: string | null };
  lines: { variantId: string; quantity: number }[];
  shippingFee: number;
  discount: number;
  paymentMethod: PaymentMethod;
  markPaid: boolean;
  transactionId: string | null;
  note: string;
};

type VariantLookupRow = {
  variant_id: string;
  product_id: string;
  product_name: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: number;
  sku: string | null;
  track_inventory: boolean;
};

/** Returns the new order's id. Stock is decremented in the same transaction;
 * the DB trigger rolls everything back if any line would oversell. */
export async function createOrder(input: CreateOrderInput): Promise<string> {
  const variantIds = input.lines.map((l) => l.variantId).filter(isUuid);
  if (variantIds.length !== input.lines.length) throw new Error("An order line has an invalid product.");

  const variants = (await sql`
    select v.id as variant_id, p.id as product_id, p.name as product_name,
           v.option1, v.option2, v.option3, v.price, v.sku, p.track_inventory
    from product_variants v join products p on p.id = v.product_id
    where v.id = any(${variantIds}::uuid[])
  `) as unknown as VariantLookupRow[];
  const byId = new Map(variants.map((v) => [v.variant_id, v]));

  const lines = input.lines.map((line) => {
    const v = byId.get(line.variantId);
    if (!v) throw new Error("A product in this order no longer exists. Remove it and try again.");
    const opts = [v.option1, v.option2, v.option3].filter((o): o is string => o !== null);
    return {
      ...line,
      productId: v.product_id,
      productName: v.product_name,
      variantTitle: opts.length ? opts.join(" / ") : null,
      sku: v.sku,
      unitPrice: Number(v.price),
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const total = subtotal + input.shippingFee - input.discount;
  if (total < 0) throw new Error("The discount is larger than the order total.");

  const orderId = crypto.randomUUID();
  const c = input.customer;
  const paymentStatus: PaymentStatus = input.markPaid ? "paid" : "pending";

  const queries = [
    sql`
      insert into customers (name, phone, email, address, city)
      values (${c.name}, ${c.phone}, ${c.email}, ${c.address}, ${c.city})
      on conflict (phone) do update set
        name = excluded.name,
        email = coalesce(excluded.email, customers.email),
        address = coalesce(excluded.address, customers.address),
        city = coalesce(excluded.city, customers.city)
    `,
    sql`
      insert into orders (
        id, customer_id, customer_name, customer_email, customer_phone, shipping_address,
        status, payment_status, fulfillment_status, payment_method, transaction_id,
        subtotal, shipping_fee, discount, total, note, paid_at
      ) values (
        ${orderId}, (select id from customers where phone = ${c.phone}), ${c.name}, ${c.email}, ${c.phone},
        ${[c.address, c.city].filter(Boolean).join(", ") || null},
        'open', ${paymentStatus}, 'unfulfilled', ${input.paymentMethod}, ${input.transactionId},
        ${subtotal}, ${input.shippingFee}, ${input.discount}, ${total}, ${input.note},
        ${input.markPaid ? new Date().toISOString() : null}
      )
    `,
    ...lines.map(
      (l) => sql`
        insert into order_items (order_id, product_id, variant_id, product_name, variant_title, sku, quantity, unit_price)
        values (${orderId}, ${l.productId}, ${l.variantId}, ${l.productName}, ${l.variantTitle}, ${l.sku}, ${l.quantity}, ${l.unitPrice})
      `,
    ),
    ...lines.map(
      (l) => sql`
        update product_variants set stock = stock - ${l.quantity}
        where id = ${l.variantId}
          and exists (select 1 from products p where p.id = product_variants.product_id and p.track_inventory)
      `,
    ),
    sql`insert into order_events (order_id, message) values (${orderId}, ${"Order created in the dashboard."})`,
  ];
  if (input.markPaid) {
    queries.push(sql`
      insert into order_events (order_id, message)
      values (${orderId}, ${`Marked ${formatPrice(total)} as paid via ${paymentMethodLabel(input.paymentMethod)}${input.transactionId ? ` (Txn ${input.transactionId})` : ""}.`})
    `);
  }

  try {
    await sql.transaction(queries);
  } catch (err) {
    if (pgCode(err) === "P0001" && err instanceof Error) throw new Error(err.message);
    throw new Error(`Couldn't create the order: ${err instanceof Error ? err.message : err}`);
  }
  return orderId;
}

// ---------------------------------------------------------------------------
// Order actions
// ---------------------------------------------------------------------------

async function addEvent(orderId: string, message: string) {
  await sql`insert into order_events (order_id, message) values (${orderId}, ${message})`;
}

export async function markOrderPaid(id: string, method: PaymentMethod, transactionId: string | null): Promise<void> {
  const rows = (await sql`
    update orders set payment_status = 'paid', payment_method = ${method},
      transaction_id = ${transactionId}, paid_at = now()
    where id = ${id} and payment_status = 'pending' and status <> 'cancelled'
    returning total
  `) as unknown as { total: number }[];
  if (rows.length === 0) throw new Error("This order can't be marked as paid.");
  await addEvent(
    id,
    `Marked ${formatPrice(Number(rows[0].total))} as paid via ${paymentMethodLabel(method)}${transactionId ? ` (Txn ${transactionId})` : ""}.`,
  );
}

export async function markOrderRefunded(id: string): Promise<void> {
  const rows = await sql`
    update orders set payment_status = 'refunded' where id = ${id} and payment_status = 'paid' returning id
  `;
  if (rows.length === 0) throw new Error("Only paid orders can be marked as refunded.");
  await addEvent(id, "Payment marked as refunded.");
}

export async function fulfillOrder(id: string, courier: string | null, tracking: string | null): Promise<void> {
  const rows = await sql`
    update orders set fulfillment_status = 'fulfilled', courier = ${courier},
      tracking_number = ${tracking}, fulfilled_at = now()
    where id = ${id} and fulfillment_status = 'unfulfilled' and status = 'open'
    returning id
  `;
  if (rows.length === 0) throw new Error("This order can't be marked as shipped.");
  await addEvent(
    id,
    `Marked as shipped${courier ? ` with ${courier}` : ""}${tracking ? ` (tracking ${tracking})` : ""}.`,
  );
}

export async function markOrderDelivered(id: string): Promise<void> {
  const rows = await sql`
    update orders set fulfillment_status = 'delivered', delivered_at = now()
    where id = ${id} and fulfillment_status = 'fulfilled' and status = 'open'
    returning id
  `;
  if (rows.length === 0) throw new Error("Only shipped orders can be marked as delivered.");
  await addEvent(id, "Marked as delivered.");
}

export async function cancelOrder(id: string, restock: boolean): Promise<void> {
  const [order] = (await sql`select status from orders where id = ${id}`) as unknown as { status: OrderStatus }[];
  if (!order) throw new Error("Order not found.");
  if (order.status === "cancelled") throw new Error("This order is already cancelled.");

  const queries = [
    sql`
      update orders set status = 'cancelled', cancelled_at = now(),
        payment_status = case when payment_status = 'pending' then 'voided' else payment_status end
      where id = ${id} and status <> 'cancelled'
    `,
  ];
  if (restock) {
    queries.push(sql`
      update product_variants v set stock = v.stock + i.quantity
      from order_items i
      where i.order_id = ${id} and i.variant_id = v.id
        and exists (select 1 from products p where p.id = v.product_id and p.track_inventory)
    `);
  }
  queries.push(sql`
    insert into order_events (order_id, message)
    values (${id}, ${restock ? "Order cancelled. Items restocked." : "Order cancelled."})
  `);
  await sql.transaction(queries);
}

export async function setOrderArchived(id: string, archived: boolean): Promise<void> {
  if (archived) {
    await sql`update orders set status = 'archived', archived_at = now() where id = ${id} and status = 'open'`;
  } else {
    await sql`update orders set status = 'open', archived_at = null where id = ${id} and status = 'archived'`;
  }
  await addEvent(id, archived ? "Order archived." : "Order unarchived.");
}

export async function updateOrderNote(id: string, note: string): Promise<void> {
  await sql`update orders set note = ${note} where id = ${id}`;
}

export async function addOrderComment(id: string, message: string): Promise<void> {
  await addEvent(id, message);
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  note: string;
  created_at: unknown;
  order_count: number;
  amount_spent: number;
};

function mapCustomer(r: CustomerRow): CustomerSummary {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    orderCount: Number(r.order_count),
    amountSpent: Number(r.amount_spent),
    createdAt: iso(r.created_at),
  };
}

const CUSTOMER_STATS = `
  (select count(*) from orders o where o.customer_id = c.id and o.status <> 'cancelled')::int as order_count,
  (select coalesce(sum(o.total), 0) from orders o where o.customer_id = c.id and o.status <> 'cancelled')::int as amount_spent
`;

export async function getCustomers(q?: string): Promise<CustomerSummary[]> {
  const pattern = q?.trim() ? `%${q.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%` : null;
  const rows = (await sql`
    select c.*, ${sql.unsafe(CUSTOMER_STATS)}
    from customers c
    where (${pattern}::text is null or c.name ilike ${pattern} or c.phone ilike ${pattern} or c.email ilike ${pattern})
    order by c.created_at desc
    limit 200
  `) as unknown as CustomerRow[];
  return rows.map(mapCustomer);
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  if (!isUuid(id)) return null;
  const rows = (await sql`
    select c.*, ${sql.unsafe(CUSTOMER_STATS)} from customers c where c.id = ${id}
  `) as unknown as CustomerRow[];
  const r = rows[0];
  if (!r) return null;
  const orders = await getOrders({ tab: "all", customerId: id });
  const archived = await getOrders({ tab: "archived", customerId: id });
  return {
    ...mapCustomer(r),
    address: r.address,
    note: r.note,
    orders: [...orders, ...archived].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

export type CustomerInput = { name: string; phone: string; email: string | null; address: string | null; city: string | null; note: string };

export async function updateCustomer(id: string, input: CustomerInput): Promise<void> {
  try {
    await sql`
      update customers set name = ${input.name}, phone = ${input.phone}, email = ${input.email},
        address = ${input.address}, city = ${input.city}, note = ${input.note}
      where id = ${id}
    `;
  } catch (err) {
    if (pgCode(err) === "23505") throw new Error(`Another customer already has the phone number ${input.phone}.`);
    throw err;
  }
}

/** Lightweight lookup for the create-order form. */
export async function findCustomerByPhone(phone: string) {
  const rows = (await sql`
    select name, phone, email, address, city from customers where phone = ${phone}
  `) as unknown as { name: string; phone: string; email: string | null; address: string | null; city: string | null }[];
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export type HomeRange = "today" | "7d" | "30d" | "all";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000; // UTC+6, no daylight saving
const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the range as an ISO timestamp, or null for all time. "today"
 * starts at midnight Bangladesh time, not server (UTC) midnight. */
function rangeStart(range: HomeRange, now = Date.now()): string | null {
  if (range === "all") return null;
  if (range === "today") {
    const localMidnight = Math.floor((now + DHAKA_OFFSET_MS) / DAY_MS) * DAY_MS;
    return new Date(localMidnight - DHAKA_OFFSET_MS).toISOString();
  }
  const days = range === "7d" ? 7 : 30;
  return new Date(now - days * DAY_MS).toISOString();
}

export async function getHomeData(range: HomeRange) {
  const start = rangeStart(range);
  const [salesRows, todoRows, topRows, recent] = (await Promise.all([
    sql`
      select coalesce(sum(total), 0)::int as sales, count(*)::int as orders
      from orders
      where status <> 'cancelled' and (${start}::timestamptz is null or created_at >= ${start})
    `,
    sql`
      select
        (select count(*) from orders where status = 'open' and fulfillment_status = 'unfulfilled')::int as to_fulfill,
        (select count(*) from orders where status = 'open' and payment_status = 'pending')::int as unpaid,
        (select count(*) from orders where status = 'open' and fulfillment_status = 'fulfilled')::int as in_transit,
        (select count(*) from product_variants v join products p on p.id = v.product_id
          where p.status = 'active' and p.track_inventory and not p.continue_selling and v.stock <= 3)::int as low_stock
    `,
    sql`
      select i.product_name, sum(i.quantity)::int as quantity, sum(i.quantity * i.unit_price)::int as revenue
      from order_items i join orders o on o.id = i.order_id
      where o.status <> 'cancelled' and (${start}::timestamptz is null or o.created_at >= ${start})
      group by i.product_name
      order by quantity desc
      limit 5
    `,
    getOrders({ tab: "all" }),
  ])) as unknown as [
    { sales: number; orders: number }[],
    { to_fulfill: number; unpaid: number; in_transit: number; low_stock: number }[],
    { product_name: string; quantity: number; revenue: number }[],
    OrderSummary[],
  ];

  const sales = salesRows[0];
  return {
    sales: sales.sales,
    orders: sales.orders,
    averageOrderValue: sales.orders ? Math.round(sales.sales / sales.orders) : 0,
    todo: {
      toFulfill: todoRows[0].to_fulfill,
      unpaid: todoRows[0].unpaid,
      inTransit: todoRows[0].in_transit,
      lowStock: todoRows[0].low_stock,
    },
    topProducts: topRows.map((r) => ({ name: r.product_name, quantity: r.quantity, revenue: r.revenue })),
    recentOrders: recent.slice(0, 5),
  };
}
