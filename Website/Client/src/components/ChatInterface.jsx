import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, User } from "lucide-react";
import ReactMarkdown from "react-markdown"; // To render markdown content

export default function LawbotChat() {
  const [messages, setMessages] = useState([
    { sender: "Lawbot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]); // To hold past queries
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [queriesAndResponses, setQueriesAndResponses] = useState([]); // Store queries and responses from API

  // Fetch user details and their queries/responses
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:8000/api/v1/getUser", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        if (data.success) {
          setQueriesAndResponses(data.data.user.queriesAndResponses);
        } else {
          console.error("Error fetching user details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const newMessages = [...messages, { sender: "You", text: input }];
    setMessages(newMessages);
    setHistory([...history, input]);
    setInput("");

    setIsLoading(true); // Start loading animation

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8000/api/v1/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "Lawbot", text: data.data.aiResponse },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "Lawbot", text: "Error processing query." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "Lawbot", text: "Failed to connect to the server." },
      ]);
    } finally {
      setIsLoading(false); 
    }
  };

  const handlePreviousQueryClick = (query, response) => {
    setMessages([
      { sender: "You", text: query }, 
      { sender: "Lawbot", text: response }, 
    ]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-16 h-16">
            <User className="w-16 h-16 text-gray-500" />
          </Avatar>
          <h2 className="text-lg font-semibold">User</h2>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Previous Questions
          </h3>
          <ScrollArea className="h-64 border rounded p-2">
            {queriesAndResponses.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm p-2 border-b cursor-pointer"
                onClick={() => handlePreviousQueryClick(item.query, item.response)}
              >
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span>{item.query}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <ScrollArea className="flex-1 p-4 border rounded bg-white shadow-md">
          {messages.map((msg, index) => (
            <Card
              key={index}
              className={`mb-2 w-[80%] ${msg.sender === "You" ? "ml-auto bg-blue-100" : "bg-gray-100"}`}
            >
              <CardContent className="p-2">
                <strong>{msg.sender}:</strong>
                <div className="whitespace-pre-wrap">
                  {/* Render markdown in AI response */}
                  {msg.sender === "Lawbot" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {isLoading && (
            <div className="flex justify-center items-center my-4">
              <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-gray-200 rounded-full"></div> {/* Spinner */}
            </div>
          )}
        </ScrollArea>
        <div className="flex items-center gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
