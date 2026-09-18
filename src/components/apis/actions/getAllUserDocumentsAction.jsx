import { GetUserAllDocumentsActions } from "../../constants";

export const getUserAllDocumentsAction = (params = {}) => {
  return {
    type: GetUserAllDocumentsActions.GET_USER_DOCUMENTS_REQUESTED,
    payload: params,
  };
};
