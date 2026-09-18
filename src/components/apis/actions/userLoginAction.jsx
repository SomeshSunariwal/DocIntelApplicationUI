import { UserLoginActions } from "../../constants";

export const userLoginAction = (credentials) => {
  return {
    type: UserLoginActions.LOGIN_USER_REQUESTED,
    payload: credentials,
  };
};
