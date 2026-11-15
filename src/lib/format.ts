export const formatMoney = (n = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );

export const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString() : "—";
