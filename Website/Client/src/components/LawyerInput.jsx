import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/Button';  // Importing the Button component
import Spinner from '@/components/ui/Spinner';  // Import the custom Spinner component
import { ScrollArea } from "./ui/scroll-area";

export default function CaseManagement({ caseId }) {
  const [audioFile, setAudioFile] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [manualText, setManualText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioProcessed, setIsAudioProcessed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);  // For button loading state

  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/getConversation/${caseId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.data?.Conversations?.conversation?.length) {
            setConversation(data.data.Conversations.conversation);
          }
        } else {
          console.error("Failed to fetch conversation");
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };
    fetchConversation();
  }, [caseId, authToken]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);  // Append the file as 'file'
      formData.append("file_id", caseId);  // Send the caseId as 'file_id'

      try {
        // Send the form data to Flask server
        const response = await fetch("http://127.0.0.1:5000/process_audio", {
          method: "POST",
          body: formData,  // Directly sending the FormData
        });

        if (response.ok) {
          const data = await response.json();
          setConversation([`Transcribed text from ${file.name}`]);
          setIsAudioProcessed(true);  // Enable "Process Audio" button after successful upload
        } else {
          console.error("Error uploading audio");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleManualTextChange = (event) => {
    const text = event.target.value;
    setManualText(text);
    setConversation(text ? text.split("\n") : []);
  };

  const handleConversationProcessing = async () => {
    setIsProcessing(true);  // Set processing to true while the request is in progress
    try {
      const response = await fetch(`http://localhost:8000/api/v1/process_conversation/${caseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ conversation }),
      });

      if (response.ok) {
        console.log("Conversation processed successfully");
      } else {
        console.error("Error processing conversation");
      }
    } catch (error) {
      console.error("Error processing conversation:", error);
    } finally {
      setIsProcessing(false);  // Set processing to false when the request is complete
    }
  };

  return (
    <div className="container mx-auto">
      {/* <h1 className="text-2xl font-bold mb-4">Case Management</h1> */}
      
      <Tabs defaultValue="audio" className="">
        <TabsList>
          <TabsTrigger value="audio">Audio Upload</TabsTrigger>
          <TabsTrigger value="text">Conversation </TabsTrigger>
        </TabsList>

        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
              <CardDescription>Upload an audio file of the conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="mb-4" />
              {isLoading && <p className="text-sm text-blue-600">Processing audio...</p>}
              {!conversation.length && !audioFile && <p className="text-red-600">Please upload an audio file or enter conversation text.</p>}
              {audioFile && !isAudioProcessed && (
                <Button
                  onClick={handleConversationProcessing}
                  className="mt-4"
                  disabled={isLoading || isAudioProcessed}  // Disable the button while processing
                >
                  {isLoading ? <Spinner /> : "Process Audio"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
        <Button
                onClick={handleConversationProcessing}
                className="m-2"
                disabled={isProcessing}  // Disable the button while processing
              >
                {isProcessing ? <Spinner /> : "Process Conversation"}
              </Button>
          <Card>
            <CardHeader>
              <CardTitle>Conversation Text</CardTitle>
              <CardDescription>View transcribed text or enter manually</CardDescription>
            </CardHeader>

            <CardContent>
              {conversation.length > 0 ? (
                <div>
                  <ScrollArea className="h-[55vh]">
                  {conversation.map((entry, index) => (
                    <div key={index} className="mb-2">
                      <strong>{entry.speaker}:</strong> {entry.transcription}
                    </div>
                  ))}
                 </ScrollArea>
                </div>
              ) : (
                <ScrollArea>
                <Textarea
                  placeholder="Transcribed text will appear here, or you can type manually"
                  value={manualText}
                  onChange={handleManualTextChange}
                  rows={10}
                  className="w-screen h-screen"
                />
                </ScrollArea>
              )}
              
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
