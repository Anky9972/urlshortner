import { Clock, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LinkExpired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
        <p className="text-slate-500 mb-8">
          This link is no longer available. It may have expired, reached its click limit, or been deactivated.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[hsl(230,10%,14%)] hover:bg-[hsl(230,10%,20%)] text-slate-300 border border-[hsl(230,10%,20%)] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkExpired;
