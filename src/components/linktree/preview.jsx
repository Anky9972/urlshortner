import { motion } from "framer-motion";
import { Link2Icon, MousePointerClick } from "lucide-react";
import PropTypes from "prop-types";
import {
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { defaultThemes } from "@/utils/theme";
import { UrlState } from "@/context";
import { trackAndUpdateTreeLinkClick } from "../analytics";

const socialIcons = {
  instagram: FaInstagram,
  twitter: FaTwitter,
  github: FaGithub,
  youtube: FaYoutube,
  website: FaGlobe,
  default: Link2Icon,
};
const Preview = ({ profile, links, setProfile, setLinks, treeId }) => {
  const { user } = UrlState();
  const theme = defaultThemes[profile.theme];
  if (!profile || !links) {
    return (
      <div className="text-center p-4">
        <p>Loading preview...</p>
      </div>
    );
  }
  // const handleClick = () => {
  //   setProfile({
  //     name: "Your Name",
  //     bio: "Your Bio ✨",
  //     theme: "default",
  //     customColors: {
  //       background: "#1a1a1a",
  //       text: "#ffffff",
  //       button: "#ffffff20",
  //     },
  //   });
  //   setLinks([
  //     {
  //       id: "1",
  //       title: "Portfolio Website",
  //       url: "https://example.com",
  //       icon: "website",
  //       isActive: true,
  //     },
  //   ]);
  // };

  const handleClickCount = async (url, linkId) => {
    await trackAndUpdateTreeLinkClick(url, treeId, linkId);
  }
  //  console.log("treeId", treeId);

  return (
    <div className={`min-h-screen w-full rounded-lg ${theme.background}`}>
      {/* <button className="absolute right-5 top-5 " onClick={handleClick}>Add To Gallery</button> */}
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)]">
            <img
              src={user?.avatarUrl || ""}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className={`text-xl font-bold ${theme.textColor} mb-2`}>
            {profile.name}
          </h1>
          <p className="text-slate-400">{profile.bio}</p>

          {/* Social Icons Bar */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              {[
                { key: 'instagram', Icon: FaInstagram, color: 'hover:text-pink-400' },
                { key: 'twitter',   Icon: FaTwitter,   color: 'hover:text-sky-400' },
                { key: 'github',    Icon: FaGithub,    color: 'hover:text-slate-100' },
                { key: 'youtube',   Icon: FaYoutube,   color: 'hover:text-red-400' },
                { key: 'website',   Icon: FaGlobe,     color: 'hover:text-emerald-400' },
              ].filter(({ key }) => profile.socialLinks[key]).map(({ key, Icon, color }) => (
                <a
                  key={key}
                  href={profile.socialLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-slate-300 ${color} transition-colors`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
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
                onClick={() => handleClickCount(link.url, link.id)}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {link.title}
                </span>
                <span className="border rounded-full px-2 py-1 text-xs font-bold flex gap-1">
                  <MousePointerClick size={16} />
                  {link.clicks || 0} clicks
                </span>
                {/* <Share2
                  size={18}
                  className="opacity-0 group-hover:opacity-100"
                /> */}
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
  setProfile: PropTypes.func,
  setLinks: PropTypes.func,
  handleClickCount: PropTypes.func,
  treeId: PropTypes.string,
};
export default Preview;
