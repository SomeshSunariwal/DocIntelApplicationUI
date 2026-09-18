import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  UpdateDocumetActions,
  TOKEN,
} from "../../constants";

function updateDocument(action) {
  const { documentId, document } = action.payload;
  const API_LINK = `${HomeEndpoint}${API_URL.UPDATE_DOCUMENT}/${encodeURIComponent(documentId)}`;

  return fetch(API_LINK, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(document),
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchUpdateDocument(action) {
  try {
    const response = yield call(updateDocument, action);
    if (response.errorCode === undefined) {
      yield put({
        type: UpdateDocumetActions.UPDATE_DOCUMENT_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: UpdateDocumetActions.UPDATE_DOCUMENT_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: UpdateDocumetActions.UPDATE_DOCUMENT_ERROR,
      message: e.message,
    });
  }
}

function* updateDocumentSaga() {
  yield takeEvery(
    UpdateDocumetActions.UPDATE_DOCUMENT_REQUESTED,
    fetchUpdateDocument,
  );
}

export default updateDocumentSaga;
