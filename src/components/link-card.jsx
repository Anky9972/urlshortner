import { useState } from 'react';
import { Copy, Download, LinkIcon, Trash, Edit, ExternalLink, Check, MousePointerClick, AlertTriangle, CheckCircle, Calendar, Globe } from 'lucide-react';

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 'trimlynk.com';
const APP_URL = import.meta.env.VITE_APP_URL || 'https://trimlynk.com';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CardTitle } from './ui/card';
import Modal from './modal';
import ShareButtons from './share-buttons';
import { BeatLoader } from 'react-spinners';
import useFetch from '../hooks/use-fetch';
import { deleteUrl, updateUrl } from '../api/urls';
import PropTypes from 'prop-types';

const LinkCard = ({ url, fetchUrls }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editFormValues, setEditFormValues] = useState({
    title: url?.title,
    originalUrl: url?.originalUrl,
    customUrl: url?.customUrl || '',
    expiresAt: url?.expiresAt || '',
  });

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${APP_URL}/${url?.short_url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => setShowEditModal(true);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditFormValues({
      title: url?.title,
      originalUrl: url?.originalUrl,
      customUrl: url?.customUrl || '',
      expiresAt: url?.expiresAt || '',
    });
  };

  const handleChange = (e) => {
    setEditFormValues({ ...editFormValues, [e.target.id]: e.target.value });
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
    anchor.href = url?.qrCode;
    anchor.download = url?.title;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const shortLink = url?.customUrl || url?.shortUrl;
  const clickCount = url?.currentClicks || url?._count?.clicks || 0;
  const isHealthy = url?.healthChecks?.[0]?.isHealthy !== false;
  const createdDate = url?.createdAt ? new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="group relative rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] hover:border-[hsl(230,10%,22%)] transition-all duration-300 overflow-hidden">
      {/* Top accent line on hover */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 flex gap-5">
        {/* QR Code */}
        <div className="hidden sm:flex flex-shrink-0">
          <div className="w-[72px] h-[72px] rounded-xl bg-white p-1.5 shadow-sm">
            <img src={url?.qrCode} width="60" height="60" loading="lazy" className="w-full h-full object-contain rounded-md" alt="QR code" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link to={`/link/${url?.id}`} className="block group/link">
            {/* Title */}
            <h3 className="text-[15px] font-semibold text-white group-hover/link:text-blue-400 transition-colors truncate">
              {url?.title}
            </h3>

            {/* Short URL */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-blue-400 text-sm font-mono truncate hover:underline">
                {APP_DOMAIN}/{shortLink}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </div>

            {/* Original URL */}
            <div className="flex items-center gap-2 mt-2 text-slate-500">
              <LinkIcon className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate max-w-[400px]">{url?.originalUrl}</span>
            </div>
          </Link>

          {/* Meta & Actions */}
          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[hsl(230,10%,13%)]">
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {createdDate}
              </span>
              <span className="flex items-center gap-1.5">
                <MousePointerClick className="w-3 h-3" />
                <span className="text-white font-medium">{clickCount}</span> clicks
              </span>
              <span className={`flex items-center gap-1.5 ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {isHealthy ? 'Healthy' : 'Broken'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ShareButtons shortUrl={`${APP_URL}/${shortLink}`} />

              <button onClick={handleCopy} aria-label={copied ? 'Copied' : 'Copy link'} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button onClick={downloadImage} aria-label="Download QR code" className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleEdit} aria-label="Edit link" className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fnDelete().then(() => fetchUrls())}
                disabled={loadingDelete}
                aria-label="Delete link"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                {loadingDelete ? <BeatLoader size={3} color="white" /> : <Trash className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal}>
        <div className="p-6 bg-[hsl(230,12%,9%)] rounded-2xl border border-[hsl(230,10%,15%)] max-w-md mx-auto shadow-2xl">
          {/* Top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <CardTitle className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-400" />
            Edit Link
          </CardTitle>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium">Title</label>
              <Input
                id="title"
                placeholder="Link's Title"
                value={editFormValues.title}
                onChange={handleChange}
                className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium">Original URL</label>
              <Input
                id="originalUrl"
                placeholder="Enter your Long URL"
                value={editFormValues.originalUrl}
                onChange={handleChange}
                className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium">Custom URL <span className="text-slate-600">(optional)</span></label>
              <Input
                id="customUrl"
                placeholder="Custom Link"
                value={editFormValues.customUrl}
                onChange={handleChange}
                className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-400 font-medium">Expiration Date</label>
              <Input
                type="datetime-local"
                id="expiresAt"
                value={editFormValues.expiresAt}
                onChange={handleChange}
                className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white focus:border-blue-500/50"
              />
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-[hsl(230,10%,15%)]">
              <Button onClick={handleUpdate} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-10">
                Save Changes
              </Button>
              <Button onClick={handleCloseEditModal} variant="outline" className="flex-1 border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)] rounded-xl h-10">
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
    originalUrl: PropTypes.string,
    customUrl: PropTypes.string,
    expiresAt: PropTypes.string,
    shortUrl: PropTypes.string,
    qrCode: PropTypes.string,
    createdAt: PropTypes.string,
    currentClicks: PropTypes.number,
    _count: PropTypes.shape({ clicks: PropTypes.number }),
    healthChecks: PropTypes.array,
  }).isRequired,
  fetchUrls: PropTypes.func.isRequired,
};

export default LinkCard;
