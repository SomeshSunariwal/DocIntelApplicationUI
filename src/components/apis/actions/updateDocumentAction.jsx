import { UpdateDocumetActions } from "../../constants";

export const updateDocumentAction = (documentId, document) => {
  return {
    type: UpdateDocumetActions.UPDATE_DOCUMENT_REQUESTED,
    payload: { documentId, document },
  };
};
