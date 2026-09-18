import { all } from "redux-saga/effects";
import filesUploadSaga from "./filesUploadSaga";

export default function* rootSaga() {
  yield all([filesUploadSaga()]);
}
