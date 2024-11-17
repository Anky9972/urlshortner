import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LinkIcon, LogOut } from "lucide-react";
import { UrlState } from "@/context";
import useFetch from "@/hooks/use-fetch";
import { logout } from "@/db/apiAuth";
import { BarLoader } from "react-spinners";

const Header = () => {
  const navigate = useNavigate();
  const {user, fetchUser} = UrlState();

  const {loading,fn:fnLogout} = useFetch(logout);
  return (
    <>
    <nav className="flex justify-between items-center py-4">
      <Link to="/">
        <img src="https://res.cloudinary.com/dj0eulqd8/image/upload/v1719838363/17198382942675tr4l2er_w26wki.jpg" alt="TrimLink" className="w-10" />
      </Link>
      <div>
        {!user ? (
          <Button onClick={() => navigate("/auth")}>Login</Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger  className="w-10 rounded-full overflow-hidden">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.profile_pic} className="object-contain" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{user?.user_metadata?.name}</DropdownMenuItem>
              <DropdownMenuItem>
                <Link to='/dashboard' className="flex justify-center items-center">
                <LinkIcon className="mr-2 h-4 w-4"/>
                <span>My Links</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400">
                <LogOut className="mr-2 h-4 w-4 " />
                <span onClick={()=>{
                  fnLogout().then(()=>{
                    fetchUser();
                    navigate("/");
                  })
                  }}>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
      {loading && <BarLoader size={8} className="mb-4" width={"100%"} color="#36d7b7" /> }
    </>
  );
};

export default Header;
