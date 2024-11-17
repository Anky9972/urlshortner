// import React from 'react';

// const Footer = () => {
//   return (
//     <footer className="bg-gray-950 text-white py-20 border-t">
//       <div className="container mx-auto text-center space-y-5">
//         <div className="mb-4 flex w-full justify-center items-center gap-2">
//         <img src="https://res.cloudinary.com/dj0eulqd8/image/upload/v1719838363/17198382942675tr4l2er_w26wki.jpg" alt="error" className='w-10' />
//           <a href="/" className="text-xl font-bold">
//           TrimLink</a>
//         </div>
//         <div className="mb-4 space-x-10">
//           <a href="/" className="text-gray-400 hover:text-white mx-2">Home</a>
//           <a href="/dashboard" className="text-gray-400 hover:text-white mx-2">Dashboard</a>
//           <a href="/link-tree" className="text-gray-400 hover:text-white mx-2">LinkTree Builder</a>
//           <a href="/qr-code-generator" className="text-gray-400 hover:text-white mx-2">QR Code Generator</a>
//           <a href="/about" className="text-gray-400 hover:text-white mx-2">About</a>
//           <a href="/contact" className="text-gray-400 hover:text-white mx-2">Contact</a>
//           <a href="/privacy" className="text-gray-400 hover:text-white mx-2">Privacy Policy</a>
//           <a href="/terms" className="text-gray-400 hover:text-white mx-2">Terms of Service</a>
//         </div>
//         <div className="text-gray-400">
//           © 2024 TrimLink. All rights reserved.
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Logo and Brand Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="https://res.cloudinary.com/dj0eulqd8/image/upload/v1719838363/17198382942675tr4l2er_w26wki.jpg"
              alt="TrimLink Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <a 
              href="/" 
              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              TrimLink
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
            <li>
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/link-tree" className="text-gray-400 hover:text-white transition-colors">
                LinkTree Builder
              </a>
            </li>
            <li>
              <a href="/qr-code-generator" className="text-gray-400 hover:text-white transition-colors">
                QR Code Generator
              </a>
            </li>
          </ul>
        </nav>

        {/* Secondary Navigation */}
        <nav className="mb-8">
          <ul className="flex flex-wrap justify-center gap-6 text-sm">
            <li>
              <a href="/about" className="text-gray-500 hover:text-gray-300 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="text-gray-500 hover:text-gray-300 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} TrimLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;