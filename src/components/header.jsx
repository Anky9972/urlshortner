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
import { LinkIcon, LogOut, Menu, Network, X } from "lucide-react";
import { UrlState } from "@/context";
import useFetch from "@/hooks/use-fetch";
import { logout } from "@/db/apiAuth";
import { BarLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PropTypes from "prop-types";

const Header = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = UrlState();
  const { loading, fn: fnLogout } = useFetch(logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/link-tree?create", label: "LinkTree" },
    { path: "/qr-code-generator", label: "QR Generator" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/" className="flex items-center space-x-2">
                <motion.img
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  src="https://res.cloudinary.com/dj0eulqd8/image/upload/v1719838363/17198382942675tr4l2er_w26wki.jpg"
                  alt="TrimLink"
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold text-white hidden sm:block">
                  TrimLink
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <ul className="flex items-center gap-4">
                {navLinks.map((link) => (
                  <motion.li key={link.path} whileHover={{ scale: 1.05 }}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent
                        ${
                          isActive
                            ? "bg-blue-600/20 text-blue-400 border-blue-500/50"
                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <AnimatePresence mode="wait">
                {!user ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={() => navigate("/auth")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full transition-colors"
                    >
                      Login
                    </Button>
                  </motion.div>
                ) : (
                  <UserMenu
                    user={user}
                    fnLogout={fnLogout}
                    fetchUser={fetchUser}
                    navigate={navigate}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              {user && (
                <UserMenu
                  user={user}
                  fnLogout={fnLogout}
                  fetchUser={fetchUser}
                  navigate={navigate}
                />
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
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
              className="md:hidden border-t border-gray-800"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Loading Bar */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-50"
          >
            <BarLoader
              height={4}
              width="100%"
              color="#3B82F6"
              className="backdrop-blur-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
};

// Separate component for the user menu to reduce complexity
const UserMenu = ({ user, fnLogout, fetchUser, navigate }) => (
  <motion.div
    key="user-menu"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex items-center"
  >
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Avatar className="w-10 h-10 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 transition-all duration-200 hover:ring-blue-400">
            <AvatarImage
              src={user?.user_metadata?.profile_pic}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600">
              {user?.user_metadata?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mt-2 bg-gray-900 border border-gray-800">
        <DropdownMenuLabel className="text-gray-400">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem className="text-white focus:bg-gray-800">
          {user?.user_metadata?.name}
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-gray-800">
          <Link
            to="/dashboard"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>My Links</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-gray-800">
          <Link
            to="/link-tree-gallery"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <Network className="mr-2 h-4 w-4" />
            <span>My LinkTree&apos;s</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-400 focus:bg-gray-800 focus:text-red-300"
          onClick={() => {
            fnLogout().then(() => {
              fetchUser();
              navigate("/");
            });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </motion.div>
);

UserMenu.propTypes = {
  user: PropTypes.shape({
    user_metadata: PropTypes.shape({
      profile_pic: PropTypes.string,
      name: PropTypes.string,
    }),
  }),
  fnLogout: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default Header;
