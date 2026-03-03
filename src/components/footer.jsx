import { Link } from "react-router-dom";
import { Github, Twitter, Mail, Phone } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const menuLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/analytics", label: "Analytics" },
    { path: "/link-tree", label: "LinkTree" },
    { path: "/qr-code-generator", label: "QR Generator" },
    { path: "/teams", label: "Teams" },
  ];

  const companyLinks = [
    { path: "/contact", label: "About Us" },
    { path: "/contact", label: "Help Center" },
    { path: "/contact", label: "Community" },
    { path: "/contact", label: "Partner Program" },
  ];

  const serviceLinks = [
    { path: "/dashboard", label: "Link Shortener" },
    { path: "/link-tree", label: "Microsite Builder" },
    { path: "/api-docs", label: "API Docs" },
    { path: "/contact", label: "Subscription" },
  ];

  return (
    <footer className="bg-[hsl(230,15%,5%)] border-t border-[hsl(230,10%,13%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/images/logo.png" alt="TrimLink" className="w-9 h-9 rounded-xl object-contain" />
              <span className="text-lg font-bold text-white tracking-tight">TrimLink</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The modern URL shortener with analytics, QR codes, and link management.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Menu
            </h4>
            <ul className="space-y-2.5">
              {menuLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Call Us</p>
              <p className="text-sm text-slate-500">+62 123 4567 890</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3">Email Us</p>
              <p className="text-sm text-slate-500">hello@trimlynk.com</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Subscribe to Newsletter
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.5)] flex-shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[hsl(230,10%,13%)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">
              &copy; {currentYear} TrimLink. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <div className="flex items-center gap-3 ml-2">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                  className="text-slate-600 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="text-slate-600 hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;