import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LinkIcon, LogOut, Menu, Network, Settings, X, ChevronDown } from "lucide-react";
import { UrlState } from "@/context";
import { BarLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { fetchNotifications } from "./notification/notification-methods";
import MyUrls from "./my-urls";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = UrlState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMyUrlsOpen, setIsMyUrlsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = user
    ? [
        { path: "/", label: "Home" },
        { path: "/link-tree?create", label: "LinkTree" },
        { path: "/qr-code-generator", label: "QR Code" },
        { path: "/rooms", label: "Rooms" },
      ]
    : [
        { path: "#", label: "My URLs", onClick: () => setIsMyUrlsOpen(true) },
        { path: "/link-tree?create", label: "LinkTree" },
        { path: "/qr-code-generator", label: "QR Code" },
        { path: "/rooms", label: "Rooms" },
      ];

  useEffect(() => {
    fetchNotifications().then((data) => {
      if (data) setNotifications(data);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => n.status).length;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[hsl(230,15%,5%)]/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative">
                <img
                  src="/images/logo.png"
                  alt="TrimLink"
                  className="w-9 h-9 rounded-xl object-contain transition-all group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:block tracking-tight">
                Trim<span className="text-blue-400">Link</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
              {navLinks.map((link) =>
                link.onClick ? (
                  <button
                    key={link.label}
                    onClick={link.onClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                  >
                    {link.label}
                  </button>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-white bg-blue-600/20 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1.5">
              {/* Notification Bell */}
              {user && (
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[hsl(230,15%,5%)] animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Auth / User */}
              <AnimatePresence mode="wait">
                {!user ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => navigate("/auth")}
                      className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => navigate("/auth")}
                      className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.5)]"
                    >
                      Get Started
                    </button>
                  </motion.div>
                ) : (
                  <UserMenu user={user} logout={logout} navigate={navigate} />
                )}
              </AnimatePresence>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-white/[0.06] bg-[hsl(230,15%,5%)]/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) =>
                  link.onClick ? (
                    <button
                      key={link.label}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        link.onClick();
                      }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <NavLink
                      key={link.label}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "text-white bg-blue-600/15"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  )
                )}
                {!user && (
                  <button
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full mt-3 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* MyUrls Slide Panel */}
      <AnimatePresence>
        {isMyUrlsOpen && <MyUrls onClose={() => setIsMyUrlsOpen(false)} />}
      </AnimatePresence>

      {/* Loading Bar */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-50"
          >
            <BarLoader height={2} width="100%" color="#2563eb" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
};

/* ── Custom User Dropdown ── */
const UserMenu = ({ user, logout, navigate }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  const menuItems = [
    { label: "My Links", icon: LinkIcon, onClick: () => navigate("/dashboard") },
    { label: "My LinkTrees", icon: Network, onClick: () => navigate("/link-tree-gallery") },
    { label: "Settings", icon: Settings, onClick: () => navigate("/settings") },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-white/[0.06] transition-all focus:outline-none group"
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-[hsl(230,10%,20%)] group-hover:ring-blue-500/40 transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-[hsl(230,10%,20%)] group-hover:ring-blue-500/40 transition-all">
            {initials}
          </div>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 hidden sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-[hsl(230,10%,14%)]">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <item.icon className="w-4 h-4 text-slate-500" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="p-1.5 border-t border-[hsl(230,10%,14%)]">
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  navigate("/");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

UserMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  logout: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default Header;
