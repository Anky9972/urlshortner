import { useState } from "react";
import { motion } from "framer-motion";
import { Link2Icon, MousePointerClick, Smartphone, Monitor, BadgeCheck } from "lucide-react";
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

// Auto-favicon helper – tries Google favicon service, falls back to Link2 icon
const FaviconImg = ({ url }) => {
  try {
    const domain = new URL(url).hostname;
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        width={18}
        height={18}
        className="rounded-sm shrink-0"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  } catch {
    return <Link2Icon size={18} />;
  }
};
const Preview = ({ profile, links, setProfile, setLinks, treeId }) => {
  const { user } = UrlState();
  const theme = defaultThemes[profile.theme];
  const [phoneFrame, setPhoneFrame] = useState(false);
  if (!profile || !links) {
    return (
      <div className="text-center p-4">
        <p>Loading preview...</p>
      </div>
    );
  }

  const handleClickCount = async (url, linkId) => {
    await trackAndUpdateTreeLinkClick(url, treeId, linkId);
  };

  // Font mapping
  const FONT_MAP = {
    sans:    'system-ui, -apple-system, sans-serif',
    serif:   'Georgia, "Times New Roman", serif',
    mono:    '"Courier New", Courier, monospace',
    inter:   '"Inter", system-ui, sans-serif',
    poppins: '"Poppins", system-ui, sans-serif',
    roboto:  '"Roboto", system-ui, sans-serif',
  };
  const fontFamily = FONT_MAP[profile.fontFamily || 'sans'] || FONT_MAP.sans;

  // Button style override
  const BUTTON_SHAPE_CLASS = {
    rounded: 'rounded-xl',
    pill:    'rounded-full',
    outline: 'rounded-xl bg-transparent border-2',
    shadow:  'rounded-xl shadow-xl shadow-black/40',
    hard:    'rounded-none',
  };
  const buttonShapeClass = BUTTON_SHAPE_CLASS[profile.buttonStyle || 'rounded'] || 'rounded-xl';

  // Scheduling + isActive filter (client-side preview)
  const now = new Date();
  const visibleLinks = links.filter(link => {
    if (link.isActive === false) return false;
    if (link.type === 'header' || link.type === 'divider') return true;
    if (link.activatesAt && new Date(link.activatesAt) > now) return false;
    if (link.deactivatesAt && new Date(link.deactivatesAt) < now) return false;
    return true;
  });

  const containerStyle = {
    fontFamily,
    ...(profile.backgroundImage ? {
      backgroundImage: `url(${profile.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {}),
  };

  // Load Google Font if needed
  const googleFonts = { inter: 'Inter', poppins: 'Poppins', roboto: 'Roboto' };
  if (googleFonts[profile.fontFamily]) {
    const fontName = googleFonts[profile.fontFamily];
    if (!document.querySelector(`link[data-font="${fontName}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      link.dataset.font = fontName;
      document.head.appendChild(link);
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Phone frame toggle — only visible in builder mode */}
      {setProfile && (
        <button
          onClick={() => setPhoneFrame(p => !p)}
          title={phoneFrame ? 'Full preview' : 'Phone frame preview'}
          className="fixed bottom-6 right-6 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[hsl(230,10%,20%)] bg-[hsl(230,12%,9%)] text-slate-400 hover:text-white hover:bg-[hsl(230,10%,14%)] text-xs font-medium shadow-lg transition-colors"
        >
          {phoneFrame ? <Monitor size={14} /> : <Smartphone size={14} />}
          {phoneFrame ? 'Full' : 'Phone'}
        </button>
      )}

      {phoneFrame ? (
        /* Phone mockup wrapper */
        <div className="flex items-center justify-center min-h-screen bg-[hsl(230,15%,5%)] py-12">
          <div className="relative w-[375px] h-[780px] rounded-[3rem] border-4 border-[hsl(230,10%,22%)] shadow-2xl overflow-hidden bg-black">
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10 border-2 border-[hsl(230,10%,18%)]" />
            <div className="w-full h-full overflow-y-auto">
              <div className={`min-h-full w-full ${theme.background}`} style={containerStyle}>
                <LinkContent
                  profile={profile}
                  theme={theme}
                  buttonShapeClass={buttonShapeClass}
                  visibleLinks={visibleLinks}
                  user={user}
                  handleClickCount={handleClickCount}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`min-h-screen w-full rounded-lg ${theme.background}`} style={containerStyle}>
          <LinkContent
            profile={profile}
            theme={theme}
            buttonShapeClass={buttonShapeClass}
            visibleLinks={visibleLinks}
            user={user}
            handleClickCount={handleClickCount}
          />
        </div>
      )}
    </div>
  );
};

// Extracted inner content to avoid duplication between phone/full modes
const LinkContent = ({ profile, theme, buttonShapeClass, visibleLinks, user, handleClickCount }) => (
  <div className="max-w-md mx-auto px-4 py-16">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center mb-8"
    >
      <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)]">
        <img
          src={profile.avatarUrl || user?.avatarUrl || ""}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className={`text-xl font-bold ${theme.textColor} mb-2 flex items-center justify-center gap-1.5`}>
        {profile.name}
        {profile.isVerified && (
          <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0" title="Verified" />
        )}
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
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
      }}
      className="space-y-4"
    >
      {visibleLinks.map((link) => {
        const Icon = socialIcons[link.icon];
        const useFavicon = !link.icon || link.icon === 'default' || !Icon;

        if (link.type === 'header') {
          return (
            <motion.div key={link.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className={`text-center pt-4 pb-1 text-sm font-semibold tracking-widest uppercase ${theme.textColor} opacity-70`}>
              {link.title}
            </motion.div>
          );
        }

        if (link.type === 'divider') {
          return (
            <motion.div key={link.id}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/20" />
              <div className="flex-1 h-px bg-white/20" />
            </motion.div>
          );
        }

        return (
          <motion.a
            key={link.id}
            href={link.url}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${theme.buttonStyle} ${buttonShapeClass} ${theme.textColor} ${theme.hoverEffect}
                flex items-center justify-between py-3 px-4 font-medium w-full
                transition-all duration-200 backdrop-blur-sm overflow-hidden`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClickCount(link.url, link.id)}
          >
            <span className="flex items-center gap-2 min-w-0 flex-1">
              {/* Thumbnail image takes priority over icon */}
              {link.thumbnail ? (
                <img src={link.thumbnail} alt="" width={20} height={20} className="rounded shrink-0 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : useFavicon ? (
                <span className="shrink-0"><FaviconImg url={link.url} /></span>
              ) : (
                <span className="shrink-0"><Icon size={18} /></span>
              )}
              <span className="truncate">{link.title}</span>
            </span>
            <span className="border rounded-full px-2 py-1 text-xs font-bold flex gap-1 shrink-0 ml-2">
              <MousePointerClick size={16} />
              {link.clicks || 0}
            </span>
          </motion.a>
        );
      })}
    </motion.div>
  </div>
);
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
