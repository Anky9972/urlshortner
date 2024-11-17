import React from "react";
import {Input} from "@/components/ui/input"; // Replace with your input component

const QRCodeSettings = ({ size, setSize, fgColor, setFgColor, bgColor, setBgColor }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm mb-2">Size:</label>
        <Input
          type="number"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm mb-2">Foreground Color:</label>
        <Input
          type="color"
          value={fgColor}
          onChange={(e) => setFgColor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm mb-2">Background Color:</label>
        <Input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default QRCodeSettings;
