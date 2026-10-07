import { SummerizeDocumentActions } from "../../constants";

export const summerizeDocumentAction = (documentId, version) => {
  return {
    type: SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_REQUESTED,
    payload: { documentId, version },
  };
};
