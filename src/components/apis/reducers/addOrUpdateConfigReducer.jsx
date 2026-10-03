import { AddOrUpdateCofigActions } from "../../constants";

const initialState = { data: [], loading: false, error: null, success: false };

export const addOrUpdateConfigReducer = (state = initialState, action) => {
  switch (action.type) {
    case AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
        success: true,
      };
    case AddOrUpdateCofigActions.ADD_UPDATE_CONFIG_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
