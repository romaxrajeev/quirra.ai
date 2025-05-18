import { useState, useRef, useEffect } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { Navbar } from "./Navbar";
import { useTheme } from "@/context/ThemeContext";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Question {
  id: string;
  text: string;
}

interface Answer {
  questionId: string;
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

export function Chat() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(answers);
  }, [answers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

    // Create user message with markdown content
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Store the answer with the markdown content
    if (currentQuestionIndex >= 0) {
      const currentAnswer = {
        questionId: questions[currentQuestionIndex].id,
        answer: input, // This is markdown content from RichTextEditor
      };
      setAnswers((prev) => [...prev, currentAnswer]);

      try {
        // Only make the API call if we've answered all questions
        if (currentQuestionIndex === questions.length - 1) {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [...messages, userMessage],
              answers: [...answers, currentAnswer],
            }),
          });

          if (!response.ok) throw new Error("Failed to get response");

          // Add an empty assistant message that we'll update with streaming content
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) throw new Error("No reader available");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.content;
                  if (content) {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      if (lastMessage.role === "assistant") {
                        lastMessage.content += content;
                      }
                      return newMessages;
                    });
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e);
                }
              }
            }
          }
        } else {
          // If not all questions are answered, just ask the next question
          askNextQuestion();
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

  const markdownComponents: Components = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
    ol: ({ children }) => (
      <ol className="list-decimal pl-4 mb-2">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <Navbar />
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
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
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
        <div className="flex flex-col space-y-4">
          <RichTextEditor
            value={input}
            onChange={setInput}
            placeholder="Type your response here... You can use bold, italic, underline, and bullet points to format your text."
            disabled={isLoading}
            onSubmit={handleSubmit}
          />
        </div>
      </form>
    </div>
  );
}
