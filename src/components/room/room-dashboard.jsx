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
import supabase from "@/db/supabase";
import RoomInvitationManager from "./room-invitation-manager";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { CardHeader, CardTitle } from "../ui/card";

const RoomDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slugError, setSlugError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [userId, setUserId] = useState(null);
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
    fetchRooms();
  }, []);
  useEffect(() => {
    applyFilters();
  }, [rooms, filterOptions]);

  const applyFilters = () => {
    let result = rooms;

    // Status filter
    if (filterOptions.status === "active") {
      result = result.filter((room) => room.is_active);
    } else if (filterOptions.status === "archived") {
      result = result.filter((room) => !room.is_active);
    }

    // Links filter
    result = result.filter(
      (room) =>
        (room.links?.length || 0) >= filterOptions.minLinks &&
        (room.links?.length || 0) <= filterOptions.maxLinks
    );

    // Views filter
    result = result.filter(
      (room) =>
        (room.views || 0) >= filterOptions.minViews &&
        (room.views || 0) <= filterOptions.maxViews
    );

    // Search query filter
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.title.toLowerCase().includes(query) ||
          room.slug.toLowerCase().includes(query) ||
          room.profile.bio?.toLowerCase().includes(query)
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
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRooms(data);
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

  // Check if slug exists in database
  const checkSlugExists = async (slug) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .select("id")
        .eq("slug", slug)
        .single();

      if (error && error.code === "PGRST116") {
        // PGRST116 means no rows returned - slug is available
        return false;
      }

      return true; // Slug exists
    } catch (error) {
      console.error("Error checking slug:", error);
      return true; // Assume slug exists on error to be safe
    }
  };

  // Generate unique slug
  const generateUniqueSlug = async (baseSlug) => {
    let slug = baseSlug;
    let counter = 1;
    let slugExists = await checkSlugExists(slug);

    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await checkSlugExists(slug);
      counter++;
    }

    return slug;
  };

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
      // Final slug check before creation
      const slugExists = await checkSlugExists(roomData.slug);
      if (slugExists) {
        setSlugError(
          "This slug is already taken. Please try a different title."
        );
        return;
      }

      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            title: roomData.title,
            slug: roomData.slug,
            profile: {
              ...roomData.profile,
              name: roomData.title,
            },
            links: [],
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

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
      if (error.code === "23505") {
        // Unique violation
        setSlugError(
          "This slug is already taken. Please try a different title."
        );
      }
    } finally {
      setIsLoadingState(false);
    }
  };

  // Update room
  const handleUpdateRoom = async () => {
    setIsLoadingState(true);
    try {
      // Only check slug if it changed
      if (activeRoom.slug !== roomData.slug) {
        const slugExists = await checkSlugExists(roomData.slug);
        if (slugExists) {
          setSlugError(
            "This slug is already taken. Please try a different title."
          );
          return;
        }
      }

      const { data, error } = await supabase
        .from("rooms")
        .update({
          title: roomData.title,
          slug: roomData.slug,
          profile: {
            ...roomData.profile,
            name: roomData.title,
          },
        })
        .eq("id", activeRoom.id)
        .select()
        .single();

      if (error) throw error;

      setRooms(rooms.map((room) => (room.id === activeRoom.id ? data : room)));
      setShowEditModal(false);
      setSlugError("");
    } catch (error) {
      console.error("Error updating room:", error);
      if (error.code === "23505") {
        // Unique violation
        setSlugError(
          "This slug is already taken. Please try a different title."
        );
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
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomId)
        .select();

      if (error) throw error;

      // setRooms(rooms.filter((room) => room.id !== roomId));
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
      const { error } = await supabase
        .from("rooms")
        .update({
          is_active: rooms.find((room) => room.id === roomId).is_active
            ? false
            : true,
        })
        .eq("id", roomId);

      if (error) {
        throw error;
      }

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === roomId) {
            return {
              ...room,
              is_active: false,
            };
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
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">Rooms</div>
            <Button size="sm" onClick={() => setShowNewRoomModal(true)}>
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
        >
          <Filter size={16} className="mr-2" /> Filters
        </Button>
      </div>
      <div className="flex items-center mt-5 mb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/joined-rooms")}
        >
          <HousePlus size={16} className="mr-2" /> Joined Rooms
        </Button>
      </div>
      </div>

      {
        // No Rooms
        rooms.length === 0 && (
          <div className="text-center py-8 w-full h-full">
            <p className="text-gray-500">
              You haven&apos;t created any rooms yet. Click the button above to
              get started.
            </p>
          </div>
        )
      }
      {showFilterModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-md bg-gray-950 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filter Rooms</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 hover:bg-gray-900 rounded-md border"
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
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
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
                    className="w-1/2 px-3 py-2 border rounded-lg bg-gray-900"
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
                    className="w-1/2 px-3 py-2 border rounded-lg bg-gray-900"
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
                    className="w-1/2 px-3 py-2 border rounded-lg bg-gray-900"
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
                    className="w-1/2 px-3 py-2 border rounded-lg bg-gray-900"
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
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
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
          <p className="text-gray-500">
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
              className="border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="flex items-center gap-2">
                    <h3 className="font-semibold text-xl">{room.title}</h3>
                  </span>
                  <p className="text-sm text-gray-500">{room.slug}</p>
                  <p className="text-gray-600 text-sm mt-2">
                    {room.profile.bio}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    // onClick={()=>handleInvite(room.id, room.user_id)}
                    onClick={() => setIsInviteModalOpen(true)}
                    className="p-2 hover:bg-gray-900 border rounded-md shadow-md"
                  >
                    <UserPlus size={16} />
                  </button>
                  {isInviteModalOpen && (
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-opacity-40 z-20 top-0 right-0 w-full h-full">
                      <div className="bg-gray-950 border rounded-lg p-4">
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
                              currentUserId={room.user_id}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                  <button
                    size="sm"
                    onClick={() => handleArchive(room.id)}
                    className="flex items-center gap-2 text-xs hover:bg-gray-900 font-bold border p-2 rounded-md shadow-md"
                  >
                    {!isLoadingState && room.is_active ? (
                      <Archive size={16} />
                    ) : (
                      <ArchiveRestore size={16} />
                    )}
                    {/* {!isLoadingState && room.is_active ? "Archive" : "Restore"} */}
                    {isLoadingState && (
                      <Loader2 className="animate-spin w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRoom(room);
                      setRoomData({
                        title: room.title,
                        slug: room.slug,
                        profile: room.profile,
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-gray-900 border rounded-md shadow-md"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id);
                    }}
                    className="p-2 hover:bg-gray-900 text-red-500 border rounded-md shadow-md"
                  >
                    {isLoadingState ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white">
                  <Link2 size={16} />
                  <span className="font-bold">
                    {room.links?.length || 0} links
                  </span>
                </div>
                <div className="py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white">
                  {/* <Users size={16} className="ml-2" /> */}
                  <Eye size={16} />
                  <span className="font-bold">{room.views || 0} views</span>
                </div>
                <div className="py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white">
                  <span>
                    {room.is_active ? (
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center">
          <div className="rounded-lg p-6 w-full max-w-md bg-gray-950 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showNewRoomModal ? "Create New Room" : "Edit Room"}
              </h2>
              <button
                onClick={() => {
                  setShowNewRoomModal(false);
                  setShowEditModal(false);
                  setSlugError("");
                }}
                className="p-1 hover:bg-gray-900 rounded-md border"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Room Title
                </label>
                <input
                  type="text"
                  value={roomData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
                  placeholder="Enter room title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <div className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-gray-900">
                  <span className="text-gray-500">/</span>
                  <span>{roomData.slug || "generated-slug"}</span>
                </div>
                {slugError && (
                  <p className="mt-1 text-sm text-red-600">{slugError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
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
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
                  placeholder="Enter room bio"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowNewRoomModal(false);
                    setShowEditModal(false);
                    setSlugError("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showNewRoomModal ? handleCreateRoom : handleUpdateRoom
                  }
                  disabled={!roomData.title || slugError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
  );
};

export default RoomDashboard;
