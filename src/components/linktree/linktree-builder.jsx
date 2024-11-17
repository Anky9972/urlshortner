import { useEffect, useState } from "react";
import supabase from "../../db/supabase";
import Sidebar from "./sidebar";
import Preview from "./preview";
import { useNavigate } from "react-router-dom";

const LinkTreeBuilder = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("links");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [linkTreeId, setLinkTreeId] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "Your Name",
    bio: "Your Bio ✨",
    theme: "default",
    customColors: {
      background: "#1a1a1a",
      text: "#ffffff",
      button: "#ffffff20",
    },
  });

  const [links, setLinks] = useState([
    {
      id: "1",
      title: "Portfolio Website",
      url: "https://example.com",
      icon: "website",
      isActive: true,
    },
  ]);

  useEffect(() => {
    const loadUserAndLinkTree = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user?.id) {
          throw new Error('No authenticated user');
        }

        setUserId(session.user.id);

        const { data: linkTree, error: linkTreeError } = await supabase
          .from("linktrees")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (linkTreeError) {
          if (linkTreeError.code === 'PGRST116') {
            return;
          }
          throw linkTreeError;
        }

        if (linkTree) {
          setLinkTreeId(linkTree.id);
          setProfile(linkTree.profile || profile);
          setLinks(linkTree.links || links);
        }
      } catch (error) {
        console.error("Error loading user or LinkTree:", error);
        if (error.message === 'No authenticated user') {
          // Redirect to login or show auth message
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndLinkTree();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserId(null);
        setLinkTreeId(null);
        // Reset to default states
        setProfile({
          name: "Your Name",
          bio: "Your Bio ✨",
          theme: "default",
          customColors: {
            background: "#1a1a1a",
            text: "#ffffff",
            button: "#ffffff20",
          },
        });
        setLinks([
          {
            id: "1",
            title: "Portfolio Website",
            url: "https://example.com",
            icon: "website",
            isActive: true,
          },
        ]);
      } else if (event === 'SIGNED_IN') {
        if (session?.user?.id) {
          setUserId(session.user.id);
          loadUserAndLinkTree();
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, saveError]);

  const saveLinkTree = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    if (!userId) {
      setSaveError('Please sign in to save your LinkTree');
      setIsSaving(false);
      return;
    }

    const linkTreeData = {
      profile,
      links,
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    try {
      let response;

      if (linkTreeId) {
        response = await supabase
          .from("linktrees")
          .update(linkTreeData)
          .eq("id", linkTreeId)
          .eq("user_id", userId)
          .select()
          .single();
      } else {
        response = await supabase
          .from("linktrees")
          .insert(linkTreeData)
          .select()
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      if (response.data) {
        setLinkTreeId(response.data.id);
        setSaveSuccess(true);
      } else {
        throw new Error("No data returned from save operation");
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please sign in to create your LinkTree</h2>
          <button className="p-2 rounded-md border text-gray-300 bg-gray-900 " onClick={()=>navigate("/auth")}>Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <main className="w-full flex gap-5 p-2 h-full">
        <Sidebar
          profile={profile}
          setProfile={setProfile}
          links={links}
          setLinks={setLinks}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          saveLinkTree={saveLinkTree}
          saveError={saveError}
          saveSuccess={saveSuccess}
          isSaving={isSaving}
          linkTreeId={linkTreeId}
          setLinkTreeId={setLinkTreeId}
          userId={userId}
        />
        <Preview 
          profile={profile} 
          links={links} 
        />
      </main>
    </div>
  );
};

export default LinkTreeBuilder;