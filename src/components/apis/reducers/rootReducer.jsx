import { combineSlices } from "@reduxjs/toolkit";
import { filesUploadReducer } from "./filesUploadReducer";

const rootReducer = combineSlices({
  filesUpload: filesUploadReducer,
});

export default rootReducer;
