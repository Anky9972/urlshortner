import { Save } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import ShareDialog from "./share-dialog";
import PropTypes from "prop-types";
const SaveStatus = ({
  saveLinkTree,
  saveError,
  saveSuccess,
  isSaving,
  linkTreeId,
  setLinkTreeId,
  slug,
  isCreate,
}) => (
  <div className="w-full absolute bottom-0 p-5 bg-[hsl(230,12%,9%)] border-t border-[hsl(230,10%,15%)]">
    {saveError && (
      <Alert variant="destructive" className="mb-2 bg-red-500/10 border-red-500/20 text-red-400">
        <AlertDescription>{saveError}</AlertDescription>
      </Alert>
    )}
    {saveSuccess && (
      <Alert className="mb-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
        <AlertDescription>Changes saved successfully!</AlertDescription>
      </Alert>
    )}
    <div className="flex gap-2">
      {isCreate ? (
        <button
          onClick={saveLinkTree}
          className="w-full gap-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium flex justify-center items-center rounded-lg text-sm transition-colors"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save "}
        </button>
      ) : (
        <button
          onClick={saveLinkTree}
          className="w-full gap-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium flex justify-center items-center rounded-lg text-sm transition-colors"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Updating..." : "Save Changes"}
        </button>
      )}
      {linkTreeId && (
        <ShareDialog linkTreeId={linkTreeId} slug={slug} setLinkTreeId={setLinkTreeId} />
      )}
    </div>
  </div>
);
SaveStatus.propTypes = {
  saveLinkTree: PropTypes.func.isRequired,
  saveError: PropTypes.string,
  saveSuccess: PropTypes.bool,
  isSaving: PropTypes.bool.isRequired,
  linkTreeId: PropTypes.string,
  setLinkTreeId: PropTypes.func.isRequired,
  slug: PropTypes.string,
  isCreate: PropTypes.bool.isRequired,
};
export default SaveStatus;
