import { SummerizeDocumentActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const summerizeDocumentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_REQUESTED:
      return {
        ...state,
        data: [],
        sources: [],
        loading: true,
        error: null,
      };
    case SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_CHUNK_RECEIVED:
      return {
        ...state,
        data: [...state.data, action.payload],
      };
    case SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_COMPLETED:
      return {
        ...state,
        loading: false,
        sources: action.sources,
      };
    case SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
