import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  DeleteUserActions,
  TOKEN,
} from "../../constants";

function deleteUser(action) {
  const API_LINK = HomeEndpoint + API_URL.DELETE_USER;

  return fetch(API_LINK, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action.payload),
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchDeleteUser(action) {
  try {
    const response = yield call(deleteUser, action);
    if (response.errorCode === undefined) {
      yield put({
        type: DeleteUserActions.DELETE_USER_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: DeleteUserActions.DELETE_USER_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: DeleteUserActions.DELETE_USER_ERROR,
      message: e.message,
    });
  }
}

function* deleteUserSaga() {
  yield takeEvery(DeleteUserActions.DELETE_USER_REQUESTED, fetchDeleteUser);
}

export default deleteUserSaga;
