import { UserVerifyActions } from "../../constants";

export const userVerifyAction = () => {
  return {
    type: UserVerifyActions.USER_VERIFY_REQUESTED,
  };
};
