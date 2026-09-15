export const STORE_LOCATION = {
  address: "Rue 177, 20202 Casablanca",
  latitude: 33.55244,
  longitude: -7.67712,
};

const PRICING = {
  baseFee: 5,
  pricePerKm: 4,
  minDeliveryFee: 5,
  fallbackDeliveryFee: 30,
};

function distanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const latDelta = toRad(lat2 - lat1);
  const lonDelta = toRad(lon2 - lon1);
  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const roundMoney = (amount) => Math.round(amount * 2) / 2;

export function getDeliveryQuote({ fulfillmentMethod, latitude, longitude, productFreeDelivery = false, productDeliveryPrice = null }) {
  if (fulfillmentMethod === "pickup") {
    return { fee: 0, distanceKm: 0, estimated: false, freeDelivery: true, freeDeliveryReason: "pickup" };
  }

  if (productFreeDelivery) {
    return { fee: 0, distanceKm: null, estimated: false, freeDelivery: true, freeDeliveryReason: "product" };
  }

  if (productDeliveryPrice !== null && productDeliveryPrice !== undefined && productDeliveryPrice !== "") {
    return { fee: roundMoney(Math.max(0, Number(productDeliveryPrice))), distanceKm: null, estimated: false, freeDelivery: Number(productDeliveryPrice) <= 0, freeDeliveryReason: Number(productDeliveryPrice) <= 0 ? "product" : null, pricingSource: "product" };
  }

  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return { fee: PRICING.fallbackDeliveryFee, distanceKm: null, estimated: true, freeDelivery: false };
  }

  const distance = distanceKm(STORE_LOCATION.latitude, STORE_LOCATION.longitude, Number(latitude), Number(longitude));
  const fee = Math.max(PRICING.minDeliveryFee, PRICING.baseFee + distance * PRICING.pricePerKm);

  return {
    fee: roundMoney(fee),
    distanceKm: Number(distance.toFixed(2)),
    estimated: false,
    freeDelivery: false,
  };
}
