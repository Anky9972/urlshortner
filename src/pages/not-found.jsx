import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { CircleOff, Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFoundPage = ({ isNotFound }) => {
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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Icon */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={itemVariants}
        >
          <div className="w-24 h-24 rounded-2xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] flex items-center justify-center">
            {isNotFound ? (
              <CircleOff className="w-12 h-12 text-blue-400" />
            ) : (
              <AlertCircle className="w-12 h-12 text-amber-400" />
            )}
          </div>
        </motion.div>

        {/* Error Code */}
        <motion.div variants={itemVariants}>
          <h1 className="text-7xl font-bold text-white mb-4">
            {isNotFound ? "404" : "Oops!"}
          </h1>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl text-slate-300 mb-6 font-medium">
            {isNotFound ? "Page Not Found" : "Something Went Wrong"}
          </h2>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants}>
          <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
            {isNotFound
              ? "The page you're looking for might have been moved, deleted, or never existed."
              : "We encountered an unexpected error. Our team has been notified."}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors w-full sm:w-auto justify-center"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[hsl(230,10%,14%)] hover:bg-[hsl(230,10%,20%)] text-slate-300 hover:text-white border border-[hsl(230,10%,20%)] font-medium transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Return Home
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

NotFoundPage.propTypes = {
  isNotFound: PropTypes.bool
};

export default NotFoundPage;