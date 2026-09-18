import { ChatStreamActions } from "../../constants";

export const chatStreamAction = (request) => {
  return {
    type: ChatStreamActions.CHAT_STREAM_REQUESTED,
    payload: request,
  };
};
