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

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img
                src="/images/logo.png"
                alt="TrimLink"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-semibold text-white hidden sm:block">
                TrimLink
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={link.onClick}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "text-white bg-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              {user && (
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter((n) => n.status).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications.filter((n) => n.status).length}
                    </span>
                  )}
                </button>
              )}

              {/* Auth Button / User Menu */}
              <AnimatePresence mode="wait">
                {!user ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button
                      onClick={() => navigate("/auth")}
                      className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium px-5 rounded-lg"
                    >
                      Login
                    </Button>
                  </motion.div>
                ) : (
                  <UserMenu
                    user={user}
                    logout={logout}
                    navigate={navigate}
                  />
                )}
              </AnimatePresence>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
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
              className="md:hidden border-t border-zinc-800/50"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      link.onClick && link.onClick();
                    }}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "text-white bg-zinc-800"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
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
                    className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium"
                  >
                    Login
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
            <BarLoader height={2} width="100%" color="#06b6d4" />
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
      <Avatar className="w-9 h-9 ring-2 ring-zinc-700 hover:ring-cyan-500/50 transition-all">
        <AvatarImage
          src={user?.avatarUrl}
          className="object-cover"
        />
        <AvatarFallback className="bg-zinc-800 text-white text-sm">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <DropdownMenuContent className="w-56 mt-2 bg-zinc-900 border border-zinc-800">
      <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wide">
        My Account
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-zinc-800" />

      <DropdownMenuItem className="text-white focus:bg-zinc-800 cursor-default">
        {user?.name || user?.email}
      </DropdownMenuItem>

      <DropdownMenuItem
        className="focus:bg-zinc-800 cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <LinkIcon className="mr-2 h-4 w-4 text-zinc-400" />
        <span className="text-zinc-300">My Links</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="focus:bg-zinc-800 cursor-pointer"
        onClick={() => navigate('/link-tree-gallery')}
      >
        <Network className="mr-2 h-4 w-4 text-zinc-400" />
        <span className="text-zinc-300">My LinkTree&apos;s</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="focus:bg-zinc-800 cursor-pointer"
        onClick={() => navigate('/settings')}
      >
        <Settings className="mr-2 h-4 w-4 text-zinc-400" />
        <span className="text-zinc-300">Settings</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="bg-zinc-800" />

      <DropdownMenuItem
        className="text-red-400 focus:bg-zinc-800 focus:text-red-300 cursor-pointer"
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
