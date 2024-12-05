import supabase from "@/db/supabase";

export const createNotification = async (userId, type, content, isGlobal = false) => {
  try {
    if (!isGlobal && !userId) {
      throw new Error('userId is required for non-global notifications');
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        content,
        is_read: false,
        is_global: isGlobal
      })
      .select();  // Add .select() to return the created data
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
  // Usage in invitation flow
// export const sendRoomInvitation = async (roomId, inviterId, invitedEmail) => {
//     // Create invitation in room_invitations
//     const { data, error } = await supabase
//       .from('room_invitations')
//       .insert({
//         room_id: roomId,
//         inviter_id: inviterId,
//         invited_email: invitedEmail,
//         status: 'pending'
//       })
//       .select()
//       .single();
  
//     // Find invited user's ID
//     const { data: userData } = await supabase
//       .from('auth.users')
//       .select('id')
//       .eq('email', invitedEmail)
//       .single();
//    console.log(userData)
//     if (userData) {
//       // Create in-app notification
//       await createNotification(userData.id, 'room_invitation', {
//         type: 'room_invitation',
//         title: 'Room Invitation',
//         message: `You've been invited to join a room`,
//         roomId: roomId,
//         inviterId: inviterId
//       });
//     }
//   };
export const sendRoomInvitation = async (roomId, inviterId, invitedEmail) => {
  try {
    // First check if invitation already exists
    const { data: existingInvite } = await supabase
      .from('room_invitations')
      .select('*')
      .match({ 
        room_id: roomId,
        invited_email: invitedEmail,
        status: 'pending'
      })
      .single();

    if (existingInvite) {
      throw new Error('Invitation already exists for this email');
    }

    // Create invitation
    const { data: invitationData, error: invitationError } = await supabase
      .from('room_invitations')
      .insert({
        room_id: roomId,
        inviter_id: inviterId,
        invited_email: invitedEmail,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) throw invitationError;

    // Find user
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', invitedEmail)
      .single();

    if (userError) {
      console.log('User not found in profiles:', userError);
    }

    // Create notification if user exists
    if (userData?.id) {
      await createNotification(
        userData.id,  // userId
        'room_invitation',  // type
        {  // content
          type: 'room_invitation',
          title: 'Room Invitation',
          message: `You've been invited to join a room`,
          roomId: roomId,
          inviterId: inviterId
        },
        false  // isGlobal
      );
    }

    return invitationData;

  } catch (error) {
    console.error('Error sending room invitation:', error);
    throw error;
  }
};
export const sendGlobalAnnouncement = async (message) => {
  return await createNotification({
    type: 'announcement',
    content: {
      type: 'announcement',
      title: 'System Announcement',
      message: message
    },
    isGlobal: true
  });
};

// Function to fetch notifications for the current user
export const fetchNotifications = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userData.user.id},is_global.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};


export const fetchNotificationsForUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},is_global.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};