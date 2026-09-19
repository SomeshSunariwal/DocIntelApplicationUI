import { AISearchActions } from "../../constants";

export const aiSearchAction = (query, docuemntId) => {
  return {
    type: AISearchActions.AI_SERACH_REQUESTED,
    payload: {
      query: query,
      documentId: docuemntId,
    },
  };
};
