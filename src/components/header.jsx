import { Button } from "./ui/button";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Bell, LinkIcon, LogOut, Menu, Network, Settings, X } from "lucide-react";
import { UrlState } from "@/context";
import { BarLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fetchNotifications } from "./notification/notification-methods";
import MyUrls from "./my-urls";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = UrlState();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMyUrlsOpen, setIsMyUrlsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = user
    ? [
      { path: "/", label: "Home" },
      { path: "/link-tree?create", label: "LinkTree" },
      { path: "/qr-code-generator", label: "QR Generator" },
      { path: "/rooms", label: "Rooms" },
    ]
    : [
      { path: "/", label: "My URLs", onClick: () => setIsMyUrlsOpen(true) },
      { path: "/link-tree?create", label: "LinkTree" },
      { path: "/qr-code-generator", label: "QR Generator" },
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

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[hsl(230,15%,5%)]/90 backdrop-blur-xl border-b border-[hsl(230,10%,15%)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center group-hover:shadow-[0_0_20px_-4px_hsl(220,90%,56%,0.5)] transition-shadow">
                <LinkIcon className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:block tracking-tight">
                TrimLink
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.path}
                  onClick={link.onClick}
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
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              {user && (
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {notifications.filter((n) => n.status).length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[hsl(230,15%,5%)]">
                      {notifications.filter((n) => n.status).length}
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
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/auth")}
                      className="hidden sm:inline-flex text-slate-300 hover:text-white"
                    >
                      Log in
                    </Button>
                    <Button
                      onClick={() => navigate("/auth")}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 rounded-xl hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.5)]"
                    >
                      Get Started
                    </Button>
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
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="md:hidden border-t border-[hsl(230,10%,15%)] bg-[hsl(230,15%,5%)]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      link.onClick && link.onClick();
                    }}
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
                ))}
                {!user && (
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* MyUrls Modal */}
      {isMyUrlsOpen && <MyUrls setIsMyUrlsOpen={setIsMyUrlsOpen} />}

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

const UserMenu = ({ user, logout, navigate }) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="focus:outline-none">
      <Avatar className="w-9 h-9 ring-2 ring-[hsl(230,10%,20%)] hover:ring-blue-500/50 transition-all">
        <AvatarImage
          src={user?.avatarUrl}
          className="object-cover"
        />
        <AvatarFallback className="bg-[hsl(230,10%,14%)] text-white text-sm font-medium">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <DropdownMenuContent className="w-56 mt-2 bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] rounded-xl shadow-2xl shadow-black/50">
      <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wider px-3 py-2">
        My Account
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-[hsl(230,10%,15%)]" />

      <DropdownMenuItem className="text-white focus:bg-white/5 cursor-default rounded-lg mx-1">
        {user?.name || user?.email}
      </DropdownMenuItem>

      <DropdownMenuItem
        className="focus:bg-white/5 cursor-pointer rounded-lg mx-1"
        onClick={() => navigate('/dashboard')}
      >
        <LinkIcon className="mr-2 h-4 w-4 text-slate-400" />
        <span className="text-slate-300">My Links</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="focus:bg-white/5 cursor-pointer rounded-lg mx-1"
        onClick={() => navigate('/link-tree-gallery')}
      >
        <Network className="mr-2 h-4 w-4 text-slate-400" />
        <span className="text-slate-300">My LinkTree&apos;s</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="focus:bg-white/5 cursor-pointer rounded-lg mx-1"
        onClick={() => navigate('/settings')}
      >
        <Settings className="mr-2 h-4 w-4 text-slate-400" />
        <span className="text-slate-300">Settings</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="bg-[hsl(230,10%,15%)]" />

      <DropdownMenuItem
        className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer rounded-lg mx-1"
        onClick={async () => {
          await logout();
          navigate("/");
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

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
