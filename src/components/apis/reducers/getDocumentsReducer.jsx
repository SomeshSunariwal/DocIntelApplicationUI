import { GetDocumetsActions } from "../../constants";

const initialState = {
  data: [],
  loading: false,
  error: null,
};

export const getDocumentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GetDocumetsActions.GET_DOCUMENTS_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetDocumetsActions.GET_DOCUMENTS_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case GetDocumetsActions.GET_DOCUMENTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
