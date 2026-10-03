import { GetUserAllDocumentsActions } from "../../constants";

export const getUserAllDocumentsAction = ({ page = 0, append = false } = {}) => {
  return {
    type: GetUserAllDocumentsActions.GET_USER_DOCUMENTS_REQUESTED,
    payload: { page, append },
  };
};
