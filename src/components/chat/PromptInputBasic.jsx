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

import { useState } from "react";

export function PromptInputBasic() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Temporary in-memory chat
  const [messages, setMessages] = useState([]);

  const handleSubmit = () => {
    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "This is a temporary AI response. Later you can replace this with your actual API response.",
        sources: [
          {
            href: "https://www.wikipedia.org",
            title: "Wikipedia",
            description:
              "Wikipedia is a free encyclopedia containing information on a wide range of topics.",
          },
          {
            href: "https://github.com/ibelick/prompt-kit",
            title: "Prompt Kit",
            description:
              "Customizable components for building AI applications and chat interfaces.",
          },
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1200);
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
        <ChatContainerRoot className="h-full w-full">
          <ChatContainerContent className="mx-auto flex w-full max-w-(--breakpoint-md) flex-col gap-6 px-4 py-6">
            {messages.length === 0 && (
              <div className="flex min-h-[300px] items-center justify-center">
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
                {/* AI Avatar */}
                {message.role === "assistant" && (
                  <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
                )}

                <div className="flex max-w-[80%] flex-col gap-2">
                  {/* Message */}
                  <MessageContent
                    markdown={message.role === "assistant"}
                    className={
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-transparent p-0"
                    }
                  >
                    {message.content}
                  </MessageContent>

                  {/* Sources */}
                  {message.role === "assistant" &&
                    message.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, index) => (
                          <Source
                            key={`${message.id}-source-${index}`}
                            href={source.href}
                          >
                            <SourceTrigger showFavicon />

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

            {/* Loading message */}
            {isLoading && (
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

          {/* =========================
              SCROLL TO BOTTOM
              ========================= */}
          <div className="absolute bottom-4 right-6">
            <ScrollButton />
          </div>
        </ChatContainerRoot>
      </div>

      {/* =========================
          PROMPT INPUT
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
