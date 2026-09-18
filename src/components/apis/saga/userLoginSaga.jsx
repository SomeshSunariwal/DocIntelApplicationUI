import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  UserLoginActions,
  TOKEN,
} from "../../constants";

function userLogin(action) {
  const API_LINK = HomeEndpoint + API_URL.USER_LOGIN;

  return fetch(API_LINK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action.payload),
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchUserLogin(action) {
  try {
    const response = yield call(userLogin, action);
    if (response.errorCode === undefined) {
      yield put({
        type: UserLoginActions.LOGIN_USER_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: UserLoginActions.LOGIN_USER_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({ type: UserLoginActions.LOGIN_USER_ERROR, message: e.message });
  }
}

function* userLoginSaga() {
  yield takeEvery(UserLoginActions.LOGIN_USER_REQUESTED, fetchUserLogin);
}

export default userLoginSaga;
