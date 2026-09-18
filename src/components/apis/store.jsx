import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/rootReducer";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./saga/rootSage";
import { FilesUploadActions } from "../constants";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: { rootReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FilesUploadActions.FILES_UPLOAD_REQUESTED],
      },
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
