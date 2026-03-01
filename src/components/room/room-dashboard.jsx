import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link2,
  X,
  Edit2,
  Trash2,
  Activity,
  Eye,
  Archive,
  Loader2,
  ArchiveRestore,
  UserPlus,
  Filter,
  HousePlus,
} from "lucide-react";
import { getMyRooms, createRoom, updateRoom, deleteRoom } from "../../api/rooms";
import RoomInvitationManager from "./room-invitation-manager";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { CardHeader, CardTitle } from "../ui/card";
import { UrlState } from "@/context";

const RoomDashboard = () => {
  const navigate = useNavigate();
  const { user } = UrlState();
  const [rooms, setRooms] = useState([]);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slugError, setSlugError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomData, setRoomData] = useState({
    title: "",
    slug: "",
    profile: {
      name: "",
      bio: "",
      theme: "default",
      customColors: {
        primary: "#4F46E5",
        secondary: "#10B981",
        background: "#1F2937",
      },
    },
  });
  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: "all", // 'all', 'active', 'archived'
    minLinks: 0,
    maxLinks: 100,
    minViews: 0,
    maxViews: 1000,
    searchQuery: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchRooms();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);
  useEffect(() => {
    applyFilters();
  }, [rooms, filterOptions]);

  const applyFilters = () => {
    let result = rooms;

    // Status filter
    if (filterOptions.status === "active") {
      result = result.filter((room) => room.isPublic);
    } else if (filterOptions.status === "archived") {
      result = result.filter((room) => !room.isPublic);
    }

    // Links filter
    result = result.filter(
      (room) =>
        (room.sharedUrls?.length || room._count?.sharedUrls || 0) >= filterOptions.minLinks &&
        (room.sharedUrls?.length || room._count?.sharedUrls || 0) <= filterOptions.maxLinks
    );

    // Views filter — removed (no views field in Prisma Room model)

    // Search query filter
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.slug.toLowerCase().includes(query) ||
          (room.description || "").toLowerCase().includes(query)
      );
    }

    setFilteredRooms(result);
  };

  const resetFilters = () => {
    setFilterOptions({
      status: "all",
      minLinks: 0,
      maxLinks: 100,
      minViews: 0,
      maxViews: 1000,
      searchQuery: "",
    });
    setShowFilterModal(false);
  };

  const fetchRooms = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getMyRooms();
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a URL-friendly slug
  const generateSlug = (title) => {
    return title
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading and trailing spaces
      .replace(/[^\w\s-]/g, "") // Remove special characters except whitespace and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+/, "") // Remove leading hyphens
      .replace(/-+$/, ""); // Remove trailing hyphens
  };

  // Check if slug exists is now handled server-side
  const checkSlugExists = async () => false;

  // Generate unique slug
  const generateUniqueSlug = async (baseSlug) => baseSlug;

  // Handle title change and update slug
  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    const baseSlug = generateSlug(newTitle);

    setRoomData({
      ...roomData,
      title: newTitle,
      slug: baseSlug,
    });

    // Clear any previous errors
    setSlugError("");

    // Only check for uniqueness if we have a title
    if (newTitle) {
      const slugExists = await checkSlugExists(baseSlug);
      if (slugExists) {
        const uniqueSlug = await generateUniqueSlug(baseSlug);
        setRoomData((prev) => ({
          ...prev,
          slug: uniqueSlug,
        }));
      }
    }
  };

  // Create new room
  const handleCreateRoom = async () => {
    setIsLoadingState(true);
    try {
      const data = await createRoom({
        name: roomData.title,
        slug: roomData.slug,
        description: roomData.profile.bio || "",
        isPublic: true,
      });

      setRooms([data, ...rooms]);
      setRoomData({
        title: "",
        slug: "",
        profile: {
          name: "",
          bio: "",
          theme: "default",
          customColors: {
            primary: "#4F46E5",
            secondary: "#10B981",
            background: "#1F2937",
          },
        },
      });
      setShowNewRoomModal(false);
      setSlugError("");
    } catch (error) {
      console.error("Error creating room:", error);
      if (error.message?.includes("Slug already taken")) {
        setSlugError("This slug is already taken. Please try a different title.");
      }
    } finally {
      setIsLoadingState(false);
    }
  };

  // Update room
  const handleUpdateRoom = async () => {
    setIsLoadingState(true);
    try {
      const data = await updateRoom(activeRoom.id, {
        name: roomData.title,
        description: roomData.profile.bio || "",
      });

      setRooms(rooms.map((room) => (room.id === activeRoom.id ? data : room)));
      setShowEditModal(false);
      setSlugError("");
    } catch (error) {
      console.error("Error updating room:", error);
      if (error.message?.includes("Slug already taken")) {
        setSlugError("This slug is already taken. Please try a different title.");
      }
    } finally {
      setIsLoadingState(false);
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setIsLoadingState(true);
    try {
      await deleteRoom(roomId);
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setIsLoadingState(false);
    }
  };

  // Navigate to room detail page
  const handleRoomClick = (roomId, slug) => {
    navigate(`/room/${slug}`); // Now using slug for navigation
  };
  const handleArchive = async (roomId) => {
    setIsLoadingState(true);
    try {
      const currentRoom = rooms.find((room) => room.id === roomId);
      const newIsPublic = !currentRoom.isPublic;
      await updateRoom(roomId, { isPublic: newIsPublic });

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === roomId) {
            return { ...room, isPublic: newIsPublic };
          }
          return room;
        })
      );
    } catch (error) {
      console.error("Error archiving Room:", error);
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">Rooms</div>
              <Button size="sm" onClick={() => setShowNewRoomModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
                Create Room
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>
        <div className="flex items-center gap-5">

          <div className="flex items-center mt-5 mb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(true)}
              className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"
            >
              <Filter size={16} className="mr-2" /> Filters
            </Button>
          </div>
          <div className="flex items-center mt-5 mb-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/joined-rooms")}
              className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"
            >
              <HousePlus size={16} className="mr-2" /> Joined Rooms
            </Button>
          </div>
        </div>

        {
          // No Rooms
          rooms.length === 0 && (
            <div className="text-center py-8 w-full h-full">
              <p className="text-slate-500">
                You haven&apos;t created any rooms yet. Click the button above to
                get started.
              </p>
            </div>
          )
        }
        {showFilterModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-50">
            <div className="rounded-xl p-6 w-full max-w-md bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Filter Rooms</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-1 hover:bg-[hsl(230,10%,14%)] rounded-md text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={filterOptions.status}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[hsl(230,10%,20%)] rounded-lg bg-[hsl(230,10%,14%)] text-white placeholder:text-slate-500"
                  >
                    <option value="all">All Rooms</option>
                    <option value="active">Active Rooms</option>
                    <option value="archived">Archived Rooms</option>
                  </select>
                </div>

                {/* Links Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Number of Links
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min Links"
                      value={filterOptions.minLinks}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          minLinks: Number(e.target.value),
                        }))
                      }
                      className="w-1/2 px-3 py-2 border rounded-lg bg-[hsl(230,12%,9%)]"
                    />
                    <input
                      type="number"
                      placeholder="Max Links"
                      value={filterOptions.maxLinks}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          maxLinks: Number(e.target.value),
                        }))
                      }
                      className="w-1/2 px-3 py-2 border rounded-lg bg-[hsl(230,12%,9%)]"
                    />
                  </div>
                </div>

                {/* Views Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Number of Views
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min Views"
                      value={filterOptions.minViews}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          minViews: Number(e.target.value),
                        }))
                      }
                      className="w-1/2 px-3 py-2 border rounded-lg bg-[hsl(230,12%,9%)]"
                    />
                    <input
                      type="number"
                      placeholder="Max Views"
                      value={filterOptions.maxViews}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          maxViews: Number(e.target.value),
                        }))
                      }
                      className="w-1/2 px-3 py-2 border rounded-lg bg-[hsl(230,12%,9%)]"
                    />
                  </div>
                </div>

                {/* Search Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={filterOptions.searchQuery}
                    onChange={(e) =>
                      setFilterOptions((prev) => ({
                        ...prev,
                        searchQuery: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-[hsl(230,10%,20%)] rounded-lg bg-[hsl(230,10%,14%)] text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <Button onClick={() => setShowFilterModal(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room List Section */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-8 w-full h-full">
            <p className="text-slate-500">
              {rooms.length === 0
                ? "You haven't created any rooms yet."
                : "No rooms match your current filter criteria."}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 w-full h-full flex items-center justify-center">
            <span className="flex gap-2 items-center">
              Loading rooms...
              <Loader2 className="animate-spin w-4 h-4" />
            </span>
          </div>
        ) : (
          /* Rooms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] rounded-xl p-5 hover:border-[hsl(230,10%,20%)] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-white">{room.name}</h3>
                    </span>
                    <p className="text-sm text-slate-500">{room.slug}</p>
                    <p className="text-slate-400 text-sm mt-2">
                      {room.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      // onClick={()=>handleInvite(room.id, room.user_id)}
                      onClick={() => setIsInviteModalOpen(true)}
                      className="p-2 hover:bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                      <UserPlus size={14} />
                    </button>
                    {isInviteModalOpen && (
                      <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/50 z-20">
                        <div className="bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] rounded-xl p-5">
                          <Dialog
                            open={isInviteModalOpen}
                            onOpenChange={setIsInviteModalOpen}
                          >
                            <DialogContent>
                              <DialogTitle className="text-xl font-bold mb-5">
                                Invite Users
                              </DialogTitle>
                              <RoomInvitationManager
                                roomId={room.id}
                        currentUserId={room.ownerId}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}
                    <button
                      size="sm"
                      onClick={() => handleArchive(room.id)}
                      className="flex items-center gap-2 text-xs hover:bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] p-2 rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                      {!isLoadingState && room.isPublic ? (
                        <Archive size={14} />
                      ) : (
                        <ArchiveRestore size={14} />
                      )}
                      {isLoadingState && (
                        <Loader2 className="animate-spin w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRoom(room);
                        setRoomData({
                          title: room.name,
                          slug: room.slug,
                          profile: { bio: room.description || "" },
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 hover:bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoom(room.id);
                      }}
                      className="p-2 hover:bg-red-500/10 text-red-400 border border-[hsl(230,10%,20%)] rounded-lg transition-colors"
                    >
                      {isLoadingState ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="py-1 px-2 text-xs rounded-full border border-[hsl(230,10%,20%)] flex items-center gap-2 text-slate-300">
                    <Link2 size={16} />
                    <span className="font-bold">
                      {room._count?.sharedUrls || 0} links
                    </span>
                  </div>
                  <div className="py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white">
                    {/* <Users size={16} className="ml-2" /> */}
                    <Eye size={16} />
                    <span className="font-bold">{room._count?.members || 0} members</span>
                  </div>
                  <div className="py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white">
                    <span>
                      {room.isPublic ? (
                        <span className="flex gap-1 text-green-500">
                          <Activity size={16} />
                          Active
                        </span>
                      ) : (
                        <span className="flex gap-1">
                          <Archive size={16} />
                          Archived
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRoomClick(room.id, room.slug)}
                  className="w-full border py-2 rounded-lg text-sm"
                >
                  View Room
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New/Edit Room Modal */}
        {(showNewRoomModal || showEditModal) && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex items-center justify-center z-50">
            <div className="rounded-xl p-6 w-full max-w-md bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)]">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-white">
                  {showNewRoomModal ? "Create New Room" : "Edit Room"}
                </h2>
                <button
                  onClick={() => {
                    setShowNewRoomModal(false);
                    setShowEditModal(false);
                    setSlugError("");
                  }}
                  className="p-1.5 hover:bg-[hsl(230,10%,14%)] rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Room Title
                  </label>
                  <input
                    type="text"
                    value={roomData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-[hsl(230,10%,20%)] rounded-lg bg-[hsl(230,10%,14%)] text-white placeholder:text-slate-500"
                    placeholder="Enter room title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Slug</label>
                  <div className="flex items-center gap-1 px-3 py-2 border border-[hsl(230,10%,20%)] rounded-lg bg-[hsl(230,10%,14%)]">
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-300">{roomData.slug || "generated-slug"}</span>
                  </div>
                  {slugError && (
                    <p className="mt-1 text-sm text-red-400">{slugError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                  <textarea
                    value={roomData.profile.bio}
                    onChange={(e) =>
                      setRoomData({
                        ...roomData,
                        profile: {
                          ...roomData.profile,
                          bio: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[hsl(230,10%,20%)] rounded-lg bg-[hsl(230,10%,14%)] text-white placeholder:text-slate-500"
                    placeholder="Enter room bio"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 justify-end mt-5">
                  <button
                    onClick={() => {
                      setShowNewRoomModal(false);
                      setShowEditModal(false);
                      setSlugError("");
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-[hsl(230,10%,14%)] rounded-lg border border-[hsl(230,10%,20%)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      showNewRoomModal ? handleCreateRoom : handleUpdateRoom
                    }
                    disabled={!roomData.title || slugError}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {showNewRoomModal ? "Create Room" : "Update Room"}
                    {isLoadingState ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : null}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDashboard;
