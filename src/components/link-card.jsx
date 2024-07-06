import React, { useState } from 'react';
import { Copy, Download, LinkIcon, Trash, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import useFetch from '../hooks/use-fetch';
import { deleteUrl, updateUrl } from '../db/apiUrls'; // Update path based on your project structure
import { BeatLoader } from 'react-spinners';
import { Input } from './ui/input';
import { Card, CardTitle } from './ui/card';
import Modal from './modal';
import ShareButtons from './share-buttons';
import { trackLinkClick } from './analytics'; // Import GA tracking function

const LinkCard = ({ url = [], fetchUrls }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormValues, setEditFormValues] = useState({
    title: url?.title,
    original_url: url?.original_url,
    custom_url: url?.custom_url || '',
    expiration_date: url?.expiration_date || '',
  });

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, url.id);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    // Reset edit form values if needed
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
      fetchUrls(); // Refresh the list after update
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating URL:', error.message);
      // Handle error state if needed
    }
  };

  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title; // Desired file name for the downloaded image

    // Create an anchor element
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = fileName;

    // Append the anchor to the body
    document.body.appendChild(anchor);

    // Trigger the download by simulating a click event
    anchor.click();

    // Remove the anchor from the document
    document.body.removeChild(anchor);
  };

  return (
    <div className="flex flex-col md:flex-row gap-5 border p-4 bg-gray-900 rounded-lg">
      <img
        src={url?.qr}
        className="h-32 object-contain ring ring-blue-500 self-start"
        alt="qr code"
      />
      <Link to={`/link/${url?.id}`} className="flex flex-col flex-1">
        <span className="text-3xl font-extrabold hover:underline cursor-pointer">
          {url?.title}
        </span>
        <span className="text-2xl text-blue-400 font-bold hover:underline cursor-pointer">
          http://localhost:5173/
          {url?.custom_url ? url?.custom_url : url.short_url}
        </span>
        <span className="flex items-center gap-1 hover:underline cursor-pointer">
          <LinkIcon className="p-1" />
          <p className=" overflow-x-scroll lg:overflow-auto">
            {url?.original_url}
          </p>
        </span>
        <span className="flex items-end font-extralight text-sm flex-1">
          {new Date(url?.created_at).toLocaleString()}
        </span>
      </Link>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={() =>
            navigator.clipboard.writeText(
              `http://localhost:5173/${url?.short_url}`
            )
          }
        >
          <Copy />
        </Button>
        <Button variant="ghost" onClick={downloadImage}>
          <Download />
        </Button>
        <Button
          variant="ghost"
          onClick={() => fnDelete().then(() => fetchUrls())}
          disable={loadingDelete}
        >
          {loadingDelete ? <BeatLoader size={5} color="white" /> : <Trash />}
        </Button>
        <Button variant="ghost" onClick={handleEdit}>
          <Edit />
        </Button>
      </div>
      {/* Edit Modal */}
      <Modal isOpen={showEditModal}>
        <div className="p-4 flex flex-col gap-5">
          <CardTitle className="text-xl font-bold mb-4 m-auto">
            Edit Link
          </CardTitle>
          <Input
            id="title"
            placeholder="Link's Title"
            value={editFormValues.title}
            onChange={handleChange}
          />
          <Input
            id="original_url"
            placeholder="Enter your Long URL"
            value={editFormValues.original_url}
            onChange={handleChange}
          />
          <Input
            id="custom_url"
            placeholder="Custom Link (optional)"
            value={editFormValues.custom_url}
            onChange={handleChange}
          />
          <Input
            type="datetime-local"
            id="expiration_date"
            value={editFormValues.expiration_date}
            onChange={handleChange}
          />
          <Button onClick={handleUpdate}>Update</Button>
          <Button onClick={handleCloseEditModal} variant="destructive">
            Close
          </Button>
        </div>
      </Modal>

      {/* Share Buttons */}
      <ShareButtons shortUrl={`http://localhost:5173/${url?.short_url}`} />
    </div>
  );
};

export default LinkCard;
