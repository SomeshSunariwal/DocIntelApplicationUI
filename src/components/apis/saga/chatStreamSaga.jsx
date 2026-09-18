import { eventChannel } from "redux-saga";
import { call, put, take, takeEvery } from "redux-saga/effects";
import {
  HomeEndpoint,
  API_URL,
  ChatStreamActions,
  TOKEN,
} from "../../constants";

function createChatStreamChannel() {
  return eventChannel((emit) => {
    const controller = new AbortController();
    const API_LINK = HomeEndpoint + API_URL.CHAT_STREAM;

    async function startStream() {
      try {
        const response = await fetch(API_LINK, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + TOKEN,
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

          events.forEach((event) => {
            const data = event
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.replace(/^data:\s?/, ""))
              .join("\n");

            if (data) emit({ type: "chunk", payload: data });
          });

          if (done) {
            emit({ type: "complete" });
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

function* fetchChatStream() {
  const channel = yield call(createChatStreamChannel);

  try {
    while (true) {
      const event = yield take(channel);

      if (event.type === "chunk") {
        yield put({
          type: ChatStreamActions.CHAT_STREAM_CHUNK_RECEIVED,
          payload: event.payload,
        });
      }

      if (event.type === "error") {
        yield put({
          type: ChatStreamActions.CHAT_STREAM_ERROR,
          message: event.message,
        });
        break;
      }

      if (event.type === "complete") {
        yield put({
          type: ChatStreamActions.CHAT_STREAM_COMPLETED,
        });
        break;
      }
    }
  } finally {
    channel.close();
  }
}

function* chatStreamSaga() {
  yield takeEvery(ChatStreamActions.CHAT_STREAM_REQUESTED, fetchChatStream);
}

export default chatStreamSaga;
