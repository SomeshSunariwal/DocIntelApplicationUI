import { combineSlices } from "@reduxjs/toolkit";
import { filesUploadReducer } from "./filesUploadReducer";
import { getDocumentsReducer } from "./getDocumentsReducer";
import { updateDocumentReducer } from "./updateDocumentReducer";
import { deleteDocumentReducer } from "./deleteDocumentReducer";
import { getUserAllDocumentsReducer } from "./getUserAllDocumentsReducer";
import { addOrUpdateConfigReducer } from "./addOrUpdateConfigReducer";
import { chatStreamReducer } from "./chatStreamReducer";
import { segmentedSearchReducer } from "./segmentedSearchReducer";
import { aiSearchReducer } from "./aiSearchReducer";
import { registerUserReducer } from "./registerUserReducer";
import { deleteUserReducer } from "./deleteUserReducer";
import { userLoginReducer } from "./userLoginReducer";
import { summerizeDocumentReducer } from "./summarizeDocumentReducer";
import { userVerifyReducer } from "./userVerifyReducer";

const rootReducer = combineSlices({
  filesUpload: filesUploadReducer,
  getDocuments: getDocumentsReducer,
  updateDocument: updateDocumentReducer,
  deleteDocument: deleteDocumentReducer,
  getUserAllDocuments: getUserAllDocumentsReducer,
  addOrUpdateConfig: addOrUpdateConfigReducer,
  chatStream: chatStreamReducer,
  segmentedSearch: segmentedSearchReducer,
  aiSearch: aiSearchReducer,
  registerUser: registerUserReducer,
  deleteUser: deleteUserReducer,
  userLogin: userLoginReducer,
  summerizeDocument: summerizeDocumentReducer,
  userVerify: userVerifyReducer,
});

export default rootReducer;
