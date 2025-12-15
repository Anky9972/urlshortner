import { Link } from "react-router-dom";
import { Github, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const mainLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/link-tree", label: "LinkTree" },
    { path: "/qr-code-generator", label: "QR Generator" },
  ];

  const legalLinks = [
    { path: "/contact", label: "Contact" },
    { path: "/privacy", label: "Privacy" },
    { path: "/terms", label: "Terms" },
  ];

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          {/* Logo & Description */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img
                src="/images/logo.png"
                alt="TrimLink"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-semibold text-white">TrimLink</span>
            </Link>
            <p className="text-sm text-zinc-500">
              The modern URL shortener with analytics, QR codes, and link management.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap gap-8">
            <div>
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                Product
              </h4>
              <ul className="space-y-2">
                {mainLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                Legal
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800/50 pt-8">
          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © {currentYear} TrimLink. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;