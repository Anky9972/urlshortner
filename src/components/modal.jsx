import React from "react";
import { Card } from "./ui/card";

const Modal = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className=" rounded-lg max-w-md w-full">
        <div className="mt-4">{children}</div>
      </Card>
    </div>
  );
};

export default Modal;
