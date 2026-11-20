-- Online checkout with Stripe: card is a payment method, and each checkout
-- order remembers its Stripe Checkout Session so webhooks can find it.

alter table orders drop constraint if exists orders_payment_method_check;
alter table orders add constraint orders_payment_method_check
  check (payment_method in ('cod', 'bkash', 'nagad', 'bank_transfer', 'cash', 'card', 'other'));

alter table orders add column if not exists stripe_session_id text;
create unique index if not exists orders_stripe_session_idx on orders (stripe_session_id);
