import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

const PROVIDERS = [
  { value: "OLLAMA", description: "Run models on your Ollama host." },
  { value: "OPENAI", description: "Connect to the OpenAI API." },
  { value: "LOCAL", description: "Use a local OpenAI-compatible endpoint." },
];

const DEFAULT_CONFIG = {
  type: "LOCAL",
  modelName: "llama-3.2-3b-instruct",
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "",
};

export default function ConfigModal({
  onClose,
  onSave,
  loading,
  error,
  success,
}) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [providerOpen, setProviderOpen] = useState(false);
  const providerRef = useRef(null);

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
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({ ...config });
  };

  const fieldClassName =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#505050] dark:bg-[#383838] dark:text-slate-100";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-modal-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#414141] dark:bg-[#303030]"
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
            disabled={loading}
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
                onKeyDown={(event) => {
                  if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                    event.preventDefault();
                    const currentIndex = PROVIDERS.findIndex(
                      (provider) => provider.value === config.type,
                    );
                    const step = event.key === "ArrowDown" ? 1 : -1;
                    const nextIndex =
                      (currentIndex + step + PROVIDERS.length) % PROVIDERS.length;
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
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {config.type.slice(0, 2)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {config.type}
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                      {PROVIDERS.find((provider) => provider.value === config.type)?.description}
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
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold ${selected ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" : "bg-slate-100 text-slate-600 dark:bg-[#414141] dark:text-slate-300"}`}>
                            {provider.value.slice(0, 2)}
                          </span>
                          <span>
                            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                              {provider.value}
                            </span>
                            <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                              {provider.description}
                            </span>
                          </span>
                        </span>
                        {selected && <Check size={16} className="text-blue-600 dark:text-blue-300" />}
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
              className={fieldClassName}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="text-sm text-emerald-600 dark:text-emerald-400"
            >
              Configuration saved.
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-[#414141]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-[#505050] dark:text-slate-300 dark:hover:bg-[#383838]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 dark:bg-[#454545] dark:text-slate-100 dark:hover:bg-[#555555]"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
