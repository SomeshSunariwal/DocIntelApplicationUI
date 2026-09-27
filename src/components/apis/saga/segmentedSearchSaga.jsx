import { call, put, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  SegmantedSearchActions,
  getAuthToken,
  Question,
  QueryParam,
} from "../../constants";

function segmentedSearch(action) {
  const query = action.payload;

  let API_LINK =
    HomeEndpoint +
    API_URL.SEGMENTED_SEARCH +
    Question +
    `${QueryParam.Query}${encodeURIComponent(query)}`;

  return fetch(API_LINK, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

function* fetchSegmentedSearch(action) {
  try {
    const response = yield call(segmentedSearch, action);
    if (response.errorCode === undefined) {
      yield put({
        type: SegmantedSearchActions.SEGMENTED_SEARCH_COMPLETED,
        payload: response,
      });
    } else {
      yield put({
        type: SegmantedSearchActions.SEGMENTED_SEARCH_ERROR,
        message: response.message,
      });
    }
  } catch (e) {
    yield put({
      type: SegmantedSearchActions.SEGMENTED_SEARCH_ERROR,
      message: e.message,
    });
  }
}

function* segmentedSearchSaga() {
  yield takeEvery(
    SegmantedSearchActions.SEGMENTED_SEARCH_REQUESTED,
    fetchSegmentedSearch,
  );
}

export default segmentedSearchSaga;
