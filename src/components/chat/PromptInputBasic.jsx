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
import { ArrowUp, Check, ChevronUp, Copy, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatStreamAction } from "../apis/actions/chatStreamAction";
import { aiSearchAction } from "../apis/actions/aiSearchAction";
import agentAvatar from "../../../resources/agent.png";
import userAvatar from "../../../resources/user.png";

export function PromptInputBasic({
  documentId,
  documentName,
  documentVersion,
}) {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState("stream");
  const [messages, setMessages] = useState([]);
  const [streamMessageId, setStreamMessageId] = useState(null);
  const [staticMessageId, setStaticMessageId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef(null);
  const versionCount = Math.max(0, Math.floor(Number(documentVersion) || 0));
  const [selectedVersion, setSelectedVersion] = useState(versionCount || 1);

  useEffect(() => {
    setSelectedVersion(versionCount || 1);
    setVersionMenuOpen(false);
  }, [documentId, versionCount]);

  useEffect(() => {
    if (!versionMenuOpen) return;

    const handlePointerDown = (event) => {
      if (!versionMenuRef.current?.contains(event.target)) {
        setVersionMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [versionMenuOpen]);

  const {
    data: streamChunks,
    sources: streamSources,
    loading: streamLoading,
    error: streamError,
  } = useSelector((state) => state.rootReducer.chatStream);
  const {
    data: staticSearchResponse,
    loading: staticSearchLoading,
    error: staticSearchError,
  } = useSelector((state) => state.rootReducer.aiSearch);

  useEffect(() => {
    setInput("");
    setIsLoading(false);
    setMessages([]);
    setStreamMessageId(null);
    setStaticMessageId(null);
  }, [documentId]);

  useEffect(() => {
    if (!staticMessageId || staticSearchLoading) return;

    const segments = Array.isArray(staticSearchResponse)
      ? staticSearchResponse
      : staticSearchResponse?.textSegmentResponseDTOList || [];
    const sources = segments.map((segment) => ({
      title: segment.fileName || "Document source",
      description: segment.text || "",
      fileType: segment.fileName?.split(".").pop()?.toUpperCase() || "FILE",
    }));
    const content = staticSearchError
      ? `Unable to generate a response: ${staticSearchError}`
      : typeof staticSearchResponse?.result === "string" &&
          staticSearchResponse.result.trim()
        ? staticSearchResponse.result
        : segments.length
          ? segments
              .map(
                (segment) =>
                  `**${segment.fileName || "Document source"}${segment.pageNumber ? ` — Page ${segment.pageNumber}` : ""}**\n\n${segment.text || ""}`,
              )
              .join("\n\n")
          : staticSearchResponse?.answer ||
            staticSearchResponse?.response ||
            staticSearchResponse?.message ||
            "No matching document content found.";

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: staticMessageId,
        role: "assistant",
        content,
        sources,
      },
    ]);
    setIsLoading(false);
    setStaticMessageId(null);
  }, [
    staticMessageId,
    staticSearchLoading,
    staticSearchError,
    staticSearchResponse,
  ]);

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
    if (chatMode === "static") {
      setStreamMessageId(null);
      setStaticMessageId(assistantMessageId);
      dispatch(aiSearchAction(message, documentId, selectedVersion));
    } else {
      setStaticMessageId(null);
      setStreamMessageId(assistantMessageId);
      dispatch(chatStreamAction(message, documentId, selectedVersion));
    }
  };

  const handleValueChange = (value) => {
    setInput(value);
  };

  const copyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopiedMessageId(message.id);
      window.setTimeout(() => {
        setCopiedMessageId((current) =>
          current === message.id ? null : current,
        );
      }, 1500);
    } catch {
      setCopiedMessageId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* =========================
        CHAT MESSAGES
        ========================= */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="absolute left-4 top-3 z-20 flex items-center text-[12px]  rounded-full border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur dark:border-[#414141] dark:bg-[#303030]">
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
                  <MessageAvatar
                    src={agentAvatar}
                    alt="AI"
                    fallback="AI"
                    className="mt-1 ring-1 ring-slate-200 dark:ring-[#505050]"
                  />
                )}
                <div className="flex max-w-[80%] flex-col gap-2">
                  <MessageContent
                    markdown={message.role === "assistant"}
                    className={
                      message.role === "user"
                        ? "bg-gray-50 text-black dark:bg-[#383838] dark:text-white text-[14px]"
                        : "bg-gray-50 text-black dark:bg-[#383838] dark:text-white text-[14px]"
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

                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <button
                      type="button"
                      onClick={() => copyMessage(message)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#383838] dark:hover:text-slate-100"
                      aria-label={
                        copiedMessageId === message.id
                          ? "Message copied"
                          : "Copy message"
                      }
                      title={copiedMessageId === message.id ? "Copied" : "Copy"}
                    >
                      {copiedMessageId === message.id ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
                {message.role === "user" && (
                  <MessageAvatar
                    src={userAvatar}
                    alt="You"
                    fallback="You"
                    className="mt-1 ring-1 ring-slate-200 dark:ring-[#505050]"
                  />
                )}
              </Message>
            ))}

            {isLoading && (staticMessageId || streamChunks.length === 0) && (
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

            <PromptInputActions className="justify-between pt-2">
              <div
                ref={versionMenuRef}
                className="relative flex min-w-0 max-w-[75%] items-center gap-1.5 text-[12px]"
              >
                {versionCount > 0 && (
                  <>
                    <button
                      type="button"
                      aria-label="Select document version"
                      aria-expanded={versionMenuOpen}
                      onClick={() => setVersionMenuOpen((open) => !open)}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-[#414141] dark:bg-[#383838] dark:text-slate-300 dark:hover:bg-[#414141]"
                    >
                      <span>v{selectedVersion}</span>
                      <ChevronUp size={13} />
                    </button>
                    {versionMenuOpen && (
                      <div className="absolute bottom-full left-0 z-30 mb-2 min-w-24 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-[#414141] dark:bg-[#303030]">
                        {Array.from({ length: versionCount }, (_, index) => {
                          const version = index + 1;
                          return (
                            <button
                              key={version}
                              type="button"
                              onClick={() => {
                                setSelectedVersion(version);
                                setVersionMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-xs hover:bg-slate-100 dark:hover:bg-[#383838] ${version === selectedVersion ? "font-semibold text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"}`}
                            >
                              v{version}
                              {version === selectedVersion && (
                                <Check size={13} aria-hidden="true" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
                {documentName && (
                  <div
                    className="flex min-w-0 items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-[#414141] dark:bg-[#383838] dark:text-slate-300"
                    title={documentName}
                  >
                    <span className="truncate">{documentName}</span>
                  </div>
                )}
              </div>
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
