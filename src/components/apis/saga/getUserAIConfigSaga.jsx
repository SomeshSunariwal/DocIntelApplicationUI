import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  GetUserAIConfigActions,
  getAuthToken,
} from "../../constants";

function getUserAIConfig() {
  const ENDPOINT = `${HomeEndpoint}${API_URL.GET_USER_AI_CONFIG}`;
  return fetch(ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  }).then((response) => response.json());
}

function* fetchUserAIConfig() {
  try {
    const response = yield call(getUserAIConfig);
    if (response.errorCode === undefined) {
      yield put({
        type: GetUserAIConfigActions.GET_USER_AI_CONFIG_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: GetUserAIConfigActions.GET_USER_AI_CONFIG_ERROR,
        message: response.message,
      });
    }
  } catch (error) {
    yield put({
      type: GetUserAIConfigActions.GET_USER_AI_CONFIG_ERROR,
      message: error.message,
    });
  }
}

export default function* getUserAIConfigSaga() {
  yield takeEvery(
    GetUserAIConfigActions.GET_USER_AI_CONFIG_REQUESTED,
    fetchUserAIConfig,
  );
}
