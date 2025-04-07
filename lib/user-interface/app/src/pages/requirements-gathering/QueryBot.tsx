import { Button } from "react-bootstrap";

export default function QueryBot() {
  return (
    <div
      style={{
        flexShrink: 0,
        width: "300px",
        height: "630px",
        backgroundColor: "#f2f2f2",
        borderLeft: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Chatbot Sidebar */}
      <div
        style={{
          fontWeight: "bold",
          padding: "0.75rem 1rem",
          backgroundColor: "#9e8e89",
          borderBottom: "1px solid #8d7e79",
          color: "#000000",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        How Can I Assist You Today?
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Button variant="link">Check My Eligibility</Button>
        <Button variant="link">Suggest More Grants</Button>
        <Button variant="link">Explain me in a simple way</Button>
        <Button variant="link">Eg. (Ask specific question)</Button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: "50px",
            padding: "0.5rem 1rem",
            boxShadow: "0 0 4px rgba(0,0,0,0.1)",
            marginTop: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Type your question..."
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
            onClick={() => {
              // placeholder: add your send logic here
              console.log("Send clicked");
            }}
          >
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
          </button>
        </div>
      </div>
    </div>
  );
}
