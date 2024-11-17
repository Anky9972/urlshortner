import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Link as LinkIcon, 
  Share2, 
  Edit2, 
  Trash2,
  Clock,
  Search,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const LinkTreeGallery = ({ 
  linkTrees = [], 
  onEdit, 
  onDelete, 
  onShare, 
  isLoading = false,
  error = null 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastUpdated'); // 'lastUpdated', 'views', 'links'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'draft'
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const getThemeColor = useCallback((theme) => {
    const themes = {
      'gradient-purple': 'from-purple-500 to-pink-500',
      'gradient-blue': 'from-blue-500 to-cyan-500',
      'gradient-green': 'from-green-500 to-emerald-500',
      'gradient-orange': 'from-orange-500 to-red-500',
      'gradient-yellow': 'from-yellow-500 to-orange-500'
    };
    return themes[theme] || 'from-gray-500 to-slate-500';
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', error);
      return 'Invalid date';
    }
  }, []);

  // Filter and sort logic
  const filteredAndSortedTrees = useMemo(() => {
    return linkTrees
      .filter(tree => {
        const matchesSearch = tree.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tree.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || tree.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'views':
            return b.views - a.views;
          case 'links':
            return b.links - a.links;
          case 'lastUpdated':
          default:
            return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
      });
  }, [linkTrees, searchQuery, filterStatus, sortBy]);

  const handleShare = useCallback((treeId) => {
    if (onShare) {
      onShare(treeId);
    } else {
      // Fallback sharing mechanism
      const linkTree = linkTrees.find(tree => tree.id === treeId);
      if (linkTree) {
        navigator.clipboard.writeText(`${window.location.origin}/linktree/${treeId}`)
          .then(() => alert('Link copied to clipboard!'))
          .catch(err => console.error('Failed to copy link:', err));
      }
    }
  }, [linkTrees, onShare]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <Card className="bg-gray-800/50 backdrop-blur border-gray-700 p-6 text-center">
          <CardTitle className="text-red-400 mb-4">Error Loading LinkTrees</CardTitle>
          <p className="text-gray-400">{error}</p>
          <Button 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My LinkTrees</h1>
            <p className="text-gray-400">Manage and organize your link collections</p>
          </div>
          <Button 
            size="lg"
            onClick={()=>navigate('/link-tree')}
            disabled={isLoading}
          >
            Create New LinkTree
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search LinkTrees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800/50 border-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="views">Most Views</option>
              <option value="links">Most Links</option>
            </select>
          </div>
        </div>

        {/* LinkTree Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="h-[400px] bg-gray-800/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTrees.map((tree) => (
                <motion.div
                  key={tree.id}
                  variants={cardVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  exit="exit"
                  layout
                  className="h-full"
                >
                  <Card className="h-full bg-gray-800/50 backdrop-blur border-gray-700 overflow-hidden">
                    <CardHeader className="relative p-0">
                      <div className={`h-48 bg-gradient-to-r ${getThemeColor(tree.theme)} relative`}>
                        <img 
                          src={tree.preview} 
                          alt={tree.title}
                          className="w-full h-full object-cover mix-blend-overlay"
                        />
                        <Badge 
                          className={`absolute top-4 right-4 ${
                            tree.status === 'active' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {tree.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-xl font-bold text-white mb-2">
                        {tree.title}
                      </CardTitle>
                      <p className="text-gray-400 mb-4">{tree.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          <span>{tree.links} links</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{tree.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(tree.lastUpdated)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 border-gray-700 hover:bg-gray-700"
                        onClick={() => onEdit?.(tree.id)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-700 hover:bg-gray-700"
                        onClick={() => handleShare(tree.id)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-gray-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900"
                        onClick={() => onDelete?.(tree.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {!isLoading && filteredAndSortedTrees.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-8 max-w-md mx-auto">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No matching LinkTrees found' : 'No LinkTrees Yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first LinkTree to start sharing your links in style!'}
              </p>
              {!searchQuery && (
                <Button onClick={()=>navigate("/link-tree")}>Create Your First LinkTree</Button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

LinkTreeGallery.propTypes = {
  linkTrees: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
    links: PropTypes.number.isRequired,
    views: PropTypes.number.isRequired,
    lastUpdated: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['active', 'draft']).isRequired,
    preview: PropTypes.string.isRequired
  })),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onShare: PropTypes.func,
  onCreate: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default LinkTreeGallery;