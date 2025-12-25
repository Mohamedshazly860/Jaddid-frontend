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

const CourierMap = ({ tracking, customerLat, customerLng, isArabic }) => {
  // 1. Get courier coordinates safely
  const courierLat = tracking?.latest_location?.latitude;
  const courierLng = tracking?.latest_location?.longitude;

  // 2. CRITICAL: If any coordinate is missing, return a loader instead of a broken map
  if (!courierLat || !courierLng || !customerLat || !customerLng) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <Loader2 className="animate-spin text-[#708A58]" />
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border relative">
      <MapContainer
        center={[courierLat, courierLng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {courier && (
          <Marker position={[courier.lat, courier.lng]} icon={courierIcon}>
            <Popup>{tracking?.courier_name || "Courier"}</Popup>
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
