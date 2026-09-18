import { DeleteUserActions } from "../../constants";

export const deleteUserAction = (email) => {
  return {
    type: DeleteUserActions.DELETE_USER_REQUESTED,
    payload: email,
  };
};
