import { GetUserAllDocumentsActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const getAllUserDocumentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GetUserAllDocumentsActions.GET_USER_DOCUMENTS_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetUserAllDocumentsActions.GET_USER_DOCUMENTS_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case GetUserAllDocumentsActions.GET_USER_DOCUMENTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
