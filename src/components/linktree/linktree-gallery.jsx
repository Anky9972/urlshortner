import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Link as LinkIcon,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Archive,
  ArchiveRestore,
  Activity,
  MousePointerClick
} from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import supabase from "../../db/supabase";
import ShareDialog from "./share-dialog";
import { trackViewTree } from "../analytics";
import { formatDistanceToNow } from "date-fns";

// Skeleton Loader Component
const LinkTreeSkeleton = () => {
  return (
    <Card className="animate-pulse bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="h-6 bg-zinc-800 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
        <div className="flex gap-4">
          <div className="h-8 bg-zinc-800 rounded w-20"></div>
          <div className="h-8 bg-zinc-800 rounded w-20"></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-6 border-t border-zinc-800">
        <div className="flex gap-2 w-full">
          <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
          <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
        </div>
      </CardFooter>
    </Card>
  );
};

const LinkTreeGallery = ({
  // isLoading = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastUpdated");
  const [filterStatus, setFilterStatus] = useState("all");
  // const [userId, setUserId] = useState(null);
  const [linkTree, setLinkTree] = useState([]);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    linkTreeId: null
  });
  const navigate = useNavigate();

  // Load user and link trees on component mount
  useEffect(() => {
    const loadUserAndLinkTree = async () => {
      try {
        setIsLoadingState(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user?.id) {
          throw new Error("No authenticated user");
        }

        // setUserId(session.user.id);

        const { data: linkTreeData, error: linkTreeError } = await supabase
          .from("linktrees")
          .select("*")
          .eq("user_id", session.user.id);

        if (linkTreeError && linkTreeError.code !== "PGRST116") {
          throw linkTreeError;
        }

        if (linkTreeData) {
          // Simulate a loading delay for smoother experience
          await new Promise(resolve => setTimeout(resolve, 500));
          setLinkTree(linkTreeData);
        }
      } catch (error) {
        console.error("Error loading user or LinkTree:", error);
        if (error.message === "No authenticated user") {
          navigate("/auth"); // Redirect to login if no user
        }
      } finally {
        setIsLoadingState(false);
      }
    };

    loadUserAndLinkTree();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          // setUserId(null);
          setLinkTree([]);
        } else if (event === "SIGNED_IN") {
          if (session?.user?.id) {
            // setUserId(session.user.id);
            loadUserAndLinkTree();
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Delete Link Tree
  const deleteLinkTree = async () => {
    const linkTreeId = deleteConfirmation.linkTreeId;

    if (!linkTreeId) return;

    try {
      setIsLoadingState(true);

      const { error } = await supabase
        .from('linktrees')
        .delete()
        .eq('id', linkTreeId);

      if (error) {
        throw error;
      }

      setLinkTree(prevLinkTrees =>
        prevLinkTrees.filter(tree => tree.id !== linkTreeId)
      );

      setDeleteConfirmation({ isOpen: false, linkTreeId: null });

    } catch (error) {
      console.error("Error deleting Link Tree:", error);
    } finally {
      setIsLoadingState(false);
    }
  };

  // Open delete confirmation
  const openDeleteConfirmation = (linkTreeId) => {
    setDeleteConfirmation({
      isOpen: true,
      linkTreeId: linkTreeId
    });
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      linkTreeId: null
    });
  };

  // Filtering and sorting link trees
  const filteredAndSortedTrees = useMemo(() => {
    return linkTree
      .filter((tree) => {
        const matchesSearch =
          tree.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tree.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
          (filterStatus === 'active' && tree.is_active) ||
          (filterStatus === 'archived' && !tree.is_active);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "views":
            return (b.views || 0) - (a.views || 0);
          case "links":
            return b.links?.length - a.links?.length;
          case "lastUpdated":
          default:
            return new Date(b.updated_at) - new Date(a.updated_at);
        }
      });
  }, [linkTree, searchQuery, sortBy, filterStatus]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Error handling
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center"
      >
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <CardTitle className="text-red-400 mb-4">
            Error Loading LinkTrees
          </CardTitle>
          <p className="text-zinc-400">{error}</p>
          <Button className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-900" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </motion.div>
    );
  }

  const handleArchive = async (linkTreeId) => {

    try {
      setIsLoadingState(true);

      const { error } = await supabase
        .from('linktrees')
        .update({ is_active: linkTree.find(tree => tree.id === linkTreeId).is_active ? false : true })
        .eq('id', linkTreeId);

      if (error) {
        throw error;
      }

      setLinkTree(prevLinkTrees =>
        prevLinkTrees.map(tree => {
          if (tree.id === linkTreeId) {
            return {
              ...tree,
              is_active: false
            };
          }
          return tree;
        })
      );

    }
    catch (error) {
      console.error("Error archiving Link Tree:", error);
    } finally {
      setIsLoadingState(false);
    }
  };

  const getTotalClicksForTree = (treeId) => {
    const tree = linkTree.find((tree) => tree.id === treeId);

    if (!tree) {
      console.error(`Tree with ID ${treeId} not found.`);
      return 0;
    }
    return tree.links.reduce((totalClicks, link) => {
      return totalClicks + (link.clicks || 0); // Add clicks, default to 0 if undefined
    }, 0);
  };

  const handleTreeView = async (treeId) => {
    trackViewTree(treeId);
    navigate(`/view/${treeId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString); // Convert the string to a Date object
    return date.toLocaleString(); // Format the date to a more readable format
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true }); // Adds 'ago' suffix
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My LinkTrees</h1>
            <p className="text-zinc-500">
              Manage and organize your link collections
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/link-tree")}
            disabled={isLoadingState}
            className="flex items-center gap-2"
          >
            {isLoadingState && <Loader2 className="animate-spin w-4 h-4" />}
            Create New LinkTree
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search LinkTrees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg"
            >
              <option value="lastUpdated">Sort by Last Updated</option>
              <option value="views">Sort by Views</option>
              <option value="links">Sort by Links</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* LinkTrees */}
        {isLoadingState ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((_, index) => (
              <LinkTreeSkeleton key={index} />
            ))}
          </motion.div>
        ) : filteredAndSortedTrees.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-zinc-500 py-12"
          >
            <p>No LinkTrees found. Create your first LinkTree!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {filteredAndSortedTrees.map((tree) => (
                <motion.div
                  key={tree.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card>
                    <CardContent className="p-5" onClick={() => handleTreeView(tree.id)}>
                      <CardTitle className="text-lg font-bold text-white mb-2 flex items-center gap-4">
                        {tree.title}
                        <p className="text-xs text-zinc-500">Last update: {formatTime(tree.updated_at)}</p>
                      </CardTitle>
                      <p className="text-zinc-400 text-sm mb-4">
                        {tree.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <LinkIcon className="mr-2 w-4" />
                          {tree.links?.length || 0} links
                        </Badge>
                        <Badge variant="outline">
                          <Eye className="mr-2 w-4" />
                          {tree.views || 0} views
                        </Badge>
                        <Badge variant="outline">
                          <MousePointerClick className="mr-2 w-4" />
                          {getTotalClicksForTree(tree.id)} clicks
                        </Badge>
                        {!tree.is_active ? (
                          <Badge variant="outline" className="text-yellow-400">
                            Archived
                          </Badge>
                        )
                          :
                          (
                            <Badge variant="outline" className="text-green-400">
                              <Activity className="mr-2 w-4" />
                              Active
                            </Badge>
                          )
                        }
                      </div>
                      <div className="mt-4">
                        <p className="text-zinc-500 text-xs">Created: {formatDate(tree.created_at)}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2 items-center p-4 border-t border-zinc-800">
                      <div className="flex gap-2">
                        <div>
                          <ShareDialog linkTreeId={tree.id} />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 border-zinc-700 text-zinc-300 hover:text-white text-xs"
                          onClick={() => navigate(`/edit/${tree.id}`)}
                        >
                          <Edit2 className="w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteConfirmation(tree.id)}
                          className="flex items-center gap-2 text-xs font-bold"
                        >
                          <Trash2 className="w-3" />
                          Delete
                        </Button>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          onClick={() => handleArchive(tree.id)}
                          className="flex items-center gap-2 text-xs font-bold"
                        >
                          {
                            !isLoadingState && tree.is_active ? <Archive className="w-3" /> : <ArchiveRestore className="w-3" />
                          }
                          {
                            !isLoadingState && tree.is_active ? 'Archive' : 'Restore'
                          }
                          {
                            isLoadingState && <Loader2 className="animate-spin w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
            >
              <h2 className="text-lg font-bold mb-3 text-white">Confirm Deletion</h2>
              <p className="mb-6 text-zinc-400">
                Are you sure you want to delete this Link Tree?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={deleteLinkTree}
                  disabled={isLoadingState}
                  className="flex items-center gap-2"
                >
                  {isLoadingState && <Loader2 className="animate-spin w-4 h-4" />}
                  {isLoadingState ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

LinkTreeGallery.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default LinkTreeGallery;