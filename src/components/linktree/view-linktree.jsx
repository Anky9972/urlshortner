import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../db/supabase";
import Preview from "./preview";
import { Loader2, Link2 } from "lucide-react";

const ViewLinkTree = () => {
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-6 rounded-xl bg-zinc-900 border border-zinc-800 max-w-md">
          <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Error</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile || !links) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center p-6 rounded-xl bg-zinc-900 border border-zinc-800 max-w-md">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Not Found</h2>
          <p className="text-zinc-400 text-sm">This LinkTree doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center p-4">
      <div className="w-full max-w-md">
        <Preview profile={profile} links={links} treeId={id} />
      </div>
    </div>
  );
};

export default ViewLinkTree;