import { ChatStreamActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const chatStreamReducer = (state = initialState, action) => {
  switch (action.type) {
    case ChatStreamActions.CHAT_STREAM_REQUESTED:
      return {
        ...state,
        data: [],
        loading: true,
        error: null,
      };
    case ChatStreamActions.CHAT_STREAM_CHUNK_RECEIVED:
      return {
        ...state,
        data: [...state.data, action.payload],
      };
    case ChatStreamActions.CHAT_STREAM_COMPLETED:
      return {
        ...state,
        loading: false,
      };
    case ChatStreamActions.CHAT_STREAM_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
