import { combineSlices } from "@reduxjs/toolkit";
import { filesUploadReducer } from "./filesUploadReducer";
import { getDocumentsReducer } from "./getDocumentsReducer";
import { updateDocumentReducer } from "./updateDocumentReducer";
import { deleteDocumentReducer } from "./deleteDocumentReducer";
import { getAllUserDocumentsReducer } from "./getAllUserDocumentsReducer";
import { addOrUpdateConfigReducer } from "./addOrUpdateConfigReducer";
import { chatStreamReducer } from "./chatStreamReducer";
import { segmentedSearchReducer } from "./segmentedSearchReducer";
import { aiSearchReducer } from "./aiSearchReducer";
import { registerUserReducer } from "./registerUserReducer";
import { deleteUserReducer } from "./deleteUserReducer";
import { userLoginReducer } from "./userLoginReducer";

const rootReducer = combineSlices({
  filesUpload: filesUploadReducer,
  getDocuments: getDocumentsReducer,
  updateDocument: updateDocumentReducer,
  deleteDocument: deleteDocumentReducer,
  getAllUserDocuments: getAllUserDocumentsReducer,
  addOrUpdateConfig: addOrUpdateConfigReducer,
  chatStream: chatStreamReducer,
  segmentedSearch: segmentedSearchReducer,
  aiSearch: aiSearchReducer,
  registerUser: registerUserReducer,
  deleteUser: deleteUserReducer,
  userLogin: userLoginReducer,
});

export default rootReducer;
