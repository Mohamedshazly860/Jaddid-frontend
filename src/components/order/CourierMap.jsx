import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

const courierIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const CourierMap = ({ tracking, customerLat, customerLng }) => {
  const courier = tracking?.latest_location;
  const center = courier
    ? [courier.latitude || courier.lat, courier.longitude || courier.lng]
    : [customerLat || 30.0444, customerLng || 31.2357];

  const positions = [];
  if (courier)
    positions.push([
      courier.latitude || courier.lat,
      courier.longitude || courier.lng,
    ]);
  if (customerLat && customerLng) positions.push([customerLat, customerLng]);

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border-0 shadow-sm">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {courier && (
          <Marker
            position={[
              courier.latitude || courier.lat,
              courier.longitude || courier.lng,
            ]}
            icon={courierIcon}
          >
            <Popup>
              {tracking?.courier_name || "Courier"}
              <br />
              ETA: {courier.estimated_time ?? "-"} mins
            </Popup>
          </Marker>
        )}

        {customerLat && customerLng && (
          <Marker position={[customerLat, customerLng]} icon={customerIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {positions.length >= 2 && (
          <Polyline positions={positions} color="#2D4F2B" />
        )}
      </MapContainer>
    </div>
  );
};

export default CourierMap;
