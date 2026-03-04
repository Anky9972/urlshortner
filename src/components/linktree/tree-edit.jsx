import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Save,
  Edit,
  Link,
  Palette,
  User,
  Network,
} from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { getLinkTree, updateLinkTree, bulkUpdateLinks } from "../../api/linktrees";
import { useParams, useNavigate } from "react-router-dom";

const TreeEdit = () => {
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const treeId = params.id;

  // Load tree data on component mount
  useEffect(() => {
    const loadTreeData = async () => {
      setIsLoading(true);
      try {
        const tree = await getLinkTree(treeId);
        // Map flat API fields into the component's nested profile structure
        setTreeData({
          id: tree.id,
          title: tree.title,
          slug: tree.slug,
          isPublic: tree.isPublic,
          viewCount: tree.viewCount,
          createdAt: tree.createdAt,
          profile: {
            name: tree.title,
            bio: tree.description || "",
            theme: tree.theme || "default",
            customColors: {
              background: tree.backgroundColor || "#1a1a2e",
              text: tree.textColor || "#ffffff",
            },
          },
          links: (tree.links || []).map((l) => ({
            id: l.id,
            title: l.title,
            url: l.url || '',
            icon: l.icon || "default",
            type: l.type || 'link',
            isActive: l.isActive !== false,
            thumbnail: l.thumbnail || null,
            clicks: l.clicks || 0,
            activatesAt: l.activatesAt || null,
            deactivatesAt: l.deactivatesAt || null,
          })),
        });
      } catch (error) {
        console.error("Fetch error:", error);
        navigate("/not-found");
      }
      setIsLoading(false);
    };
    loadTreeData();
  }, [treeId, navigate]);

  // Update profile fields
  const updateProfile = (field, value) => {
    setTreeData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };
  const updateTreeTitle = (value) => {
    setTreeData((prev) => ({
      ...prev,
      title: value,
    }));
  };
  // Update color fields
  const updateColors = (colorType, value) => {
    setTreeData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        customColors: {
          ...prev.profile.customColors,
          [colorType]: value,
        },
      },
    }));
  };

  // Add new link
  const addLink = () => {
    const newLink = {
      id: `temp-${Date.now()}`,
      title: "",
      url: "",
      icon: "default",
      type: "link",
      isActive: true,
      thumbnail: null,
      clicks: 0,
      activatesAt: null,
      deactivatesAt: null,
    };
    setTreeData((prev) => ({
      ...prev,
      links: [...prev.links, newLink],
    }));
  };

  // Update specific link
  const updateLink = (index, field, value) => {
    const newLinks = [...treeData.links];
    newLinks[index] = {
      ...newLinks[index],
      [field]: value,
    };
    setTreeData((prev) => ({
      ...prev,
      links: newLinks,
    }));
  };

  // Remove link
  const removeLink = (index) => {
    const newLinks = treeData.links.filter((_, i) => i !== index);
    setTreeData((prev) => ({
      ...prev,
      links: newLinks,
    }));
  };

  // Save data to server API
  const saveData = async () => {
    if (!treeData) return;
    setIsSaving(true);

    try {
      // Update tree metadata
      await updateLinkTree(treeId, {
        title: treeData.title || treeData.profile.name || "",
        description: treeData.profile.bio || "",
        theme: treeData.profile.theme || "default",
        backgroundColor: treeData.profile.customColors?.background,
        textColor: treeData.profile.customColors?.text,
      });

      // Bulk update links (preserve clicks, isActive, thumbnail, type and scheduling)
      await bulkUpdateLinks(
        treeId,
        treeData.links.map((link, index) => ({
          id: link.id?.startsWith("temp-") ? undefined : link.id,
          title: link.title,
          url: link.url || '',
          icon: link.icon,
          type: link.type || 'link',
          isActive: link.isActive !== false,
          thumbnail: link.thumbnail || null,
          clicks: link.clicks || 0,
          order: index,
          activatesAt: link.activatesAt || null,
          deactivatesAt: link.deactivatesAt || null,
        }))
      );

      toast.success("Tree updated successfully");
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(error.message || "Failed to save tree data");
    } finally {
      setIsSaving(false);
    }
  };
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(230,12%,9%)]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  const profile = treeData.profile;
  const links = treeData.links;

  // Render main component
  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
      <div className="w-full rounded-2xl overflow-hidden relative">
        {/* Header */}
        <div className="fixed top-16 right-0 left-0 bg-[hsl(230,12%,9%)] px-6 py-3 flex items-center justify-between border-b">
          <div className="flex items-center space-x-4">
            <Edit className="text-white w-8 h-8" />
            <h1 className="text-3xl font-bold text-white">Tree Edit</h1>
          </div>
          <Button
            onClick={saveData}
            className="flex gap-2 items-center justify-center"
          >
            <Save className="w-5" /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
        {/* Content Container */}
        <div className="space-y-3 lg:space-y-6 overflow-y-auto mt-16">
          {/* Profile Section */}
          <div className="bg-[hsl(230,10%,20%)] rounded-xl lg:p-6">
            <div className="grid lg:grid-cols-2 lg:gap-5 p-4">
              <div>
                <div className="flex items-center mb-6">
                  <User className="mr-3 text-blue-400" />
                  <h2 className="text-2xl font-semibold text-white">
                    Profile Details
                  </h2>
                </div>
                <div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                      placeholder="Name"
                      className="w-full p-3 bg-[hsl(230,10%,20%)] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={profile.bio}
                      onChange={(e) => updateProfile("bio", e.target.value)}
                      placeholder="Bio"
                      className="w-full p-3 bg-[hsl(230,10%,20%)] rounded-lg text-white placeholder-slate-400 h-32 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                {/* LinkTree Title */}
                <div className="mt-4 lg:mt-0">
                  <div className="flex items-center mb-4">
                    <Network className="mr-3 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">
                      LinkTree Title
                    </h3>
                  </div>
                  <input
                    type="text"
                    value={treeData.title || ""}
                    onChange={(e) => updateTreeTitle(e.target.value)}
                    placeholder="LinkTree Title"
                    className="w-full p-3 mt-3 bg-[hsl(230,10%,20%)] rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {/* Custom Colors */}
                <div className="flex items-center mt-5">
                  <Palette className="mr-3 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Custom Colors
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5">
                  {Object.keys(profile.customColors).map((colorType) => (
                    <div key={colorType} className="flex flex-col">
                      <label className="text-sm mb-1 text-slate-300 capitalize">
                        {colorType}
                      </label>
                      <input
                        type="color"
                        value={profile.customColors[colorType]}
                        onChange={(e) =>
                          updateColors(colorType, e.target.value)
                        }
                        className="w-full h-12 p-1 bg-[hsl(230,10%,20%)] rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-[hsl(230,10%,20%)] rounded-xl p-2 lg:p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Link className="mr-3 text-green-400" />
                <h2 className="text-2xl font-semibold text-white">Links</h2>
              </div>
              <Button onClick={addLink} className="flex items-center">
                <Plus className="mr-2" /> Add Link
              </Button>
            </div>

            <div className="w-full lg:grid grid-cols-3 gap-5">
              {links.map((link, index) => (
                <div
                  key={link.id}
                  className="bg-[hsl(230,10%,20%)] p-4 rounded-lg mb-4 flex items-center space-x-4 hover:bg-[hsl(230,10%,20%)]/50 transition-colors"
                >
                  <div className="flex-grow space-y-3">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) =>
                        updateLink(index, "title", e.target.value)
                      }
                      placeholder="Link Title"
                      className="w-full p-3 bg-[hsl(230,10%,18%)] rounded-lg text-white placeholder-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      placeholder="URL"
                      className="w-full p-3 bg-[hsl(230,10%,18%)] rounded-lg text-white placeholder-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-4">
                      <select
                        value={link.icon}
                        onChange={(e) =>
                          updateLink(index, "icon", e.target.value)
                        }
                        className="p-3 bg-[hsl(230,10%,18%)] rounded-lg text-white"
                      >
                        <option value="default">Default</option>
                        <option value="website">Website</option>
                      </select>
                      {/* <label className="flex items-center text-white">
                        <input
                          type="checkbox"
                          checked={link.isActive}
                          onChange={(e) =>
                            updateLink(index, "isActive", e.target.checked)
                          }
                          className="mr-2 text-blue-500 focus:ring-blue-500"
                        />
                        Active
                      </label> */}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="bg-red-600 hover:bg-red-700 p-3 rounded-lg text-white transition-colors"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeEdit;
