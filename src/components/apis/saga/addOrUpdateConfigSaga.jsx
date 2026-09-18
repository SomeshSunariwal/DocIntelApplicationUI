import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  AddOrUpdateCofigActions,
  TOKEN,
} from "../../constants";

function addOrUpdateConfig(action) {
  const API_LINK = HomeEndpoint + API_URL.ADD_UPDATE_CONFIG;

  return fetch(API_LINK, {
    method: "POST",
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

function* fetchAddOrUpdateConfig(action) {
  try {
    const response = yield call(addOrUpdateConfig, action);
    if (response.errorCode === undefined) {
      yield put({
        type: AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_ERROR,
      message: e.message,
    });
  }
}

function* addOrUpdateConfigSaga() {
  yield takeEvery(
    AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_REQUESTED,
    fetchAddOrUpdateConfig,
  );
}

export default addOrUpdateConfigSaga;
