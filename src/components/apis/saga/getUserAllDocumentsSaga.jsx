import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  GetUserAllDocumentsActions,
  getAuthToken,
} from "../../constants";

function getAllUserDocuments(action) {
  const page = Number.isInteger(action.payload?.page)
    ? action.payload.page
    : 0;
  const API_LINK = `${HomeEndpoint}${API_URL.GET_ALL_USER_DOCUMENTS}?page=${page}`;

  return fetch(API_LINK, {
    method: "GET",
    headers: { Authorization: "Bearer " + getAuthToken() },
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
        payload: {
          response,
          append: Boolean(action.payload?.append),
          page: action.payload?.page ?? 0,
          pageEmpty:
            (Array.isArray(response?.documents)
              ? response.documents
              : Array.isArray(response)
                ? response
                : []).length === 0,
        },
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

function* getUserAllDocumentsSaga() {
  yield takeEvery(
    GetUserAllDocumentsActions.GET_USER_DOCUMENTS_REQUESTED,
    fetchGetAllUserDocuments,
  );
}

export default getUserAllDocumentsSaga;
