import { useState, useRef, useEffect } from "react";
import { Navbar } from "./Navbar";
import { useTheme } from "@/context/ThemeContext";
import OpenAI from "openai";
import { Loader2, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ApiKeyModal } from "./ApiKeyModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Question {
  id: string;
  text: string;
}

interface Answer {
  question: string;
  answer: string;
}

// This will be replaced with your actual questions in the next prompt
const questions: Question[] = [
  {
    id: "q1",
    text: "What is the title of the feature?",
  },
  {
    id: "q2",
    text: "What is the main objective or goal of this feature? (What problem does it solve or what value does it provide?)",
  },
  {
    id: "q3",
    text: "Who are the primary users or roles that will interact with this feature? (e.g., user, admin, guest, moderator)",
  },
  {
    id: "q4",
    text: "What is the high-level user flow? (Describe the sequence of steps a user takes to use the feature)",
  },
  {
    id: "q5",
    text: "What is the expected outcome when the feature is used successfully?",
  },
  {
    id: "q6",
    text: "Are there any key success metrics or business goals tied to this feature?",
  },
  {
    id: "q7",
    text: "What inputs or fields are required for this feature? (e.g., title, email, due date)",
  },
  {
    id: "q8",
    text: "For each input, what are the rules? (e.g., required?, data type?, max/min length?, allowed values?)",
  },
  {
    id: "q9",
    text: "Are any fields optional or conditionally required?",
  },
  {
    id: "q10",
    text: "What are common or important validations to perform?",
  },
  {
    id: "q11",
    text: "Are there default values for any fields?",
  },
  {
    id: "q12",
    text: "Who is allowed to perform this action? (e.g., only project owners, only logged-in users)",
  },
  {
    id: "q13",
    text: "Are there any restrictions or forbidden actions based on user roles or permissions?",
  },
  {
    id: "q14",
    text: "What should happen if an invalid input is provided? (e.g., too long title, missing field)",
  },
  {
    id: "q15",
    text: "What should happen if the user is not authenticated or authorized?",
  },
  {
    id: "q16",
    text: "Are there specific edge cases that should be handled gracefully? (e.g., due date in the past, creating duplicate items)",
  },
  {
    id: "q17",
    text: "If there's an API, what's the endpoint and method? (e.g., POST /tasks, GET /projects/:id)",
  },
  {
    id: "q18",
    text: "What are the success and error responses? (e.g., 201 Created, 400 Bad Request, 403 Forbidden)",
  },
  {
    id: "q19",
    text: "Can you write 2-3 acceptance scenarios in the Given-When-Then format? (This helps us build test cases automatically)",
  },
  {
    id: "q20",
    text: "Are there any feature dependencies, blockers, or limitations to document?",
  },
];

const initialMessage: Message = {
  role: "assistant",
  content:
    "👋 Hi! I'm Quirra, your Product Management assistant. I'll help you create comprehensive user stories and PRDs (Product Requirements Documents) by asking you a series of targeted questions. This will help us gather all the necessary information to create a well-structured document. Let's start with your product idea or feature - what would you like to work on?",
};

const formatQnA = (answers: Answer[]): string => {
  return answers.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n");
};

const generatePrompt = (answers: Answer[]): string => {
  const qnaSection = formatQnA(answers);
  const investPrompt = `
You are a product requirements assistant. You will be given a set of answers from a user who filled out a structured feature intake form. Use this information to generate a high-quality Agile user story that follows the INVEST principle (Independent, Negotiable, Valuable, Estimable, Small, Testable).

Using the inputs, generate a clear and concise user story in the following format:

---
**Title:** [Feature Title]

**User Story:**
As a [primary user or role], I want to [objective/goal], so that [value or benefit].

**High-Level Flow:**
[Summarized user flow based on steps]

**Acceptance Criteria:**  
- Based on the "Given-When-Then" scenarios and validations provided  
- Include expected success and error behaviors  
- Must be testable

**Validations and Rules:**  
- List key rules for inputs and fields (required, type, min/max, default values, etc.)

**Authorization Rules:**  
- Who is allowed or restricted from using this feature

**Edge Cases:**  
- Mention specific edge cases and how the system should behave

**API Endpoint (if any):**  
- [Method and URL]  
- Expected success and error responses

**Dependencies or Limitations:**  
- Any blockers, dependencies, or related notes

**Priority and Business Impact:**  
- Tie to business goals or metrics if mentioned

---

Make sure the final output is suitable for both developers and QA engineers to estimate, develop, and test accurately. Keep it clear, structured, and complete. Here is the list of questions and answers:

${qnaSection}
`.trim();

  return investPrompt;
};

export function Chat() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastMarkdown, setLastMarkdown] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(true);

  const openai = apiKey
    ? new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      })
    : null;

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  // Start with the first question
  useEffect(() => {
    if (currentQuestionIndex === -1) {
      askNextQuestion();
    }
  }, []);

  useEffect(() => {
    console.log(answers);
  }, [answers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input after each message
  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);

  const askNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: questions[nextIndex].text },
      ]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Check if the input is empty or only contains whitespace
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Check if API key is set
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    // Create user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input immediately
    setIsLoading(true);

    // Store the answer
    if (currentQuestionIndex >= 0) {
      const currentAnswer = {
        question: questions[currentQuestionIndex].text,
        answer: input,
      };
      setAnswers((prev) => [...prev, currentAnswer]);

      try {
        // Only make the API call if we've answered all questions
        if (currentQuestionIndex === questions.length - 1) {
          const prompt = generatePrompt([...answers, currentAnswer]);

          const response = await openai?.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a Product Management expert who creates detailed and well-structured PRDs.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const assistantMessage =
            response?.choices[0]?.message?.content ||
            "Sorry, I couldn't generate a response.";
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantMessage },
          ]);
          setLastMarkdown(assistantMessage);
        } else {
          // If not all questions are answered, just ask the next question
          setTimeout(() => {
            askNextQuestion();
          }, 500); // Add a small delay to make the conversation feel more natural
        }
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyMarkdown = () => {
    if (lastMarkdown) {
      navigator.clipboard.writeText(lastMarkdown);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <Navbar />
      <ApiKeyModal isOpen={showApiKeyModal} onSubmit={handleApiKeySubmit} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {index === messages.length - 1 &&
              message.role === "assistant" &&
              currentQuestionIndex === questions.length - 1 ? (
                <div className="relative">
                  <button
                    onClick={handleCopyMarkdown}
                    className="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Copy markdown"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className={`p-4 border-t ${
          theme === "dark"
            ? "border-gray-700 bg-gray-900"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response here..."
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-medium flex items-center space-x-2 ${
              isLoading || !input.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
