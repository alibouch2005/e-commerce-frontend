import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useLanguage } from "../../context/LanguageContext";

const fallback = [33.5731, -7.5898];

export default function DeliveryMap({ latitude, longitude, address }) {
  const { t } = useLanguage();
  const hasDestination = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  const position = hasDestination ? [Number(latitude), Number(longitude)] : fallback;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 h-48">
      <MapContainer center={position} zoom={hasDestination ? 15 : 11} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {hasDestination && <CircleMarker center={position} radius={10} pathOptions={{ color: "#4f46e5" }}><Popup>{address}</Popup></CircleMarker>}
      </MapContainer>
      {!hasDestination && <p className="-mt-9 relative z-[500] bg-white/90 p-2 text-center text-xs">{t("gpsMissing")}</p>}
    </div>
  );
}
