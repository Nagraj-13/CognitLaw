import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConversationInput from "@/components/ConversationInput"
import ResearchDetails from "@/components/ResearchDetails"

export default function CaseDetails() {
  const params = useParams()
  const [caseData, setCaseData] = useState(null)

  useEffect(() => {
    // TODO: Fetch case data from API
    setCaseData({
      id: params.id,
      title: "Sample Case",
      date: "2023-06-15",
      status: "Active",
    })
  }, [params.id])

  const handleConversationSubmit = (conversation) => {
    setCaseData((prevData) => {
      if (!prevData) return null
      return { ...prevData, conversation }
    })
    // TODO: Trigger research agent
  }

  if (!caseData) return <div>Loading...</div>;

  return (
    (<div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{caseData.title}</h1>
      <div className="mb-4">
        <p>Date: {caseData.date}</p>
        <p>Status: {caseData.status}</p>
      </div>
      <Tabs defaultValue="conversation" className="mb-6">
        <TabsList>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="research">Research Details</TabsTrigger>
        </TabsList>
        <TabsContent value="conversation">
          {caseData.conversation ? (
            <div className="whitespace-pre-wrap border p-4 rounded-md">{caseData.conversation}</div>
          ) : (
            <ConversationInput onSubmit={handleConversationSubmit} />
          )}
        </TabsContent>
        <TabsContent value="research">
          {caseData.researchDetails ? (
            <ResearchDetails details={caseData.researchDetails} />
          ) : (
            <div>Research details not available.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>)
  );
}

