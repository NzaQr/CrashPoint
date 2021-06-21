import React from "react";
import { GiCompass } from "react-icons/gi";

const LocateCurrent = ({ panTo }) => {
  return (
    <button
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    >
      <GiCompass alt="compass - locate me" />
    </button>
  );
};

export default LocateCurrent;
