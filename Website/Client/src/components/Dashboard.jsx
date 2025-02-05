import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CaseCard } from "./CaseCard";
import CreateCaseModal from "./CreateCaseModal"; // Import CreateCaseModal
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import CaseDetail from "./CaseDetails"; // Import the new CaseDetail component
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null); 

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCases = async () => {
      if (!token) {
        setError("No authorization token found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/v1/getCases", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setCases(data.data);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("Error fetching cases.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [token]);

  const fetchResponse = async () => {
    if (!query) return;
    setIsLoadingResponse(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        setResponse(data.data.aiResponse); // Set AI response data for rendering
      } else {
        setResponse("Sorry, we couldn't fetch an answer for that.");
      }
    } catch (error) {
      setResponse("Error fetching response.");
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleCreateCase = () => {
    setShowModal(true);
  };

  const handleCaseClick = (caseId) => {
    setSelectedCaseId(caseId); // Set selected case ID
  };

  const handleBackToCases = () => {
    setSelectedCaseId(null); // Reset selected case ID to go back to case management
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Chat Section */}
      <div className="w-1/4 bg-white shadow-lg p-6 flex flex-col">
        <h3 className="text-xl font-semibold mb-4">Chat Interface</h3>
        <ScrollArea className="flex-1 p-4 border rounded bg-gray-100 shadow-md">
          <div className="mt-4">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2 mt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={fetchResponse}>Send</Button>
        </div>
      </div>

      {/* Main Content */}
      
      <div className="w-3/4 p-6">
        {selectedCaseId ? (
          <>
             <ScrollArea className='h-screen'>
            <Button onClick={handleBackToCases} className="mb-4 bg-gray-500 text-white">Back to Cases</Button>
            <CaseDetail caseId={selectedCaseId} />
            </ScrollArea>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Case Management</h3>
            <Button
              onClick={handleCreateCase}
              className="mb-6 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Create New Case
            </Button>
            {cases.length === 0 ? (
              <p className="text-lg text-gray-600">No cases found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((caseItem) => (
                  <div
                    key={caseItem._id}
                    className="cursor-pointer hover:shadow-xl"
                    onClick={() => handleCaseClick(caseItem.caseId)} // Add click handler
                  >
                    <CaseCard caseData={caseItem} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {/* Create Case Modal */}
        {showModal && <CreateCaseModal setShowModal={setShowModal} />}
      </div>
    </div>
  );
} 