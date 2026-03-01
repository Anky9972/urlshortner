import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { toast } from 'sonner';
import PropTypes from "prop-types";
import { addRoomMember } from '../../api/rooms';

// Zod schema for email validation
const emailSchema = z.string().email('Invalid email address');

const RoomInvitationManager = ({ roomId }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    try {
      emailSchema.parse(email);
      setLoading(true);
      await addRoomMember(roomId, email);
      toast.success('Invitation sent successfully');
      setEmail('');
    } catch (validationError) {
      if (validationError.errors) {
        toast.error(validationError.errors[0].message);
      } else {
        toast.error(validationError.message || 'Failed to send invitation');
      }
    } finally {
      setLoading(false);
    }
  };

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
          onClick={handleInvite}
          disabled={loading || !email}
        >
          {loading ? 'Inviting...' : 'Invite'}
        </Button>
      </div>
    </div>
  );
};

RoomInvitationManager.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomInvitationManager;