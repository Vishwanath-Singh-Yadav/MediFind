import React, { useEffect, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { Button, Input, Card } from "./ui";

export function LocationPicker({ onSelect, initialLocation = null }) {
  const mapRef = useRef(null);
  const [address, setAddress] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(initialLocation || { lat: 12.9716, lng: 77.5946 }); 

  useEffect(() => {
    if (showMap && typeof google !== "undefined") {
      const map = new google.maps.Map(mapRef.current, {
        center: location,
        zoom: 15,
      });

      const marker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
      });

      marker.addListener("dragend", (event) => {
        setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      const autocomplete = new google.maps.places.Autocomplete(
        document.querySelector('input[placeholder="Enter pharmacy address..."]')
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const newLoc = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setLocation(newLoc);
          map.setCenter(newLoc);
          marker.setPosition(newLoc);
          setAddress(place.formatted_address);
        }
      });
    }
  }, [showMap, location]);

  // Simple Mock Map for when Google Maps API key is missing/invalid
  const MockMap = () => (
    <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
      <MapPin className="w-12 h-12 mb-2 text-slate-400" />
      <p className="font-medium">Map Visualization</p>
      <p className="text-xs">Google Maps API Key required for live interactive map.</p>
      <p className="text-xs mt-1">You can still enter your address manually.</p>
    </div>
  );

  const handleSelect = () => {
    if (location.lat && location.lng) {
      onSelect({
        ...location,
        address: address || "Selected Location",
      });
      setShowMap(false);
    }
  };

  return (
    <div className="space-y-2">
      {!showMap ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter pharmacy address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Button onClick={() => setShowMap(true)} className="whitespace-nowrap">
            <MapPin className="w-4 h-4 mr-2" /> Pick Location
          </Button>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="h-80 relative bg-slate-100">
            {typeof google !== "undefined" ? (
              <div ref={mapRef} className="w-full h-full" />
            ) : (
              <MockMap />
            )}
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-white border-t flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowMap(false)}>Cancel</Button>
            <Button onClick={handleSelect}>Confirm Location</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
