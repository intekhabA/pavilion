export function formatPrice(amount?: number, currency = "INR"): string {
  if (amount === undefined || amount === null) return "Price on Request";

  if (currency === "INR") {
    if (amount >= 10000000) {
      const cr = amount / 10000000;
      return `₹ ${cr % 1 === 0 ? cr : cr.toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      const lac = amount / 100000;
      return `₹ ${lac % 1 === 0 ? lac : lac.toFixed(2)} Lac`;
    }
    return `₹ ${amount.toLocaleString("en-IN")}`;
  } else if (currency === "AED") {
    if (amount >= 1000000) {
      const m = amount / 1000000;
      return `AED ${m % 1 === 0 ? m : m.toFixed(2)} M`;
    }
    return `AED ${amount.toLocaleString()}`;
  }

  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
