import { motion } from "framer-motion";
import { Link2Icon, Share2 } from "lucide-react";
import PropTypes from "prop-types";
const socialIcons = {
  instagram: FaInstagram,
  twitter: FaTwitter,
  github: FaGithub,
  youtube: FaYoutube,
  website: FaGlobe,
  default: Link2Icon,
};
import {
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { defaultThemes } from "@/utils/theme";
import { UrlState } from "@/context";
const Preview = ({ profile, links }) => {
  const { user } = UrlState();
  const theme = defaultThemes[profile.theme];
  if (!profile || !links) {
    return (
      <div className="text-center p-4">
        <p>Loading preview...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full rounded-lg ${theme.background}`}>
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-100">
            <img
              src={user?.user_metadata?.profile_pic}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textColor} mb-2`}>
            {profile.name}
          </h1>
          <p className="text-gray-400">{profile.bio}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="space-y-4"
        >
          {links.map((link) => {
            const Icon = socialIcons[link.icon] || socialIcons.default;

            return (
              <motion.a
                key={link.id}
                href={link.url}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${theme.buttonStyle} ${theme.textColor} ${theme.hoverEffect} 
                    flex items-center justify-between py-3 px-6 rounded-xl font-medium 
                    transition-all duration-200 backdrop-blur-sm`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {link.title}
                </span>
                <Share2
                  size={18}
                  className="opacity-0 group-hover:opacity-100"
                />
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
Preview.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    bio: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ).isRequired,
};
export default Preview;
