import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit2, Trash2,
  Copy, ExternalLink, Share2, Link2
} from 'lucide-react';
import supabase from '@/db/supabase';
import { IoClose } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      alert('Title and URL are required');
      return;
    }

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
    } finally {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading room...</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Room not found</h2>
          <Button onClick={() => navigate('/rooms')} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900">
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">{room.title}</h1>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <span>{links.length} links</span>
                  <span>{room.views || 0} views</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={copyRoomLink}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setShowAddLinkModal(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900"
              >
                <Plus size={16} className="mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Room Info */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-4">
            <h2 className="text-sm font-medium text-zinc-300 mb-1">About</h2>
            <p className="text-zinc-500 text-sm">{room.profile?.bio || 'No description provided'}</p>
          </CardContent>
        </Card>

        {/* Links */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div
                className="text-center py-8 cursor-pointer hover:bg-zinc-800/50 rounded-lg transition-colors"
                onClick={() => setShowAddLinkModal(true)}
              >
                <Link2 className="w-10 h-10 mx-auto text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">No links yet. Click to add one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map(link => (
                  <div
                    key={link.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white text-sm truncate">{link.title}</h3>
                        {link.category && (
                          <span className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded-full">
                            {link.category}
                          </span>
                        )}
                      </div>
                      {link.description && (
                        <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{link.description}</p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        {link.url}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigator.clipboard.writeText(link.url)}
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveLinkId(link.id);
                          setLinkData(link);
                          setShowEditLinkModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {(showAddLinkModal || showEditLinkModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
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
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                <Input
                  value={linkData.title}
                  onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Enter link title"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">URL</label>
                <Input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Description</label>
                <textarea
                  value={linkData.description}
                  onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Category</label>
                <Input
                  value={linkData.category}
                  onChange={(e) => setLinkData({ ...linkData, category: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Optional category"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={linkData.isPublic}
                  onChange={(e) => setLinkData({ ...linkData, isPublic: e.target.checked })}
                  className="rounded border-zinc-600 bg-zinc-800 text-cyan-500"
                />
                <label htmlFor="isPublic" className="text-sm text-zinc-400">Make public</label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
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
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={showAddLinkModal ? handleAddLink : handleEditLink}
                  disabled={isSubmitting}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-900"
                >
                  {isSubmitting ? 'Saving...' : showAddLinkModal ? 'Add Link' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;