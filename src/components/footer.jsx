import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white py-20 border-t">
      <div className="container mx-auto text-center space-y-5">
        <div className="mb-4 flex w-full justify-center items-center gap-2">
        <img src="https://res.cloudinary.com/dj0eulqd8/image/upload/v1719838363/17198382942675tr4l2er_w26wki.jpg" alt="error" className='w-10' />
          <a href="/" className="text-xl font-bold">
          TrimLink</a>
        </div>
        <div className="mb-4 space-x-10">
          <a href="/" className="text-gray-400 hover:text-white mx-2">Home</a>
          <a href="/dashboard" className="text-gray-400 hover:text-white mx-2">Dashboard</a>
          <a href="/qr-code-generator" className="text-gray-400 hover:text-white mx-2">QR Code Generator</a>
          <a href="/about" className="text-gray-400 hover:text-white mx-2">About</a>
          <a href="/contact" className="text-gray-400 hover:text-white mx-2">Contact</a>
          <a href="/privacy" className="text-gray-400 hover:text-white mx-2">Privacy Policy</a>
          <a href="/terms" className="text-gray-400 hover:text-white mx-2">Terms of Service</a>
        </div>
        <div className="text-gray-400">
          © 2024 TrimLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
