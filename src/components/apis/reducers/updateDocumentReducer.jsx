import { UpdateDocumetActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const updateDocumentReducer = (state = initialState, action) => {
  switch (action.type) {
    case UpdateDocumetActions.UPDATE_DOCUMENT_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UpdateDocumetActions.UPDATE_DOCUMENT_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case UpdateDocumetActions.UPDATE_DOCUMENT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
