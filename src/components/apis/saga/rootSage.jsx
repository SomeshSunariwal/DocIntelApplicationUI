import { all } from "redux-saga/effects";
import filesUploadSaga from "./filesUploadSaga";
import getDocumentsSaga from "./getDocumentsSaga";
import updateDocumentSaga from "./updateDocumentSaga";
import deleteDocumentSaga from "./deleteDocumentSaga";
import getUserAllDocumentsSaga from "./getUserAllDocumentsSaga";
import addOrUpdateConfigSaga from "./addOrUpdateConfigSaga";
import chatStreamSaga from "./chatStreamSaga";
import segmentedSearchSaga from "./segmentedSearchSaga";
import aiSearchSaga from "./aiSearchSaga";
import registerUserSaga from "./registerUserSaga";
import deleteUserSaga from "./deleteUserSaga";
import userLoginSaga from "./userLoginSaga";
import summerizeDocumentSaga from "./summerizeDocumentSaga";
import userVerifySaga from "./userVerifySaga";

export default function* rootSaga() {
  yield all([
    filesUploadSaga(),
    getDocumentsSaga(),
    updateDocumentSaga(),
    deleteDocumentSaga(),
    getUserAllDocumentsSaga(),
    addOrUpdateConfigSaga(),
    chatStreamSaga(),
    segmentedSearchSaga(),
    aiSearchSaga(),
    registerUserSaga(),
    deleteUserSaga(),
    userLoginSaga(),
    summerizeDocumentSaga(),
    userVerifySaga(),
  ]);
}
