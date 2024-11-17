
import { Save } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import ShareDialog from "./share-dialog";
import PropTypes from 'prop-types';
const SaveStatus = ({ saveLinkTree, saveError, saveSuccess, isSaving, linkTreeId,setLinkTreeId }) => (
    <div className="w-full absolute bottom-0 p-6">
      {saveError && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      {saveSuccess && (
        <Alert className="mb-2 bg-green-50 text-green-700 border-green-200">
          <AlertDescription>Changes saved successfully!</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2 ">
        <button
          onClick={saveLinkTree}
          className="w-full gap-2 bg-gray-900 border text-gray-300 flex justify-center items-center rounded-md text-sm"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        {linkTreeId && <ShareDialog linkTreeId={linkTreeId} setLinkTreeId={setLinkTreeId}/>}
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
    };
  export default SaveStatus;