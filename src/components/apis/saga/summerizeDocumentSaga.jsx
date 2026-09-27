import { eventChannel } from "redux-saga";
import { call, put, take, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  SummerizeDocumentActions,
  getAuthToken,
  Constant,
  Separator,
} from "../../constants";

function createSummerizeDocumentChannel(action) {
  const documentId = action.payload;

  return eventChannel((emit) => {
    const controller = new AbortController();
    let API_LINK =
      HomeEndpoint +
      API_URL.SUMMERIZE_DOCUMENT +
      Separator +
      encodeURIComponent(documentId) +
      Constant.SUMMERIZE;

    async function startStream() {
      try {
        const response = await fetch(API_LINK, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + getAuthToken(),
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat stream failed with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error("The server did not return a readable chat stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          buffer += decoder.decode(value || new Uint8Array(), {
            stream: !done,
          });

          const events = buffer.split(/\r?\n\r?\n/);

          buffer = done ? "" : events.pop() || "";

          for (const event of events) {
            if (!event.trim()) {
              continue;
            }
            try {
              const jsonData = event
                .split(/\r?\n/)
                .filter((line) => line.startsWith("data:"))
                .map((line) => line.slice(5))
                .join("\n")
                .trim();

              if (!jsonData) {
                continue;
              }

              const streamResponse = JSON.parse(jsonData);
              if (streamResponse.type === "CHUNK") {
                if (streamResponse.error === true) {
                  emit({
                    type: "error",
                    message: streamResponse.data || "Something went wrong.",
                  });
                  return;
                }

                emit({
                  type: "chunk",
                  payload: streamResponse.data || "",
                });
                continue;
              }

              /*
               * COMPLETED
               */
              if (streamResponse.type === "COMPLETED") {
                if (streamResponse.success === true) {
                  emit({
                    type: "complete",
                    sources: streamResponse.textSegmentResponseDTO || [],
                  });
                }
                continue;
              }

              /*
               * ERROR
               */
              if (streamResponse.type === "ERROR") {
                emit({
                  type: "error",
                  message:
                    streamResponse.data || "Unable to generate the response.",
                });
                return;
              }
            } catch (parseError) {
              console.error(
                "Error parsing SSE data:",
                decoder.decode(value),
                parseError,
              );
            }
          }
          if (done) {
            return;
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          emit({ type: "error", message: error.message });
        }
      }
    }

    startStream();

    return () => controller.abort();
  });
}

function* fetchSummerizeDocument(action) {
  const channel = yield call(createSummerizeDocumentChannel, action);

  try {
    while (true) {
      const event = yield take(channel);

      if (event.type === "chunk") {
        yield put({
          type: SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_CHUNK_RECEIVED,
          payload: event.payload,
        });
      }

      if (event.type === "error") {
        yield put({
          type: SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_ERROR,
          message: event.message,
        });
        break;
      }

      if (event.type === "complete") {
        yield put({
          type: SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_COMPLETED,
          sources: event.sources,
        });
        break;
      }
    }
  } finally {
    channel.close();
  }
}

function* summerizeDocumentSaga() {
  yield takeEvery(
    SummerizeDocumentActions.SUMMERIZE_DOCUMENTS_REQUESTED,
    fetchSummerizeDocument,
  );
}

export default summerizeDocumentSaga;
