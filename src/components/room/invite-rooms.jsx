import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import supabase from "@/db/supabase";
import { Users, ArrowRight, Loader2, MoreHorizontal, Archive, ArchiveRestore, LogOut } from "lucide-react";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        return;
      }

      const { data, error } = await supabase
        .from("user_rooms")
        .select(
          `
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
        `
        )
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      switch (action) {
        case "archive":
          await supabase
            .from("user_rooms")
            .update({ status: "archived" })
            .match({
              user_id: user.id,
              room_id: roomId,
            });
          break;
        case "active":
          await supabase
            .from("user_rooms")
            .update({ status: "active" })
            .match({
              user_id: user.id,
              room_id: roomId,
            });
          break;
        case "leave":
          // Remove from room_members and user_rooms
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

      // Refresh room list
      fetchUserRooms();
      toast.success(`Room ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing room:`, error);
      toast.error(`Failed to ${action} room`);
    }
  };

  // Filter rooms based on selected filter
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">My Rooms</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/rooms")}
            >
              Browse Rooms
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="flex space-x-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "archived" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("archived")}
        >
          Archived
        </Button>
      </div>

      {filteredRooms.length === 0 && (
        <Card className="text-center p-6">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === "active"
                ? "No active rooms"
                : filter === "archived"
                ? "No archived rooms"
                : "No rooms joined yet"}
            </p>
            <Button className="mt-4" onClick={() => navigate("/rooms")}>
              Browse Rooms
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{room.room_name}</h3>
                    {room.status && (
                      <Badge
                        variant={
                          room.status === "active" ? "default" : "secondary"
                        }
                      >
                        {room.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    {room.profile?.bio || "No description"}
                  </p>
                  <div className="text-xs text-gray-400">
                    Owner: {room.room_owner}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {room.status !== "archived" ?(
                      <DropdownMenuItem
                        onClick={() => handleRoomAction(room.id, "archive")}
                        className="flex items-center gap-2"
                      >
                        <Archive size={16}/>
                        Archive Room
                      </DropdownMenuItem>
                    )
                  :
                  (
                    <DropdownMenuItem
                      onClick={() => handleRoomAction(room.id, "active")}
                      className="flex items-center gap-2"
                    >
                      <ArchiveRestore size={16}/>
                      Restore Room
                    </DropdownMenuItem>
                  )}
                    <DropdownMenuItem
                      className="text-red-600 flex items-center gap-2"
                      onClick={() => handleRoomAction(room.id, "leave")}
                    >
                      <LogOut size={16}/>
                      Leave Room
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="sm"
                onClick={() => navigate(`/room/${room.slug}`)}
                className="w-full"
              >
                View Room
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvitedRooms;
