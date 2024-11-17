import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

const QRCodeTypeSelector = ({ qrType, setQRType }) => {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder="Select QR Code Type"
          value={qrType}
          onChange={(e) => setQRType(e.target.value)}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="url">URL</SelectItem>
        <SelectItem value="text">Text</SelectItem>
        <SelectItem value="email">Email</SelectItem>
        <SelectItem value="phone">Phone Number</SelectItem>
        <SelectItem value="sms">SMS</SelectItem>
        <SelectItem value="location">Location</SelectItem>
        <SelectItem value="facebook">Facebook</SelectItem>
        <SelectItem value="twitter">Twitter</SelectItem>
        <SelectItem value="wifi">WiFi</SelectItem>
        <SelectItem value="event">Event</SelectItem>
        <SelectItem value="mp3">MP3</SelectItem>
        <SelectItem value="pdf">PDF</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default QRCodeTypeSelector;
