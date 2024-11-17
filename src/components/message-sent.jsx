import React from "react";
import img from '../assets/thumb-up.jpg'
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
const MessageSent = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-screen flex justify-center items-start lg:items-center">
      <Card className="flex flex-col justify-center items-center gap-10 py-5">
        <CardHeader className="flex flex-col justify-center items-center gap-5">
          <div className="w-36 h-36 bg-white rounded-full shadow-lg flex justify-center items-center overflow-hidden">
            <img src={img} alt="success" className="object-contain w-full" />
          </div>
          <CardTitle>Message sent!</CardTitle>
          <CardDescription>
            Thank you for getting in touch! We'll respond to your inquiry as
            soon as possible.
          </CardDescription>
        </CardHeader>
        <Button onClick={()=>{navigate("/")}}>Close</Button>
      </Card>

      {/* </div> */}
    </div>
  );
};

export default MessageSent;
