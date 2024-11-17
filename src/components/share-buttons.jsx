import React from "react";
import { trackLinkClick } from "./analytics";
import { FaFacebook, FaShare, FaTelegram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { IoShareSocial } from "react-icons/io5";
const ShareButtons = ({ shortUrl }) => {
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  if (!isValidUrl(shortUrl)) {
    return <p>Invalid URL</p>;
  }

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shortUrl
  )}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shortUrl
  )}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    shortUrl
  )}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shortUrl
  )}`;

  const handleFacebookShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(facebookShareUrl, "_blank");
  };

  const handleTwitterShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(twitterShareUrl, "_blank");
  };

  const handleWhatsAppShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(whatsappShareUrl, "_blank");
  };

  const handleTelegramShare = () => {
    trackLinkClick(shortUrl); // Track click event
    window.open(telegramShareUrl, "_blank");
  };

  return (
    <div className="flex gap-5">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger><IoShareSocial className="text-xl"/></MenubarTrigger>
          <MenubarContent>
            <h1 className="h-10 flex justify-center items-center font-bold text-lg">Share Link</h1>
            <MenubarSeparator />
            <MenubarItem>
              <button onClick={handleFacebookShare} className="flex justify-center gap-2 items-center ">
                <FaFacebook className="text-2xl"/>
                <span>Facebook</span>
              </button>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              {" "}
              <button onClick={handleTwitterShare} className="flex justify-center gap-2 items-center ">
                <FaTwitter className="text-2xl"/>
                <span>Twitter</span>
              </button>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              {" "}
              <button onClick={handleWhatsAppShare} className="flex justify-center gap-2 items-center ">
                <FaWhatsapp className="text-2xl"/>
                <span>Whatsapp</span>
              </button>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              {" "}
              <button onClick={handleTelegramShare} className="flex justify-center gap-2 items-center ">
                <FaTelegram className="text-2xl"/>
                <span>Telegram</span>
              </button>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};

export default ShareButtons;
