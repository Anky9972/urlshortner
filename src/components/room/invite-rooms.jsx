import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getJoinedRooms, leaveRoom } from "../../api/rooms";
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
      const data = await getJoinedRooms();
      setRooms(
        data?.map((room) => ({
          ...room,
          room_name: room.name || "Unnamed Room",
          room_owner: room.owner?.name || "Unknown",
          status: "active",
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
      switch (action) {
        case "leave":
          await leaveRoom(roomId);
          break;
        case "archive":
        case "active":
          // Local-only status toggle for the joined rooms view
          setRooms(prev => prev.map(r =>
            r.id === roomId ? { ...r, status: action === "archive" ? "archived" : "active" } : r
          ));
          toast.success(`Room ${action}d successfully`);
          return;
      }

      fetchUserRooms();
      toast.success(`Room ${action === "leave" ? "left" : action + "d"} successfully`);
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
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="text-slate-400">Loading rooms...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                My Rooms
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/rooms")}
                className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"
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
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"}
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
            className={filter === "active"
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"}
          >
            Active
          </Button>
          <Button
            variant={filter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("archived")}
            className={filter === "archived"
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"}
          >
            Archived
          </Button>
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-center p-8">
            <CardContent className="pt-0">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                {filter === "active"
                  ? "No active rooms"
                  : filter === "archived"
                    ? "No archived rooms"
                    : "No rooms joined yet"}
              </p>
              <Button
                onClick={() => navigate("/rooms")}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Browse Rooms
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] hover:border-[hsl(230,10%,20%)] transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-medium text-white truncate">{room.room_name}</h3>
                      {room.status && (
                        <Badge
                          className={room.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"}
                        >
                          {room.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                      {room.profile?.bio || "No description"}
                    </p>
                    <p className="text-xs text-slate-600">Owner: {room.room_owner}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-[hsl(230,10%,14%)]">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                      {room.status !== "archived" ? (
                        <DropdownMenuItem
                          onClick={() => handleRoomAction(room.id, "archive")}
                          className="text-slate-300 focus:bg-[hsl(230,10%,14%)]"
                        >
                          <Archive size={14} className="mr-2" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRoomAction(room.id, "active")}
                          className="text-slate-300 focus:bg-[hsl(230,10%,14%)]"
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
                  className="w-full bg-[hsl(230,10%,14%)] hover:bg-[hsl(230,10%,20%)] text-slate-300"
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
