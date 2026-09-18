import { GetDocumetsActions } from "../../constants";

export const getDocumentsAction = (documentId) => {
  return {
    type: GetDocumetsActions.GET_DOCUMENTS_REQUESTED,
    payload: documentId,
  };
};
