import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Users, Link2, X, Edit2, Trash2, 
  Activity,
  Eye
} from 'lucide-react';
import supabase  from '@/db/supabase';

const RoomDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slugError, setSlugError] = useState('');
  const [roomData, setRoomData] = useState({
    title: '',
    slug: '',
    profile: {
      name: '',
      bio: '',
      theme: 'default',
      customColors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        background: '#1F2937'
      }
    }
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a URL-friendly slug
  const generateSlug = (title) => {
    return title
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading and trailing spaces
      .replace(/[^\w\s-]/g, '') // Remove special characters except whitespace and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '') // Remove leading hyphens
      .replace(/-+$/, ''); // Remove trailing hyphens
  };

  // Check if slug exists in database
  const checkSlugExists = async (slug) => {
    try {
      const {error } = await supabase
        .from('rooms')
        .select('id')
        .eq('slug', slug)
        .single();

      if (error && error.code === 'PGRST116') {
        // PGRST116 means no rows returned - slug is available
        return false;
      }

      return true; // Slug exists
    } catch (error) {
      console.error('Error checking slug:', error);
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
      slug: baseSlug
    });

    // Clear any previous errors
    setSlugError('');

    // Only check for uniqueness if we have a title
    if (newTitle) {
      const slugExists = await checkSlugExists(baseSlug);
      if (slugExists) {
        const uniqueSlug = await generateUniqueSlug(baseSlug);
        setRoomData(prev => ({
          ...prev,
          slug: uniqueSlug
        }));
      }
    }
  };

  // Create new room
  const handleCreateRoom = async () => {
    try {
      // Final slug check before creation
      const slugExists = await checkSlugExists(roomData.slug);
      if (slugExists) {
        setSlugError('This slug is already taken. Please try a different title.');
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .insert([{
          title: roomData.title,
          slug: roomData.slug,
          profile: {
            ...roomData.profile,
            name: roomData.title // Set profile name same as title
          },
          links: []
        }])
        .select()
        .single();

      if (error) throw error;

      setRooms([data, ...rooms]);
      setRoomData({
        title: '',
        slug: '',
        profile: {
          name: '',
          bio: '',
          theme: 'default',
          customColors: {
            primary: '#4F46E5',
            secondary: '#10B981',
            background: '#1F2937'
          }
        }
      });
      setShowNewRoomModal(false);
      setSlugError('');
    } catch (error) {
      console.error('Error creating room:', error);
      if (error.code === '23505') { // Unique violation
        setSlugError('This slug is already taken. Please try a different title.');
      }
    }
  };

  // Update room
  const handleUpdateRoom = async () => {
    try {
      // Only check slug if it changed
      if (activeRoom.slug !== roomData.slug) {
        const slugExists = await checkSlugExists(roomData.slug);
        if (slugExists) {
          setSlugError('This slug is already taken. Please try a different title.');
          return;
        }
      }

      const { data, error } = await supabase
        .from('rooms')
        .update({
          title: roomData.title,
          slug: roomData.slug,
          profile: {
            ...roomData.profile,
            name: roomData.title
          }
        })
        .eq('id', activeRoom.id)
        .select()
        .single();

      if (error) throw error;

      setRooms(rooms.map(room => 
        room.id === activeRoom.id ? data : room
      ));
      setShowEditModal(false);
      setSlugError('');
    } catch (error) {
      console.error('Error updating room:', error);
      if (error.code === '23505') { // Unique violation
        setSlugError('This slug is already taken. Please try a different title.');
      }
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Navigate to room detail page
  const handleRoomClick = (roomId, slug) => {
    navigate(`/room/${slug}`); // Now using slug for navigation
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <button
          onClick={() => setShowNewRoomModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Room
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">Loading rooms...</div>
      ) : (
        /* Rooms Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div 
              key={room.id} 
              className="border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className='flex items-center gap-2'>
                  <h3 className="font-semibold text-xl">{room.title}</h3>
                   <p className='text-xs font-bold p-1 border rounded-full'>{room.is_active ? (<span className='flex gap-1 text-green-500'><Activity size={16}/>Active</span>): "Archived"}</p>
                  </span>
                  <p className="text-sm text-gray-500">{room.slug}</p>
                  <p className="text-gray-600 text-sm mt-2">{room.profile.bio}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveRoom(room);
                      setRoomData({
                        title: room.title,
                        slug: room.slug,
                        profile: room.profile
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id);
                    }}
                    className="p-2 rounded-full text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <div className='py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white'>
                <Link2 size={16} />
                <span className='font-bold'>{room.links?.length || 0} links</span>
                </div>
                <div className='py-1 px-2 text-xs rounded-full border flex items-center gap-2 text-white'>
                {/* <Users size={16} className="ml-2" /> */}
                <Eye size={16}/>
                <span className='font-bold'>{room.views || 0} views</span>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showNewRoomModal ? 'Create New Room' : 'Edit Room'}
              </h2>
              <button
                onClick={() => {
                  setShowNewRoomModal(false);
                  setShowEditModal(false);
                  setSlugError('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Title</label>
                <input
                  type="text"
                  value={roomData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter room title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <div className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-gray-50">
                  <span className="text-gray-500">/</span>
                  <span>{roomData.slug || 'generated-slug'}</span>
                </div>
                {slugError && (
                  <p className="mt-1 text-sm text-red-600">{slugError}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={roomData.profile.bio}
                  onChange={(e) => setRoomData({
                    ...roomData,
                    profile: {
                      ...roomData.profile,
                      bio: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter room bio"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowNewRoomModal(false);
                    setShowEditModal(false);
                    setSlugError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={showNewRoomModal ? handleCreateRoom : handleUpdateRoom}
                  disabled={!roomData.title || slugError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showNewRoomModal ? 'Create Room' : 'Update Room'}
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