import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, ChevronDown, LoaderCircle, X } from "lucide-react";
import { getUserAIConfigAction } from "../apis/actions/getUserAIConfigAction";
import { aiSearchAction } from "../apis/actions/aiSearchAction";
import localAIIcon from "../../../resources/localai.png";
import openAIIcon from "../../../resources/openai.png";
import ollamaIcon from "../../../resources/ollama.png";

const PROVIDERS = [
  {
    value: "OLLAMA",
    description: "Run models on your Ollama host.",
    icon: ollamaIcon,
  },
  {
    value: "OPENAI",
    description: "Connect to the OpenAI API.",
    icon: openAIIcon,
  },
  {
    value: "LOCAL",
    description: "Use a local OpenAI-compatible endpoint.",
    icon: localAIIcon,
  },
];

const DEFAULT_CONFIG = {
  type: "LOCAL",
  modelName: "",
  baseURL: "",
  apiKey: "",
};

export default function ConfigModal({
  open,
  onClose,
  onSave,
  loading,
  error,
  successMessage,
}) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [informationMode, setInformationMode] = useState("config");
  const [configLoading, setConfigLoading] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const providerRef = useRef(null);
  const requestedRef = useRef(false);
  const apiRequestObservedRef = useRef(false);
  const aiSearchObservedLoadingRef = useRef(false);
  const dispatch = useDispatch();
  const {
    data: fetchedConfig,
    loading: apiConfigLoading,
    error: configError,
  } = useSelector((state) => state.rootReducer.getUserAIConfig);
  const {
    data: aiSearchResponse,
    loading: aiSearchLoading,
    error: aiSearchError,
  } = useSelector((state) => state.rootReducer.aiSearch);

  useEffect(() => {
    if (!open) {
      requestedRef.current = false;
      apiRequestObservedRef.current = false;
      setConfigLoading(false);
      setConfig(DEFAULT_CONFIG);
      return;
    }
    if (!requestedRef.current) {
      requestedRef.current = true;
      apiRequestObservedRef.current = false;
      setConfig(DEFAULT_CONFIG);
      setConfigLoading(true);
      dispatch(getUserAIConfigAction());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) return;
    if (apiConfigLoading) {
      apiRequestObservedRef.current = true;
      return;
    }
    if (!apiRequestObservedRef.current) return;

    apiRequestObservedRef.current = false;
    setConfigLoading(false);
    if (fetchedConfig) setConfig({ ...DEFAULT_CONFIG, ...fetchedConfig });
  }, [open, apiConfigLoading, fetchedConfig, configError]);

  useEffect(() => {
    if (!testingConnection) return;
    if (aiSearchLoading) {
      aiSearchObservedLoadingRef.current = true;
      return;
    }
    if (!aiSearchObservedLoadingRef.current) return;

    aiSearchObservedLoadingRef.current = false;
    setTestingConnection(false);
    if (aiSearchError) {
      setConnectionResult({ text: aiSearchError, isError: true });
      return;
    }
    const responseText =
      typeof aiSearchResponse === "string"
        ? aiSearchResponse
        : aiSearchResponse?.result;
    setConnectionResult({
      text: responseText || "Connection test completed without a result.",
      isError: false,
    });
  }, [testingConnection, aiSearchLoading, aiSearchError, aiSearchResponse]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!providerRef.current?.contains(event.target)) setProviderOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setConfig((current) => ({ ...current, [name]: value }));
    setConnectionResult(null);
  };

  const testConnection = () => {
    setInformationMode("test");
    setTestingConnection(true);
    aiSearchObservedLoadingRef.current = false;
    setConnectionResult(null);
    dispatch(aiSearchAction("Replay Connection is Working"));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setInformationMode("save");
    setConnectionResult(null);
    onSave({ ...config });
  };

  const informationMessage =
    informationMode === "test"
      ? connectionResult?.text
      : informationMode === "save"
        ? error || successMessage
        : configError || fetchedConfig?.message;
  const informationIsError =
    informationMode === "test"
      ? Boolean(connectionResult?.isError)
      : informationMode === "save"
        ? Boolean(error)
        : Boolean(configError);

  const fieldClassName =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#505050] dark:bg-[#383838] dark:text-slate-100";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading && !configLoading)
          onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-modal-title"
        data-state={open ? "open" : "closed"}
        className="settings-dialog w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#414141] dark:bg-[#303030]"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="config-modal-title" className="text-lg font-semibold">
              Model Configuration
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Configure the model provider used for document chat.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || configLoading}
            aria-label="Close configuration"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-[#383838]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Type
            <div className="relative mt-1.5" ref={providerRef}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={providerOpen}
                aria-label={`Provider: ${config.type}`}
                onClick={() => setProviderOpen((open) => !open)}
                disabled={configLoading || loading}
                onKeyDown={(event) => {
                  if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                    event.preventDefault();
                    const currentIndex = PROVIDERS.findIndex(
                      (provider) => provider.value === config.type,
                    );
                    const step = event.key === "ArrowDown" ? 1 : -1;
                    const nextIndex =
                      (currentIndex + step + PROVIDERS.length) %
                      PROVIDERS.length;
                    setConfig((current) => ({
                      ...current,
                      type: PROVIDERS[nextIndex].value,
                    }));
                    setProviderOpen(true);
                  } else if (event.key === "Escape") {
                    setProviderOpen(false);
                  }
                }}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-left outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#505050] dark:bg-[#383838] dark:hover:border-[#666]"
              >
                <span className="flex items-center gap-3">
                  <img
                    src={
                      PROVIDERS.find(
                        (provider) => provider.value === config.type,
                      )?.icon
                    }
                    alt=""
                    className="h-9 w-9 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {config.type}
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                      {
                        PROVIDERS.find(
                          (provider) => provider.value === config.type,
                        )?.description
                      }
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={17}
                  className={`text-slate-400 transition-transform ${providerOpen ? "rotate-180" : ""}`}
                />
              </button>

              {providerOpen && (
                <div
                  role="listbox"
                  aria-label="Model provider"
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-[#505050] dark:bg-[#303030]"
                >
                  {PROVIDERS.map((provider) => {
                    const selected = config.type === provider.value;
                    return (
                      <button
                        key={provider.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setConfig((current) => ({
                            ...current,
                            type: provider.value,
                          }));
                          setProviderOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left transition ${selected ? "bg-blue-50 dark:bg-[#3b3b3b]" : "hover:bg-slate-50 dark:hover:bg-[#383838]"}`}
                      >
                        <span className="flex items-center gap-3">
                          <img
                            src={provider.icon}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
                          />
                          <span>
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                              {provider.value}
                            </span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                              {provider.description}
                            </span>
                          </span>
                        </span>
                        {selected && (
                          <Check
                            size={16}
                            className="text-blue-600 dark:text-blue-300"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </label>

          <label className="block text-sm font-medium">
            Model name
            <input
              name="modelName"
              value={config.modelName}
              onChange={updateField}
              required
              disabled={configLoading || loading}
              placeholder="llama-3.2-3b-instruct"
              className={fieldClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Base URL
            <input
              name="baseURL"
              type="url"
              value={config.baseURL}
              onChange={updateField}
              required
              disabled={configLoading || loading}
              placeholder="http://127.0.0.1:1234/v1"
              className={fieldClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            API key
            <input
              name="apiKey"
              type="password"
              value={config.apiKey}
              onChange={updateField}
              autoComplete="off"
              disabled={configLoading || loading}
              placeholder="sk-xxxxxxxxxxxxxxx"
              className={fieldClassName}
            />
          </label>

          <div
            role={informationIsError ? "alert" : "status"}
            aria-live="polite"
            className={`min-h-10 rounded-lg border px-3 py-2 text-center text-sm ${informationIsError ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"}`}
          >
            {informationMessage || (
              <span
                aria-hidden="true"
                className="select-none blur-[3px] animate-[generated-text-shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,#64748b_0%,#ffffff_45%,#64748b_100%)] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(90deg,#94a3b8_0%,#ffffff_45%,#94a3b8_100%)]"
              >
                Configuration updated successfully
              </span>
            )}
          </div>

          <div className="flex justify-end text-[12px] gap-2 border-t border-slate-200 pt-4 dark:border-[#414141]">
            <button
              type="button"
              onClick={testConnection}
              disabled={testingConnection || configLoading || loading}
              className="mr-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 dark:bg-[#454545] dark:hover:bg-[#555555]"
            >
              {testingConnection ? (
                <span className="flex w-full items-center justify-center">
                  <span className="animate-[generated-text-shimmer_1.6s_linear_infinite] bg-[linear-gradient(90deg,#ffffff_0%,#93c5fd_45%,#ffffff_100%)] bg-[length:200%_100%] bg-clip-text text-transparent">
                    Testing…
                  </span>
                </span>
              ) : (
                "Test Connection"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading || configLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-[#505050] dark:text-slate-300 dark:hover:bg-[#383838]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || configLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 dark:bg-[#454545] dark:text-slate-100 dark:hover:bg-[#555555]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle size={16} className="animate-spin" />
                  Saving…
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
