import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import supabase from "@/db/supabase";
import { Users, ArrowRight, Loader2, MoreHorizontal, Archive, ArchiveRestore, LogOut, FolderOpen } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const InvitedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserRooms();
  }, []);

  const fetchUserRooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      const { data, error } = await supabase
        .from("user_rooms")
        .select(`
          id,
          status,
          rooms (
            id,
            title,
            slug,
            updated_at,
            profile,
            links,
            views,
            is_active,
            user_id (
              full_name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRooms(
        data?.map((item) => ({
          user_room_id: item.id,
          ...item.rooms,
          room_name: item.rooms.profile?.name || "Unnamed Room",
          room_owner: item.rooms.user_id?.full_name || "Unknown",
          status: item.status,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomAction = async (roomId, action) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      switch (action) {
        case "archive":
          await supabase
            .from("user_rooms")
            .update({ status: "archived" })
            .match({ user_id: user.id, room_id: roomId });
          break;
        case "active":
          await supabase
            .from("user_rooms")
            .update({ status: "active" })
            .match({ user_id: user.id, room_id: roomId });
          break;
        case "leave":
          await Promise.all([
            supabase.from("room_members").delete().match({
              user_id: user.id,
              room_id: roomId,
            }),
            supabase.from("user_rooms").delete().match({
              user_id: user.id,
              room_id: roomId,
            }),
          ]);
          break;
      }

      fetchUserRooms();
      toast.success(`Room ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing room:`, error);
      toast.error(`Failed to ${action} room`);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    switch (filter) {
      case "active":
        return room.status === "active";
      case "archived":
        return room.status === "archived";
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-zinc-400">Loading rooms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                My Rooms
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/rooms")}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Browse Rooms
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all"
              ? "bg-cyan-500 text-zinc-900 hover:bg-cyan-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
            className={filter === "active"
              ? "bg-cyan-500 text-zinc-900 hover:bg-cyan-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}
          >
            Active
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("archived")}
            className={filter === "archived"
              ? "bg-cyan-500 text-zinc-900 hover:bg-cyan-400"
              : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}
          >
            Archived
          </Button>
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <Card className="bg-zinc-900 border-zinc-800 text-center p-8">
            <CardContent className="pt-0">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">
                {filter === "active"
                  ? "No active rooms"
                  : filter === "archived"
                    ? "No archived rooms"
                    : "No rooms joined yet"}
              </p>
              <Button
                onClick={() => navigate("/rooms")}
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900"
              >
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-white truncate">{room.room_name}</h3>
                      {room.status && (
                        <Badge
                          className={room.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}
                        >
                          {room.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 mb-2 line-clamp-2">
                      {room.profile?.bio || "No description"}
                    </p>
                    <p className="text-xs text-zinc-600">Owner: {room.room_owner}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                      {room.status !== "archived" ? (
                        <DropdownMenuItem
                          onClick={() => handleRoomAction(room.id, "archive")}
                          className="text-zinc-300 focus:bg-zinc-800"
                        >
                          <Archive size={14} className="mr-2" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRoomAction(room.id, "active")}
                          className="text-zinc-300 focus:bg-zinc-800"
                        >
                          <ArchiveRestore size={14} className="mr-2" />
                          Restore
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                        onClick={() => handleRoomAction(room.id, "leave")}
                      >
                        <LogOut size={14} className="mr-2" />
                        Leave
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
              <CardFooter className="pt-0 px-4 pb-4">
                <Button
                  size="sm"
                  onClick={() => navigate(`/room/${room.slug}`)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  View Room
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvitedRooms;
