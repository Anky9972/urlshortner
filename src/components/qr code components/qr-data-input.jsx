import React from "react";
import {Input} from "@/components/ui/input";

const QRCodeDataInput = ({ qrType, data, setData, handleLogoUpload }) => {
  const handleDataChange = (e) => {
    setData(e.target.value);
  };

  return (
    <div className="mb-4 mt-4">
      <label className="block text-sm mb-2">Enter Data:</label>
      <Input
        type="text"
        placeholder="Enter Data"
        value={data}
        onChange={handleDataChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
      />
      {qrType === "wifi" && (
        <div className="mt-2">
          <p className="text-sm">Format: SSID,Encryption,Password</p>
        </div>
      )}
      {qrType === "event" && (
        <div className="mt-2">
          <p className="text-sm">
            Format: Summary,Location,StartDate(YYYYMMDDTHHMMSSZ),EndDate(YYYYMMDDTHHMMSSZ)
          </p>
        </div>
      )}
      {qrType === "mp3" && (
        <div className="mt-2">
          <p className="text-sm">Example: https://example.com/path/to/audio.mp3</p>
        </div>
      )}
      {qrType === "pdf" && (
        <div className="mt-2">
          <p className="text-sm">Example: https://example.com/path/to/document.pdf</p>
        </div>
      )}
      <input
        type="file"
        onChange={handleLogoUpload}
        className="w-full px-3 py-1 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};

export default QRCodeDataInput;
