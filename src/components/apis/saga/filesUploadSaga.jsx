import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  FilesUploadActions,
  TOKEN,
} from "../../constants";

function FileUpload(action) {
  const files = action.payload;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const API_LINK = HomeEndpoint + API_URL.UPLOAD_FILES;
  // const token = JSON.parse(localStorage.getItem("login")) ?? TOKEN;

  return fetch(API_LINK, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
    body: formData,
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      throw error;
    });
}

function* fetchFilesUpload(action) {
  try {
    const fileUploadResponse = yield call(FileUpload, action);
    if (fileUploadResponse.errorCode === undefined) {
      yield put({
        type: FilesUploadActions.FILES_UPLOAD_COMPLETED,
        payload: fileUploadResponse,
      });
    } else {
      yield put({
        type: FilesUploadActions.FILES_UPLOAD_ERROR,
        message: fileUploadResponse.message,
      });
    }
  } catch (e) {
    yield put({
      type: FilesUploadActions.FILES_UPLOAD_ERROR,
      message: e.message,
    });
  }
}

function* filesUploadSaga() {
  yield takeEvery(FilesUploadActions.FILES_UPLOAD_REQUESTED, fetchFilesUpload);
}

export default filesUploadSaga;
