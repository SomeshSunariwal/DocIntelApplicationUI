import { AISearchActions } from "../../constants";

export const aiSearchAction = (searchTerm) => {
  return {
    type: AISearchActions.AI_SERACH_REQUESTED,
    payload: searchTerm,
  };
};
