import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  RegisterUserActions,
  TOKEN,
} from "../../constants";

function registerUser(action) {
  const API_LINK = HomeEndpoint + API_URL.REGISTER_USER;

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

function* fetchRegisterUser(action) {
  try {
    const response = yield call(registerUser, action);
    if (response.errorCode === undefined) {
      yield put({
        type: RegisterUserActions.REGISTER_USER_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: RegisterUserActions.REGISTER_USER_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: RegisterUserActions.REGISTER_USER_ERROR,
      message: e.message,
    });
  }
}

function* registerUserSaga() {
  yield takeEvery(
    RegisterUserActions.REGISTER_USER_REQUESTED,
    fetchRegisterUser,
  );
}

export default registerUserSaga;
