import { DeleteDocumentActions } from "../../constants";

export const deleteDocumentAction = (documentId) => {
  return {
    type: DeleteDocumentActions.DELETE_DOCUMENT_REQUESTED,
    payload: documentId,
  };
};
