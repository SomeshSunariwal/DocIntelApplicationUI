import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  DeleteDocumentActions,
  TOKEN,
} from "../../constants";

function deleteDocument(action) {
  const API_LINK = `${HomeEndpoint}${API_URL.DELETE_DOCUMENT}/${encodeURIComponent(action.payload)}`;

  return fetch(API_LINK, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchDeleteDocument(action) {
  try {
    const response = yield call(deleteDocument, action);
    if (response.errorCode === undefined) {
      yield put({
        type: DeleteDocumentActions.DELETE_DOCUMENT_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: DeleteDocumentActions.DELETE_DOCUMENT_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: DeleteDocumentActions.DELETE_DOCUMENT_ERROR,
      message: e.message,
    });
  }
}

function* deleteDocumentSaga() {
  yield takeEvery(
    DeleteDocumentActions.DELETE_DOCUMENT_REQUESTED,
    fetchDeleteDocument,
  );
}

export default deleteDocumentSaga;
