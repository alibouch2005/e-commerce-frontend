const fractionDigits = (value) => Number.isInteger(Number(value || 0)) ? 0 : 2;

export const formatAmount = (value, locale = "fr-MA") => new Intl.NumberFormat(locale, {
  minimumFractionDigits: fractionDigits(value),
  maximumFractionDigits: fractionDigits(value),
}).format(Number(value || 0));

export const formatMoney = (value, locale = "fr-MA") => new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "MAD",
  minimumFractionDigits: fractionDigits(value),
  maximumFractionDigits: fractionDigits(value),
}).format(Number(value || 0));
