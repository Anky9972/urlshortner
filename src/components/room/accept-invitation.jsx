import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import supabase from "@/db/supabase";
import { Users, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RoomInvitation = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roomId) {
      fetchInvitation();
    }
  }, [roomId]);

  const fetchInvitation = async () => {
    try {
      const { data: roomData, error } = await supabase
        .from("rooms")
        .select(`
          *,
          user_id (
            id,
            email,
            full_name,
            profile_pic_url
          ),
          room_members (
            user_id
          )
        `)
        .eq("id", roomId)
        .single();

      if (error) throw error;

      if (!roomData) {
        setError("Invitation not found");
        return;
      }

      const membersCount = roomData.room_members?.length || 0;
      setInvitation({
        ...roomData,
        members_count: membersCount,
      });
    } catch (error) {
      console.error("Error fetching invitation:", error);
      setError(error.message);
      toast.error("Error fetching invitation");
    } finally {
      setLoading(false);
    }
  };

  const removeRoomFromUsersList = async (userId, roomId) => {
    try {
      const { error: roomError } = await supabase
        .from("user_rooms")
        .delete()
        .match({
          user_id: userId,
          room_id: roomId,
        });

      if (roomError) throw roomError;
      return true;
    } catch (error) {
      console.error("Error removing room from user list:", error);
      throw error;
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to accept the invitation");
        return;
      }

      const { data: existingMember } = await supabase
        .from("room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        toast.info("You are already a member of this room");
        return;
      }

      await addRoomToUsersList(user.id, roomId);

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .match({ "content->roomId": roomId });

      toast.success("Successfully joined the room");
    } catch (error) {
      console.error("Full Error Details:", error);
      toast.error(error.message || "Failed to join room");
    } finally {
      setProcessing(false);
    }
  };

  const addRoomToUsersList = async (userId, roomId) => {
    try {
      const { error: memberError } = await supabase
        .from("room_members")
        .insert({
          room_id: roomId,
          user_id: userId,
          role: "member",
        })
        .select()
        .single();

      if (memberError) throw memberError;

      const { data, error: roomError } = await supabase
        .from("user_rooms")
        .insert({
          user_id: userId,
          room_id: roomId,
          status: "active",
        })
        .select()
        .single();

      if (roomError) throw roomError;
      return data;
    } catch (error) {
      console.error("Error adding room to user list:", error);
      throw error;
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to decline the invitation");
        return;
      }

      await removeRoomFromUsersList(user.id, roomId);

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .match({ "content->roomId": roomId });

      toast.success("Invitation declined");
      navigate("/notifications");
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error(error.message || "Error declining invitation");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-zinc-400">Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6 text-center">
              <p className="text-zinc-400 mb-4">Invitation not found or has expired</p>
              <Button
                variant="outline"
                onClick={() => navigate("/notifications")}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={() => navigate("/notifications")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center border-b border-zinc-800 pb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-white">Room Invitation</CardTitle>
            <p className="text-sm text-zinc-500">You&apos;ve been invited to join a room</p>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Room</Badge>
                <h3 className="font-medium text-white">{invitation.profile?.name}</h3>
              </div>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {invitation.members_count} members
              </Badge>
            </div>

            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 mb-2">Room Owner</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={invitation.user_id?.profile_pic_url} />
                  <AvatarFallback className="bg-zinc-700 text-zinc-300">
                    {invitation.user_id?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white text-sm">{invitation.user_id?.full_name}</p>
                  <p className="text-xs text-zinc-500">{invitation.user_id?.email}</p>
                </div>
              </div>
            </div>

            {invitation.description && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">Description</p>
                <p className="text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                  {invitation.description}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3 justify-end border-t border-zinc-800 pt-4">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={processing}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 w-28"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 w-28"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RoomInvitation;
