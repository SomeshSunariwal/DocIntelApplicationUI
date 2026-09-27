import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  UserVerifyActions,
  getAuthToken,
} from "../../constants";

function verifyUser() {
  const API_ENDPOINT = `${HomeEndpoint}${API_URL.USER_VERIFY}`;

  return fetch(API_ENDPOINT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        return { validate: false };
      }
      return response.json();
    })
    .catch((error) => {
      throw new Error(error);
    });
}

function* fetchUserVerify(action) {
  try {
    const response = yield call(verifyUser);
    if (response.errorCode === undefined) {
      yield put({
        type: UserVerifyActions.USER_VERIFY_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: UserVerifyActions.USER_VERIFY_ERROR,
        message: error.message,
      });
    }
  } catch (error) {
    yield put({
      type: UserVerifyActions.USER_VERIFY_ERROR,
      message: error.message,
    });
  }
}

function* userVerifySaga() {
  yield takeEvery(UserVerifyActions.USER_VERIFY_REQUESTED, fetchUserVerify);
}

export default userVerifySaga;
