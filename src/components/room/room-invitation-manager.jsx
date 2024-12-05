import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { z } from 'zod';
import { toast } from 'sonner';
import supabase from '@/db/supabase';
import PropTypes from "prop-types";
import { sendRoomInvitation } from '../notification/notification-methods';

// Zod schema for email validation
const emailSchema = z.string().email('Invalid email address');

const RoomInvitationManager = ({ roomId, currentUserId }) => {
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch existing invitations
  const fetchInvitations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('room_invitations')
      .select('*, auth.users(email)')
      .eq('room_id', roomId);

    if (error) {
      toast.error('Failed to fetch invitations');
    } else {
      setInvitations(data || []);
    }
    setLoading(false);
  };

  // Send room invitation
  // const sendInvitation = async () => {
  //   try {
  //     // Validate email
  //     emailSchema.parse(email);

  //     setLoading(true);
  //     const { error } = await supabase
  //       .from('room_invitations')
  //       .insert({
  //         room_id: roomId,
  //         inviter_id: currentUserId,
  //         invited_email: email,
  //         status: 'pending'
  //       })
  //       .select();

  //     if (error) {
  //       toast.error(error.message);
  //     } else {
  //       toast.success('Invitation sent successfully');
  //       setEmail('');
  //       await fetchInvitations();
  //     }
  //   } catch (validationError) {
  //     toast.error(validationError.errors[0].message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // Cancel invitation
  const cancelInvitation = async (invitationId) => {
    const { error } = await supabase
      .from('room_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      toast.error('Failed to cancel invitation');
    } else {
      toast.success('Invitation canceled');
      await fetchInvitations();
    }
  };

  // Update invitation status
  const updateInvitationStatus = async (invitationId, newStatus) => {
    const { error } = await supabase
      .from('room_invitations')
      .update({ status: newStatus })
      .eq('id', invitationId);

    if (error) {
      toast.error(`Failed to update invitation to ${newStatus}`);
    } else {
      toast.success(`Invitation ${newStatus}`);
      await fetchInvitations();
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [roomId]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-center gap-2 w-full">
        <Input 
          placeholder="Enter email to invite" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <Button 
          // onClick={sendRoomInvitation(roomId, currentUserId, email)} 
          onClick={() => sendRoomInvitation(roomId, currentUserId, email)}
          disabled={loading}
        >
          Invite
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invited_email}</TableCell>
              <TableCell>
                <Select
                  value={inv.status}
                  onValueChange={(status) => 
                    updateInvitationStatus(inv.id, status)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => cancelInvitation(inv.id)}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

RoomInvitationManager.propTypes = {
    roomId: PropTypes.string.isRequired,
    currentUserId: PropTypes.string.isRequired,
    };

export default RoomInvitationManager;