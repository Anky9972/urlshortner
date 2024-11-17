import React, { useState, useRef } from 'react';
import QRCode from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const QRCodeGenerator = () => {
  const [url, setUrl] = useState('');
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState('#333333');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logo, setLogo] = useState(null);
  const canvasRef = useRef(null); // Ref to store the QRCode canvas element

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const downloadQRCode = () => {
    if (canvasRef.current !== null) {
      const canvas = canvasRef.current.children[0]; // Access the QRCode canvas element
      const imageData = canvas.toDataURL('image/png'); // Convert canvas to PNG image data

      // Create a temporary anchor element for downloading
      const downloadLink = document.createElement('a');
      downloadLink.href = imageData;
      downloadLink.download = 'qrcode.png'; // Set the file name for download
      document.body.appendChild(downloadLink);
      downloadLink.click(); // Click to trigger the download
      document.body.removeChild(downloadLink); // Clean up
    }
  };

  // Function to customize the QR Code with logo
  const renderCustomQRCode = () => {
    if (logo) {
      return (
        <QRCode
          value={url}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
          imageSettings={{
            src: logo,
            height: size * 0.2, // Adjust logo size relative to QR code size
            width: size * 0.2,
            excavate: true,
          }}
        />
      );
    } else {
      return (
        <QRCode
          value={url}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
        />
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <h1 className="text-4xl font-bold text-center mb-6">Free Customizable QR Code Generator</h1>
      <div className="max-w-md w-full shadow-md rounded-md p-6 border">
        <div className="flex items-center justify-center mb-6" ref={canvasRef}>
          {renderCustomQRCode()}
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-2">Enter URL:</label>
          <Input
            type="text"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
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
          <div>
            <label className="block text-sm mb-2">Upload Logo:</label>
            <input
              type="file"
              onChange={handleLogoUpload}
              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-center w-full">
          <Button disabled={!url} onClick={downloadQRCode} className="text-center w-full">
            Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
//text email phone sms location facebook twitter youtube wifi event mp3 video pdf etc