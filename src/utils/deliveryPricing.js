export const STORE_LOCATION = {
  address: "Rue 177, 20202 Casablanca",
  latitude: 33.55244,
  longitude: -7.67712,
};

const PRICING = {
  baseFee: 10,
  pricePerKm: 4,
  minDeliveryFee: 15,
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

export function getDeliveryQuote({ fulfillmentMethod, latitude, longitude, productFreeDelivery = false }) {
  if (fulfillmentMethod === "pickup") {
    return { fee: 0, distanceKm: 0, estimated: false, freeDelivery: true, freeDeliveryReason: "pickup" };
  }

  if (productFreeDelivery) {
    return { fee: 0, distanceKm: null, estimated: false, freeDelivery: true, freeDeliveryReason: "product" };
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
