import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CircleOff, Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFoundPage = ({ isNotFound }) => {
  // Animation variants for coordinated animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  // Floating animation for the error icon
  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        className="text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          animate={floatingAnimation}
        >
          {isNotFound ? (
            <CircleOff className="w-24 h-24 text-blue-400 opacity-80" />
          ) : (
            <AlertCircle className="w-24 h-24 text-yellow-400 opacity-80" />
          )}
        </motion.div>

        {/* Error Code */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <h1 className="text-8xl font-black text-white mb-4 relative z-10">
            {isNotFound ? "404" : "Oops!"}
          </h1>
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 z-0" />
        </motion.div>
        
        {/* Error Message */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl text-gray-300 mb-8 font-semibold">
            {isNotFound ? "Page Not Found" : "Something Went Wrong"}
          </h2>
        </motion.div>
        
        {/* Description */}
        <motion.div variants={itemVariants}>
          <p className="text-gray-400 max-w-md mx-auto mb-12 leading-relaxed">
            {isNotFound 
              ? "The page you're looking for might have been moved, deleted, or possibly never existed. Let's get you back on track!" 
              : "We encountered an unexpected error. Don't worry, our team has been notified and we're working on it."}
          </p>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            className="group bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </motion.button>
          
          <motion.a
            href="/"
            className="group bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Return Home
          </motion.a>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-blue-500 opacity-5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-500 opacity-5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </motion.div>
    </div>
  );
};

NotFoundPage.propTypes = {
  isNotFound: PropTypes.bool
};


export default NotFoundPage;