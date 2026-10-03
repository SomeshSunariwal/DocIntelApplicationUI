import { ChatStreamActions } from "../../constants";

export const chatStreamAction = (query, docuemntId, version) => {
  return {
    type: ChatStreamActions.CHAT_STREAM_REQUESTED,
    payload: {
      query: query,
      documentId: docuemntId,
      version: version,
    },
  };
};
