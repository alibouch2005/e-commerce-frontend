import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function DeliveryMap({ clientLocation, livreurLocation }) {

  return (
    <MapContainer
      center={clientLocation}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 📍 CLIENT */}
      <Marker position={clientLocation}>
        <Popup>Client 📦</Popup>
      </Marker>

      {/* 🚚 LIVREUR */}
      <Marker position={livreurLocation}>
        <Popup>Livreur 🚚</Popup>
      </Marker>

    </MapContainer>
  );
}