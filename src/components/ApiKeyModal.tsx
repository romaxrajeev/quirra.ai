import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface ApiKeyModalProps {
  isOpen: boolean;
  onSubmit: (apiKey: string) => void;
}

export function ApiKeyModal({ isOpen, onSubmit }: ApiKeyModalProps) {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const validateApiKey = (key: string): boolean => {
    // OpenAI API keys start with 'sk-' and are typically 51 characters long
    if (!key.startsWith("sk-")) {
      setError("API key must start with 'sk-'");
      return false;
    }
    if (key.length < 40 || key.length > 60) {
      setError("Invalid API key length");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      setError("Please enter your OpenAI API key");
      return;
    }

    if (!validateApiKey(trimmedKey)) {
      return;
    }

    onSubmit(trimmedKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Enter OpenAI API Key
        </h2>
        <p
          className={`mb-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Please enter your OpenAI API key to continue. Your key will be stored
          locally and never sent to our servers.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setError("");
            }}
            placeholder="sk-..."
            className={`w-full px-4 py-2 rounded-lg border mb-2 ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
