import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  GetUserInformationActions,
  getAuthToken,
} from "../../constants";

function getUserInformation() {
  const ENDPOINT = `${HomeEndpoint}${API_URL.GET_USER_INFORMATION}`;
  return fetch(ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  }).then((response) => response.json());
}

function* fetchUserInformation() {
  try {
    const response = yield call(getUserInformation);
    if (response.errorCode === undefined) {
      yield put({
        type: GetUserInformationActions.GET_USER_INFORMATION_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: GetUserInformationActions.GET_USER_INFORMATION_ERROR,
        message: response.message,
      });
    }
  } catch (error) {
    yield put({
      type: GetUserInformationActions.GET_USER_INFORMATION_ERROR,
      message: error.message,
    });
  }
}

export default function* getUserInformationSaga() {
  yield takeEvery(
    GetUserInformationActions.GET_USER_INFORMATION_REQUESTED,
    fetchUserInformation,
  );
}
