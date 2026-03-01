import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getRoom, leaveRoom } from "../../api/rooms";
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
      const roomData = await getRoom(roomId);
      setInvitation({
        ...roomData,
        members_count: roomData.members?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching invitation:", error);
      setError(error.message);
      toast.error("Error fetching invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      // User was already added as member when the invite was sent
      // Just navigate to the room
      toast.success("Successfully joined the room");
      navigate(`/room/${invitation.slug}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to join room");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await leaveRoom(roomId);
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
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="text-slate-400">Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
            <CardContent className="p-6 text-center">
              <p className="text-slate-400 mb-4">Invitation not found or has expired</p>
              <Button
                variant="outline"
                onClick={() => navigate("/notifications")}
                className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"
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
    <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-slate-400 hover:text-white hover:bg-[hsl(230,10%,14%)]"
          onClick={() => navigate("/notifications")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
          <CardHeader className="text-center border-b border-[hsl(230,10%,15%)] pb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-white">Room Invitation</CardTitle>
            <p className="text-sm text-slate-500">You&apos;ve been invited to join a room</p>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(230,10%,14%)]/50 border border-[hsl(230,10%,20%)]/50">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600/10 text-blue-400 border-blue-600/20">Room</Badge>
                <h3 className="font-medium text-white">{invitation.name}</h3>
              </div>
              <Badge variant="outline" className="border-[hsl(230,10%,20%)] text-slate-400">
                {invitation.members_count} members
              </Badge>
            </div>

            <div className="p-3 rounded-lg bg-[hsl(230,10%,14%)]/50 border border-[hsl(230,10%,20%)]/50">
              <p className="text-xs text-slate-500 mb-2">Room Owner</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={invitation.owner?.avatarUrl} />
                  <AvatarFallback className="bg-[hsl(230,10%,20%)] text-slate-300">
                    {invitation.owner?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white text-sm">{invitation.owner?.name}</p>
                  <p className="text-xs text-slate-500">Room owner</p>
                </div>
              </div>
            </div>

            {invitation.description && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-300 bg-[hsl(230,10%,14%)]/50 p-3 rounded-lg border border-[hsl(230,10%,20%)]/50">
                  {invitation.description}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3 justify-end border-t border-[hsl(230,10%,15%)] pt-4">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={processing}
              className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)] w-28"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-500 text-white w-28"
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
