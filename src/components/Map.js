import React, { useCallback, useEffect, useRef, useState } from "react";
import Search from "./Search";
import LocateCurrent from "./LocateCurrent";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { formatRelative } from "date-fns";

import mapStyles from "../mapStyles";
import crash from "../assets/crash.png";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: -34.603683,
  lng: -58.381557,
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const json = localStorage.getItem("marker");
    const loadedNotes = JSON.parse(json);
    if (loadedNotes) {
      setMarkers(loadedNotes);
    }
  }, []);

  useEffect(() => {
    const json = JSON.stringify(markers);
    localStorage.setItem("marker", json);
  }, [markers]);

  const onMapClick = useCallback((e) => {
    setMarkers((currentMarkers) => [
      ...currentMarkers,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date().getTime(),
      },
    ]);
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";

  const removeMarker = (id) => {
    const updatedNotes = [...markers].filter((marker) => marker.time !== id);
    setMarkers(updatedNotes);
    setSelected(null);
  };

  return (
    <div>
      <h1>CrashPoint</h1>

      <Search panTo={panTo} />
      <LocateCurrent panTo={panTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: crash,
              scaledSize: new window.google.maps.Size(30, 30),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>Car Crash</h2>
              <p>Occurred {formatRelative(selected.time, new Date())}</p>
              <button onClick={() => removeMarker(selected.time)}>
                Delete
              </button>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
};

export default Map;
