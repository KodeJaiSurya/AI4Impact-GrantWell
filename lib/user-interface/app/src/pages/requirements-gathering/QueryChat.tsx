import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "react-bootstrap";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface ChatSession {
  sessionId: string;
  messages: Message[];
  lastUpdated: Date;
}

export default function QueryBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = { role: "bot", content: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Sorry, I couldn't process your request right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add clear chat functionality
  const handleClearChat = () => {
    setMessages([]);
  };

  const TypingIndicator = () => (
    <div
      style={{
        display: "flex",
        gap: "0.3rem",
        padding: "0.5rem",
        alignItems: "center",
      }}
    >
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );

  // Add message timestamps
  const MessageTimestamp = ({ timestamp }: { timestamp: number }) => (
    <small style={{ color: "#666", fontSize: "0.8rem" }}>
      {new Date(timestamp).toLocaleTimeString()}
    </small>
  );

  // Add copy message functionality
  const CopyButton = ({ content }: { content: string }) => (
    <button
      onClick={() => navigator.clipboard.writeText(content)}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "4px",
      }}
    >
      📋
    </button>
  );

  // Add suggested questions/quick replies
  const QuickReplies = () => (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        margin: "1rem 0",
      }}
    >
      {[
        "What are the requirements?",
        "Tell me about deadlines",
        "How to apply?",
      ].map((q) => (
        <button
          key={q}
          onClick={() => setInput(q)}
          style={{
            border: "1px solid #ddd",
            borderRadius: "15px",
            padding: "0.5rem 1rem",
            background: "white",
            cursor: "pointer",
          }}
        >
          {q}
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "300px",
        backgroundColor: "#f2f2f2",
        borderLeft: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          padding: "0.75rem 1rem",
          backgroundColor: "#9e8e89",
          borderBottom: "1px solid #8d7e79",
          color: "#000",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        How Can I Assist You Today?
      </div>

      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "0.5rem",
              textAlign: msg.role === "user" ? "right" : "left",
              color: msg.role === "user" ? "#006499" : "#333",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor: msg.role === "user" ? "#e3f2fd" : "#fff",
                padding: "0.5rem 0.75rem",
                borderRadius: "10px",
                maxWidth: "85%",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messageEndRef} />
      </div>

      {/* Buttons */}
      {/* <div style={{ padding: "0 1rem" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <Button
            variant="light"
            onClick={() => setInput("What are the eligibility criteria?")}
          >
            Check My Eligibility
          </Button>
          <Button
            variant="light"
            onClick={() => setInput("Suggest other similar grants.")}
          >
            Suggest More Grants
          </Button>
          <Button
            variant="light"
            onClick={() => setInput("Explain this grant in a simple way.")}
          >
            Explain Me in a Simple Way
          </Button>
          <Button
            variant="light"
            onClick={() => setInput("What is the deadline?")}
          >
            Eg. (Ask specific question)
          </Button>
        </div>
      </div> */}

      {/* Input Bar */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #ccc",
          backgroundColor: "#f2f2f2",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: "50px",
            padding: "0.5rem 1rem",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          }}
        >
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
              color: "#333",
            }}
          />
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginLeft: "0.75rem",
            }}
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>...</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = `
  .typing-dot {
    width: 8px;
    height: 8px;
    background: #9e8e89;
    border-radius: 50%;
    animation: typing 1s infinite ease-in-out;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`;
