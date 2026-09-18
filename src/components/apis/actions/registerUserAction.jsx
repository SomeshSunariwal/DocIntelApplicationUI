import { RegisterUserActions } from "../../constants";

export const registerUserAction = (userData) => {
  return {
    type: RegisterUserActions.REGISTER_USER_REQUESTED,
    payload: userData,
  };
};
