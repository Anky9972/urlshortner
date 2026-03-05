import { Link } from "react-router-dom";
import { Github, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
    { path: "/community", label: "Community" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/images/logo.png" alt="TrimLink" width="36" height="36" loading="lazy" className="w-9 h-9 rounded-xl object-contain" />
              <span className="text-lg font-bold text-white tracking-tight">TrimLink</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The modern URL shortener with analytics, QR codes, and link management.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Menu
            </h3>
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
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Company
            </h3>
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
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Services
            </h3>
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Us</p>
              <p className="text-sm text-slate-500">ankygaur9972@gmail.com</p>
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
                <a href="https://github.com/Anky9972" target="_blank" rel="noopener noreferrer"
                  aria-label="TrimLink on GitHub"
                  className="text-slate-600 hover:text-white transition-colors">
                  <Github className="w-4 h-4" aria-hidden="true" />
                </a>
                <a href="https://x.com/anky_vivek" target="_blank" rel="noopener noreferrer"
                  aria-label="TrimLink on Twitter/X"
                  className="text-slate-600 hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" aria-hidden="true" />
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