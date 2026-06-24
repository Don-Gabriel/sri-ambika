// All money lives as integer paise in the DB. Convert only at the edges.

export const paiseToRupees = (p: number) => p / 100;
export const rupeesToPaise = (r: number) => Math.round(r * 100);

export function formatINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPaise(paise: number) {
  return formatINR(paiseToRupees(paise));
}

/** GST on restaurant service in India = 5% (without ITC). */
export const GST_RATE = 0.05;
