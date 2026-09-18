import { DeleteDocumentActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const deleteDocumentReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeleteDocumentActions.DELETE_DOCUMENT_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case DeleteDocumentActions.DELETE_DOCUMENT_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case DeleteDocumentActions.DELETE_DOCUMENT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
