import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Edit2, Trash2, 
  Copy, ExternalLink, Share2
} from 'lucide-react';
import  supabase  from '@/db/supabase';
import { IoClose } from 'react-icons/io5';

const RoomDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [activeLinkId, setActiveLinkId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [linkData, setLinkData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    isPublic: true
  });

  useEffect(() => {
    fetchRoomDetails();
  }, [slug]);

  const fetchRoomDetails = async () => {
    try {
      setIsLoading(true);
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('slug', slug)
        .single();

      if (roomError) throw roomError;

      // Increment view count
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ views: (roomData.views || 0) + 1 })
        .eq('slug', slug);

      if (updateError) throw updateError;

      setRoom(roomData);
      setLinks(roomData.links || []);
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!linkData.title.trim() || !linkData.url.trim()) {
        // Could use a toast notification here
        alert('Title and URL are required');
        return;
      }
    
      // URL validation
      try {
        new URL(linkData.url);
      } catch {
        alert('Please enter a valid URL');
        return;
      }
      setIsSubmitting(true);
    try {

      const newLink = {
        id: Date.now().toString(),
        ...linkData,
        createdAt: new Date().toISOString()
      };

      const updatedLinks = [...links, newLink];

      const { error } = await supabase
        .from('rooms')
        .update({ links: updatedLinks })
        .eq('slug', slug);

      if (error) throw error;

      setLinks(updatedLinks);
      setLinkData({
        title: '',
        url: '',
        description: '',
        category: '',
        isPublic: true
      });
      setShowAddLinkModal(false);
    } catch (error) {
      console.error('Error adding link:', error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLink = async () => {
    try {
      const updatedLinks = links.map(link => 
        link.id === activeLinkId ? { ...link, ...linkData } : link
      );

      const { error } = await supabase
        .from('rooms')
        .update({ links: updatedLinks })
        .eq('slug', slug);

      if (error) throw error;

      setLinks(updatedLinks);
      setShowEditLinkModal(false);
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      const updatedLinks = links.filter(link => link.id !== linkId);

      const { error } = await supabase
        .from('rooms')
        .update({ links: updatedLinks })
        .eq('slug', slug);

      if (error) throw error;

      setLinks(updatedLinks);
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const copyRoomLink = () => {
    const roomUrl = `${window.location.origin}/room/${slug}`;
    navigator.clipboard.writeText(roomUrl);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading room details...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">{room.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{links.length} links</span>
                  <span>{room.views || 0} views</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomLink}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <Share2 size={18} />
                Share
              </button>
              <button
                onClick={() => setShowAddLinkModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Room Info */}
        <div className="border rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">About this Room</h2>
          <p className="text-gray-600">{room.profile.bio || 'No description provided'}</p>
        </div>

        {/* Links Section */}
        <div className="border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Links</h2>
          
          {links.length === 0 ? (
            <div className="text-center py-8 text-blue-500 cursor-pointer" onClick={() => setShowAddLinkModal(true)} >
              No links added yet. Click to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {links.map(link => (
                <div 
                  key={link.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{link.title}</h3>
                      {link.category && (
                        <span className="px-2 py-1 text-xs bg-gray-900 border rounded-full">
                          {link.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {link.description}
                    </p>
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(link.url);
                      }}
                      className="p-2 rounded-full"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setActiveLinkId(link.id);
                        setLinkData(link);
                        setShowEditLinkModal(true);
                      }}
                      className="p-2 rounded-full"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 rounded-full text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Link Modal */}
      {(showAddLinkModal || showEditLinkModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="border rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {showAddLinkModal ? 'Add New Link' : 'Edit Link'}
              </h2>
              <button
                onClick={() => {
                  setShowAddLinkModal(false);
                  setShowEditLinkModal(false);
                  setLinkData({
                    title: '',
                    url: '',
                    description: '',
                    category: '',
                    isPublic: true
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <IoClose size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={linkData.title}
                  onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
                  placeholder="Enter link title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
                  placeholder="Enter URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={linkData.description}
                  onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
                  placeholder="Enter link description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={linkData.category}
                  onChange={(e) => setLinkData({ ...linkData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-900"
                  placeholder="Enter category"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={linkData.isPublic}
                  onChange={(e) => setLinkData({ ...linkData, isPublic: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isPublic" className="text-sm">Make this link public</label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddLinkModal(false);
                    setShowEditLinkModal(false);
                    setLinkData({
                      title: '',
                      url: '',
                      description: '',
                      category: '',
                      isPublic: true
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={showAddLinkModal ? handleAddLink : handleEditLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {showAddLinkModal ? 'Add Link' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;