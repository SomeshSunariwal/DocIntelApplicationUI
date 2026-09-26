"use client";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "../ui/prompt-input";
import { Message, MessageAvatar, MessageContent } from "../ui/message";
import { Source, SourceContent, SourceTrigger } from "../ui/source";
import { ChatContainerContent, ChatContainerRoot } from "../ui/chat-container";
import { ScrollButton } from "../ui/scroll-button";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatStreamAction } from "../apis/actions/chatStreamAction";

export function PromptInputBasic({ documentId }) {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState("stream");
  const [messages, setMessages] = useState([]);
  const [streamMessageId, setStreamMessageId] = useState(null);

  const {
    data: streamChunks,
    sources: streamSources,
    loading: streamLoading,
    error: streamError,
  } = useSelector((state) => state.rootReducer.chatStream);

  useEffect(() => {
    if (!streamMessageId || streamChunks.length === 0) return;

    const content = streamChunks.join("");

    setMessages((previousMessages) => {
      const messageExists = previousMessages.some(
        (message) => message.id === streamMessageId,
      );

      if (!messageExists) {
        return [
          ...previousMessages,
          {
            id: streamMessageId,
            role: "assistant",
            content,
          },
        ];
      }

      return previousMessages.map((message) =>
        message.id === streamMessageId
          ? {
              ...message,
              content,
            }
          : message,
      );
    });
  }, [streamChunks, streamMessageId]);

  useEffect(() => {
    if (!streamSources || streamSources.length === 0) return;

    const sources = streamSources.map((source) => ({
      title: source.fileName,
      description: source.text,
      fileType: source.fileName?.split(".").pop()?.toUpperCase() || "FILE",
    }));

    setMessages((previousMessages) => {
      return previousMessages.map((message) =>
        message.id === streamMessageId
          ? {
              ...message,
              sources: sources,
            }
          : message,
      );
    });
  }, [streamSources]);

  useEffect(() => {
    if (!streamMessageId || streamLoading) return;

    if (streamError) {
      setMessages((previousMessages) => {
        const messageExists = previousMessages.some(
          (message) => message.id === streamMessageId,
        );

        if (!messageExists) {
          return [
            ...previousMessages,
            {
              id: streamMessageId,
              role: "assistant",
              content: `Unable to generate a response: ${streamError}`,
            },
          ];
        }

        return previousMessages.map((message) =>
          message.id === streamMessageId
            ? {
                ...message,
                content:
                  message.content ||
                  `Unable to generate a response: ${streamError}`,
              }
            : message,
        );
      });
    }

    setIsLoading(false);
    setStreamMessageId(null);
  }, [streamError, streamLoading, streamMessageId]);

  const handleSubmit = () => {
    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    const assistantMessageId = crypto.randomUUID();

    setMessages((previousMessages) => [...previousMessages, userMessage]);

    setInput("");
    setIsLoading(true);
    setStreamMessageId(assistantMessageId);
    dispatch(chatStreamAction(message, documentId));
  };

  const handleValueChange = (value) => {
    setInput(value);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* =========================
        CHAT MESSAGES
        ========================= */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute right-4 top-3 z-20 flex items-center text-[12px]  rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <span
            className={`pointer-events-none absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-blue-600 transition-transform duration-200 ${chatMode === "static" ? "translate-x-full" : "translate-x-0"}`}
            aria-hidden="true"
          />
          {["stream", "static"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setChatMode(mode)}
              aria-pressed={chatMode === mode}
              className={`relative z-10 min-w-16 rounded-full px-3 py-1.5 font-medium capitalize transition-colors ${chatMode === mode ? "text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
            >
              {mode}
            </button>
          ))}
        </div>
        <ChatContainerRoot className="h-full w-full">
          <ChatContainerContent className="mx-auto flex w-full max-w-225 flex-col gap-6 px-4 py-6">
            {messages.length === 0 && (
              <div className="flex min-h-75 items-center justify-center">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    How can I help?
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Ask a question about your document.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <Message
                key={message.id}
                className={
                  message.role === "user" ? "justify-end" : "justify-start"
                }
              >
                {message.role === "assistant" && (
                  <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
                )}
                <div className="flex max-w-[80%] flex-col gap-2">
                  <MessageContent
                    markdown={message.role === "assistant"}
                    className={
                      message.role === "user"
                        ? "bg-gray-50 text-black dark:bg-gray-800 dark:text-white text-[14px]"
                        : "bg-gray-50 text-black dark:bg-gray-800 dark:text-white text-[14px]"
                    }
                  >
                    {message.content}
                  </MessageContent>

                  {message.role === "assistant" &&
                    message.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, index) => (
                          <Source
                            key={`${message.id}-source-${index}`}
                            fileType={source.fileType}
                          >
                            <SourceTrigger />

                            <SourceContent
                              title={source.title}
                              description={source.description}
                            />
                          </Source>
                        ))}
                      </div>
                    )}
                </div>
              </Message>
            ))}

            {isLoading && streamChunks.length === 0 && (
              <Message className="justify-start">
                <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />

                <MessageContent className="bg-transparent p-0">
                  <div className="flex items-center gap-1">
                    <span className="animate-pulse">Thinking</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">
                      .
                    </span>
                    <span className="animate-bounce [animation-delay:300ms]">
                      .
                    </span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ChatContainerContent>

          <div className="absolute bottom-4 right-6">
            <ScrollButton />
          </div>
        </ChatContainerRoot>
      </div>

      {/* =========================
        STATIC PROMPT INPUT
        ========================= */}
      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto w-full max-w-(--breakpoint-md)">
          <PromptInput
            value={input}
            onValueChange={handleValueChange}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            className="w-full"
          >
            <PromptInputTextarea placeholder="Ask me anything..." />

            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading ? "Stop generation" : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Square className="size-4 fill-current" />
                  ) : (
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
