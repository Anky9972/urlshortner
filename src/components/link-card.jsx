import { useState } from 'react';
import { Copy, Download, LinkIcon, Trash, Edit, ExternalLink, Check, MousePointerClick, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [editFormValues, setEditFormValues] = useState({
    title: url?.title,
    original_url: url?.original_url,
    custom_url: url?.custom_url || '',
    expiration_date: url?.expiration_date || '',
  });

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `https://trimlynk.com/${url?.short_url}`
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

  const shortLink = url?.custom_url || url?.short_url;

  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all duration-200">
      <div className="flex gap-4">
        {/* QR Code */}
        <div className="hidden sm:block flex-shrink-0">
          <img
            src={url?.qr}
            className="h-20 w-20 object-contain rounded-lg bg-white p-1"
            alt="QR code"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link to={`/link/${url?.id}`} className="block group/link">
            {/* Title */}
            <h3 className="text-lg font-semibold text-white group-hover/link:text-cyan-400 transition-colors truncate">
              {url?.title}
            </h3>

            {/* Short URL */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-cyan-400 text-sm font-mono truncate">
                trimlynk.com/{shortLink}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
            </div>

            {/* Original URL */}
            <div className="flex items-center gap-2 mt-2 text-zinc-500">
              <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs truncate">{url?.original_url}</span>
            </div>
          </Link>

          {/* Meta & Actions Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>{new Date(url?.created_at).toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>{url?.clicks || 0} clicks</span>
              </div>
              <div className={`flex items-center gap-1 ${url?.healthChecks?.[0]?.isHealthy === false ? 'text-red-400' : 'text-emerald-400'}`}>
                {url?.healthChecks?.[0]?.isHealthy === false ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Broken</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Healthy</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <ShareButtons shortUrl={`https://trimlynk.com/${shortLink}`} />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-violet-400 hover:bg-zinc-800"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800"
              >
                <Edit className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => fnDelete().then(() => fetchUrls())}
                disabled={loadingDelete}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
              >
                {loadingDelete ? (
                  <BeatLoader size={4} color="white" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal}>
        <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 max-w-md mx-auto">
          <CardTitle className="text-xl font-semibold mb-6 text-white">
            Edit Link
          </CardTitle>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Title</label>
              <Input
                id="title"
                placeholder="Link's Title"
                value={editFormValues.title}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Original URL</label>
              <Input
                id="original_url"
                placeholder="Enter your Long URL"
                value={editFormValues.original_url}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Custom URL (optional)</label>
              <Input
                id="custom_url"
                placeholder="Custom Link"
                value={editFormValues.custom_url}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Expiration Date</label>
              <Input
                type="datetime-local"
                id="expiration_date"
                value={editFormValues.expiration_date}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-cyan-500/50"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdate}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-900"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCloseEditModal}
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
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
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    title: PropTypes.string,
    original_url: PropTypes.string,
    custom_url: PropTypes.string,
    expiration_date: PropTypes.string,
    short_url: PropTypes.string,
    qr: PropTypes.string,
    created_at: PropTypes.string,
    clicks: PropTypes.number,
    healthChecks: PropTypes.array,
  }).isRequired,
  fetchUrls: PropTypes.func.isRequired,
};

export default LinkCard;