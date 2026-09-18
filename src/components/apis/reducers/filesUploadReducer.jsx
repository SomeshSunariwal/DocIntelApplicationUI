import { FilesUploadActions } from "../../constants";

const initialState = {
  data: [],
  loading: false,
  error: null,
};

export const filesUploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case FilesUploadActions.FILES_UPLOAD_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FilesUploadActions.FILES_UPLOAD_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case FilesUploadActions.FILES_UPLOAD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
