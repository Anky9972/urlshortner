import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../db/supabase";
import Preview from "./preview";

const SharedLinkTree = () => {
  const { id } = useParams(); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState(null);

  useEffect(() => {
    const loadSharedLinkTree = async () => {
      try {
        setIsLoading(true);
        const { data: linkTree, error } = await supabase
          .from("linktrees")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (linkTree) {
          setProfile(linkTree.profile);
          setLinks(linkTree.links);
        } else {
          setError("LinkTree not found");
        }
      } catch (error) {
        console.error("Error loading shared LinkTree:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedLinkTree();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Error: {error}</h2>
        </div>
      </div>
    );
  }

  if (!profile || !links) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">LinkTree not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center p-4">
      <div className="w-full max-w-md">
        <Preview profile={profile} links={links} />
      </div>
    </div>
  );
};

export default SharedLinkTree;