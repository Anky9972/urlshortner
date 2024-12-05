import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import supabase from "@/db/supabase";
import { Users, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
        .select(
          `
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
        `
        )
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
      // Remove from user_rooms table
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to accept the invitation");
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        toast.info("You are already a member of this room");
        // navigate(`/rooms/${roomId}`);
        return;
      }

      // Add room to user's list and create membership
      const insertResult = await addRoomToUsersList(user.id, roomId);
      console.log("User Rooms Insert Result:", insertResult);

      // Mark invitation notification as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .match({ "content->roomId": roomId });

      toast.success("Successfully joined the room");
      // navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error("Full Error Details:", error);
      toast.error(error.message || "Failed to join room");
    } finally {
      setProcessing(false);
    }
  };

  const addRoomToUsersList = async (userId, roomId) => {
    try {
      // First, add user to room_members
      const { error: memberError } = await supabase
        .from("room_members")
        .insert({
          room_id: roomId,
          user_id: userId,
          role: "member",
        })
        .select()
        .single();

      if (memberError) {
        console.error("Room Members Insert Error:", memberError);
        throw memberError;
      }

      // Then, add room to user_rooms table
      const { data, error: roomError } = await supabase
        .from("user_rooms")
        .insert({
          user_id: userId,
          room_id: roomId,
          status: "active",
        })
        .select()
        .single();

      if (roomError) {
        console.error("User Rooms Insert Error:", roomError);
        throw roomError;
      }

      console.log("Successfully inserted into user_rooms:", data);
      return data;
    } catch (error) {
      console.error("Error adding room to user list:", error);
      throw error;
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to decline the invitation");
        return;
      }

      // Remove room from user's list if it exists
      await removeRoomFromUsersList(user.id, roomId);

      // Mark invitation notification as read
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Invitation not found or has expired</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => navigate("/notifications")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to notifications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  console.log("invitation", invitation);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/notifications")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to notifications
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="text-center border-b">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-blue-500" />
            Room Invitation
          </CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a room
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Room
                </Badge>
                <h3 className="font-semibold text-lg">
                  {invitation.profile.name}
                </h3>
              </div>
              <Badge variant="outline">
                {invitation.members_count} members
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Room Owner</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={invitation.user_id.profile_pic_url} />
                  <AvatarFallback>
                    {invitation.user_id?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{invitation.user_id.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {invitation.user_id.email}
                  </p>
                </div>
              </div>
            </div>

            {invitation.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {invitation.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-end border-t pt-6">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={processing}
            className="w-32"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={processing} className="w-32">
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
  );
};

export default RoomInvitation;
