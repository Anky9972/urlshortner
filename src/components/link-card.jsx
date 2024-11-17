import { useState } from 'react';
import { Copy, Download, LinkIcon, Trash, Edit, ExternalLink, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CardTitle } from './ui/card';
import Modal from './modal';
import ShareButtons from './share-buttons';
import { BeatLoader } from 'react-spinners';
import useFetch from '../hooks/use-fetch';
import { deleteUrl, updateUrl } from '../db/apiUrls';
import PropTypes from 'prop-types';

const LinkCard = ({ url, fetchUrls }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editFormValues, setEditFormValues] = useState({
    title: url?.title,
    original_url: url?.original_url,
    custom_url: url?.custom_url || '',
    expiration_date: url?.expiration_date || '',
  });

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `https://trimlink.netlify.app/${url?.short_url}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => setShowEditModal(true);
  
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditFormValues({
      title: url?.title,
      original_url: url?.original_url,
      custom_url: url?.custom_url || '',
      expiration_date: url?.expiration_date || '',
    });
  };

  const handleChange = (e) => {
    setEditFormValues({
      ...editFormValues,
      [e.target.id]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateUrl(url.id, editFormValues);
      fetchUrls();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating URL:', error.message);
    }
  };

  const downloadImage = () => {
    const anchor = document.createElement('a');
    anchor.href = url?.qr;
    anchor.download = url?.title;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div
      className="group relative overflow-hidden transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col md:flex-row gap-5 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700/50 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        <div className="relative">
          <img
            src={url?.qr}
            className="h-32 w-32 object-contain rounded-lg ring-2 ring-blue-500/50 transition-all duration-300 hover:ring-blue-500"
            alt="qr code"
          />
        </div>

        <Link 
          to={`/link/${url?.id}`} 
          className="flex flex-col flex-1 gap-3 transition-transform duration-300 hover:translate-x-2"
        >
          <h3 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {url?.title}
          </h3>
          
          <div className="flex items-center gap-2 text-2xl text-blue-400 font-bold overflow-hidden">
            <span className="truncate hover:text-blue-300 transition-colors">
              https://trimlink.netlify.app/{url?.custom_url || url.short_url}
            </span>
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
          </div>
          
          <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <LinkIcon className="w-4 h-4 flex-shrink-0" />
            <p className="truncate">{url?.original_url}</p>
          </div>
          
          <span className="text-sm text-gray-400 mt-auto">
            Created: {new Date(url?.created_at).toLocaleString()}
          </span>
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 mb-2">
            <ShareButtons shortUrl={`https://trimlink.netlify.app/${url?.short_url}`} />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={handleCopy}
              className="w-full transition-all duration-300 hover:bg-blue-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              onClick={downloadImage}
              className="w-full transition-all duration-300 hover:bg-purple-500/20"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleEdit}
              className="w-full transition-all duration-300 hover:bg-green-500/20"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => fnDelete().then(() => fetchUrls())}
              disabled={loadingDelete}
              className="w-full transition-all duration-300 hover:bg-red-500/20"
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showEditModal}>
        <div className="p-6 bg-gray-900 rounded-xl">
          <CardTitle className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Edit Link
          </CardTitle>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Title</label>
              <Input
                id="title"
                placeholder="Link's Title"
                value={editFormValues.title}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Original URL</label>
              <Input
                id="original_url"
                placeholder="Enter your Long URL"
                value={editFormValues.original_url}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Custom URL (optional)</label>
              <Input
                id="custom_url"
                placeholder="Custom Link"
                value={editFormValues.custom_url}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Expiration Date</label>
              <Input
                type="datetime-local"
                id="expiration_date"
                value={editFormValues.expiration_date}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdate}
                className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                Update
              </Button>
              <Button
                onClick={handleCloseEditModal}
                variant="destructive"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

LinkCard.propTypes = {
  url: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    original_url: PropTypes.string,
    custom_url: PropTypes.string,
    expiration_date: PropTypes.string,
    short_url: PropTypes.string,
    qr: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  fetchUrls: PropTypes.func.isRequired,
};

export default LinkCard;