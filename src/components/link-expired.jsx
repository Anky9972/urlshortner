import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import  img from '@/assets/file.png'
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";


const LinkExpired = () => {
    const navigate = useNavigate();
  return (
    <div className="w-full mt-10 lg:mt-0 h-full flex justify-center items-center">
      <Card className=" lg:w-1/3 flex flex-col justify-center items-center">
        <img src={img} alt="link-expired"  className=""/>
        <CardHeader>
          <CardTitle className="text-center">Sorry, <br />Link has expired</CardTitle>
        </CardHeader>
        
        <CardFooter>
          <Button onClick={()=>navigate("/")}>Go Back</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LinkExpired;
