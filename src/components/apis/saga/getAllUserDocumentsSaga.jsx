import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  GetUserAllDocumentsActions,
  TOKEN,
} from "../../constants";

function getAllUserDocuments() {
  const API_LINK = HomeEndpoint + API_URL.GET_ALL_USER_DOCUMENTS;

  return fetch(API_LINK, {
    method: "GET",
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchGetAllUserDocuments(action) {
  try {
    const response = yield call(getAllUserDocuments, action);
    if (response.errorCode === undefined) {
      yield put({
        type: GetUserAllDocumentsActions.GET_USER_DOCUMENTS_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: GetUserAllDocumentsActions.GET_USER_DOCUMENTS_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: GetUserAllDocumentsActions.GET_USER_DOCUMENTS_ERROR,
      message: e.message,
    });
  }
}

function* getAllUserDocumentsSaga() {
  yield takeEvery(
    GetUserAllDocumentsActions.GET_USER_DOCUMENTS_REQUESTED,
    fetchGetAllUserDocuments,
  );
}

export default getAllUserDocumentsSaga;
