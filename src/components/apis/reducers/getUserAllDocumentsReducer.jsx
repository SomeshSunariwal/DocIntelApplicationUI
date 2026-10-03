import { GetUserAllDocumentsActions } from "../../constants";

const initialState = {
  data: null,
  loading: false,
  error: null,
  lastPage: null,
  lastPageEmpty: false,
  lastPageAppend: false,
};

const mergeDocuments = (previous, incoming) => {
  const previousDocuments = Array.isArray(previous)
    ? previous
    : previous?.documents;
  const incomingDocuments = Array.isArray(incoming)
    ? incoming
    : incoming?.documents;
  if (!Array.isArray(previousDocuments) || !Array.isArray(incomingDocuments)) {
    return incoming;
  }

  const merged = new Map(previousDocuments.map((item, index) => [
    item.documentId || item.id || `previous-${index}`,
    item,
  ]));
  incomingDocuments.forEach((item, index) => {
    const id = item.documentId || item.id || `incoming-${index}`;
    merged.set(id, { ...merged.get(id), ...item });
  });
  const documents = [...merged.values()];

  if (Array.isArray(incoming)) return documents;
  return { ...previous, ...incoming, documents };
};

export const getUserAllDocumentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GetUserAllDocumentsActions.GET_USER_DOCUMENTS_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetUserAllDocumentsActions.GET_USER_DOCUMENTS_COMPLETED:
      {
        const { response, append, page, pageEmpty } = action.payload;
        return {
          ...state,
          loading: false,
          data: append ? mergeDocuments(state.data, response) : response,
          lastPage: page,
          lastPageEmpty: pageEmpty,
          lastPageAppend: append,
        };
      }
    case GetUserAllDocumentsActions.GET_USER_DOCUMENTS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
