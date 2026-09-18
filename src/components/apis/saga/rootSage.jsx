import { all } from "redux-saga/effects";
import filesUploadSaga from "./filesUploadSaga";
import getDocumentsSaga from "./getDocumentsSaga";
import updateDocumentSaga from "./updateDocumentSaga";
import deleteDocumentSaga from "./deleteDocumentSaga";
import getAllUserDocumentsSaga from "./getAllUserDocumentsSaga";
import addOrUpdateConfigSaga from "./addOrUpdateConfigSaga";
import chatStreamSaga from "./chatStreamSaga";
import segmentedSearchSaga from "./segmentedSearchSaga";
import aiSearchSaga from "./aiSearchSaga";
import registerUserSaga from "./registerUserSaga";
import deleteUserSaga from "./deleteUserSaga";
import userLoginSaga from "./userLoginSaga";

export default function* rootSaga() {
  yield all([
    filesUploadSaga(),
    getDocumentsSaga(),
    updateDocumentSaga(),
    deleteDocumentSaga(),
    getAllUserDocumentsSaga(),
    addOrUpdateConfigSaga(),
    chatStreamSaga(),
    segmentedSearchSaga(),
    aiSearchSaga(),
    registerUserSaga(),
    deleteUserSaga(),
    userLoginSaga(),
  ]);
}
