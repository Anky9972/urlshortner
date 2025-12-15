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
  isCreate,
}) => (
  <div className="w-full absolute bottom-0 p-5 bg-zinc-900 border-t border-zinc-800">
    {/* {isCreate && "Create your LinkTree and share it with the world!"} */}
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
          className="w-full gap-2 p-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium flex justify-center items-center rounded-lg text-sm transition-colors"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save "}
        </button>
      ) : (
        <button
          onClick={saveLinkTree}
          className="w-full gap-2 p-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium flex justify-center items-center rounded-lg text-sm transition-colors"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Updating..." : "Save Changes"}
        </button>
      )}
      {linkTreeId && (
        <ShareDialog linkTreeId={linkTreeId} setLinkTreeId={setLinkTreeId} />
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
  isCreate: PropTypes.bool.isRequired,
};
export default SaveStatus;
