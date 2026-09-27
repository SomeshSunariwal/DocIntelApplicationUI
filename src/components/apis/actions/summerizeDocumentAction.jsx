import { SummerizeDocumentActions } from "../../constants";

export const summerizeDocumentAction = (documentId) => {
  return {
    type: SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_REQUESTED,
    payload: documentId,
  };
};
