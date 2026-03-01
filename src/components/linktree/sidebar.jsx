import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
  ChevronDown,
  ChevronUp,
  Link2Icon,
  PlusCircle,
  Trash2,
} from "lucide-react";
import {
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { defaultThemes } from "../../utils/theme";
import SaveStatus from "./save-status";
import { IoClose } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
const socialIcons = {
  instagram: FaInstagram,
  twitter: FaTwitter,
  github: FaGithub,
  youtube: FaYoutube,
  website: FaGlobe,
  default: Link2Icon,
};
const Sidebar = ({
  profile,
  setProfile,
  links,
  setLinks,
  activeTab,
  setActiveTab,
  saveLinkTree,
  saveError,
  saveSuccess,
  isSaving,
  linkTreeId,
  setLinkTreeId,
  sidebarOpen,
  setSidebarOpen,
  title,
  setTitle
}) => {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const addLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: "New Link",
      url: "https://",
      icon: "default",
    };
    setLinks([...links, newLink]);
  };
  const location = useLocation();
  const [createMode, setCreateMode] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);  // Use location.search to get the query string
    const createParam = queryParams.get("create");  // Extract the 'create' parameter

    if (createParam !== null) {
      setCreateMode(true);
    } else {
      setCreateMode(false);
    }
  }, [location.search]);
  // console.log("create param:", createMode);

  return (
    <motion.div

      className={`lg:w-80 fixed lg:relative left-0 right-0 ${sidebarOpen ? "visible" : "hidden"} z-10 bg-[hsl(230,12%,9%)] top h-screen shadow-xl lg:relative lg:rounded-xl border border-[hsl(230,10%,15%)]`}
    >
      <span className="p-1.5 lg:hidden border border-[hsl(230,10%,20%)] absolute right-2 top-2 rounded-lg hover:bg-[hsl(230,10%,14%)] cursor-pointer text-slate-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <IoClose />
      </span>
      <div className="p-5 h-full mt-5 lg:mt-0">
        {/* Tabs */}
        <div className="flex justify-center w-full gap-2 mb-6">
          {["links", "appearance", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab
                ? "bg-[hsl(230,10%,14%)] text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-[hsl(230,10%,14%)]/50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 h-full"
          >
            {activeTab === "links" && (
              <div className="space-y-4">
                {links.map((link, index) => (
                  <motion.div
                    key={link.id}
                    layout
                    className="bg-[hsl(230,10%,14%)]/50 border border-[hsl(230,10%,20%)]/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-[hsl(230,10%,20%)] border border-[hsl(230,10%,25%)] rounded-lg text-slate-400 hover:text-white transition-colors">
                          <ChevronUp size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-[hsl(230,10%,20%)] border border-[hsl(230,10%,25%)] rounded-lg text-slate-400 hover:text-white transition-colors">
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setLinks(links.filter((l) => l.id !== link.id))
                        }
                        className="p-1.5 text-red-400 hover:bg-red-500/10 border border-[hsl(230,10%,25%)] rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index].title = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                        placeholder="Link Title"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index].url = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                        placeholder="URL"
                      />

                      <select
                        value={link.icon}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index].icon = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                      >
                        {Object.keys(socialIcons).map((icon) => (
                          <option key={icon} value={icon}>
                            {icon.charAt(0).toUpperCase() + icon.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={addLink}
                  className="w-full py-3 border-2 border-dashed border-[hsl(230,10%,20%)] rounded-xl text-slate-400 hover:border-blue-600/50 hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusCircle size={18} />
                  <span>Add New Link</span>
                </button>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(defaultThemes).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setProfile({ ...profile, theme })}
                        className={`p-3 rounded-lg border transition-colors ${profile.theme === theme
                            ? "border-blue-600/50 bg-blue-600/10 text-blue-400"
                            : "border-[hsl(230,10%,20%)] hover:border-[hsl(230,10%,25%)] text-slate-400"
                          }`}
                      >
                        <div className="text-sm font-medium capitalize">
                          {theme}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Custom Colors
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500">
                        Background
                      </label>
                      <input
                        type="color"
                        value={profile.customColors.background}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            customColors: {
                              ...profile.customColors,
                              background: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded-lg bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">
                        Button Style
                      </label>
                      <input
                        type="color"
                        value={profile.customColors.button}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            customColors: {
                              ...profile.customColors,
                              button: e.target.value,
                            },
                          })
                        }
                        className="w-full h-10 rounded-lg bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    LinkTree Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="w-full px-3 py-2 text-white text-sm rounded-lg border border-[hsl(230,10%,20%)] bg-[hsl(230,10%,14%)] focus:border-blue-600/50 focus:outline-none transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <SaveStatus
        saveLinkTree={saveLinkTree}
        saveError={saveError}
        saveSuccess={saveSuccess}
        isSaving={isSaving}
        linkTreeId={linkTreeId}
        setLinkTreeId={setLinkTreeId}
        isCreate={createMode}
      />
    </motion.div>
  );
};
Sidebar.propTypes = {
  profile: PropTypes.object.isRequired,
  setProfile: PropTypes.func.isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  setLinks: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  saveLinkTree: PropTypes.func.isRequired,
  saveError: PropTypes.string,
  saveSuccess: PropTypes.bool,
  isSaving: PropTypes.bool.isRequired,
  linkTreeId: PropTypes.string,
  setLinkTreeId: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired
};

export default Sidebar;
