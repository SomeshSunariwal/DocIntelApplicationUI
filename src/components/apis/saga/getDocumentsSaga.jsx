import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  GetDocumetsActions,
  TOKEN,
} from "../../constants";

function getDocument(action) {
  const documentId = action.payload;
  const API_LINK = `${HomeEndpoint}${API_URL.GET_DOCUMENT}/${encodeURIComponent(documentId)}`;

  return fetch(API_LINK, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchGetDocument(action) {
  try {
    const getDocumentResponse = yield call(getDocument, action);
    if (getDocumentResponse.errorCode === undefined) {
      yield put({
        type: GetDocumetsActions.GET_DOCUMENTS_COMPLETED,
        payload: getDocumentResponse,
      });
    } else {
      yield put({
        type: GetDocumetsActions.GET_DOCUMENTS_ERROR,
        message: getDocumentResponse.message,
      });
    }
  } catch (e) {
    yield put({
      type: GetDocumetsActions.GET_DOCUMENTS_ERROR,
      message: e.message,
    });
  }
}

function* getDocumentsSaga() {
  yield takeEvery(GetDocumetsActions.GET_DOCUMENTS_REQUESTED, fetchGetDocument);
}

export default getDocumentsSaga;
