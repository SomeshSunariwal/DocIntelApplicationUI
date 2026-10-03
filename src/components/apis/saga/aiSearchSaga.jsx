import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  AISearchActions,
  getAuthToken,
  Question,
  QueryParam,
  And,
} from "../../constants";

function aiSearch(action) {
  const query = action.payload.query;
  const documentId = action.payload.documentId;
  const version = action.payload.version;

  let API_LINK =
    HomeEndpoint +
    API_URL.AI_SEARCH +
    Question +
    `${QueryParam.Query}${encodeURIComponent(query)}`;

  if (documentId) {
    API_LINK =
      API_LINK + And + `${QueryParam.DOCUMENT_ID}${encodeURIComponent(documentId)}`;
  }
  if (documentId && version !== undefined && version !== null) {
    API_LINK += And + `version=${encodeURIComponent(version)}`;
  }

  return fetch(API_LINK, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchAiSearch(action) {
  try {
    const response = yield call(aiSearch, action);
    if (response.errorCode === undefined) {
      yield put({
        type: AISearchActions.AI_SERACH_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: AISearchActions.AI_SERACH_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({ type: AISearchActions.AI_SERACH_ERROR, message: e.message });
  }
}

function* aiSearchSaga() {
  yield takeEvery(AISearchActions.AI_SERACH_REQUESTED, fetchAiSearch);
}

export default aiSearchSaga;
