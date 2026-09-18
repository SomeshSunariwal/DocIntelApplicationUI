import { AddOrUpdateCofigActions } from "../../constants";

export const addOrUpdateConfigAction = (config) => {
  return {
    type: AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_REQUESTED,
    payload: config,
  };
};
