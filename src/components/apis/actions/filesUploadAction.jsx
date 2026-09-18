import { FilesUploadActions } from "../../constants";

export const filesUploadAction = (files) => {
  return {
    type: FilesUploadActions.FILES_UPLOAD_REQUESTED,
    payload: files,
  };
};
