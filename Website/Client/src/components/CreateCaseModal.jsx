import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateCaseModal({ setShowModal }) {
  const [issue, setIssue] = useState("");
  const [caseStatus, setCaseStatus] = useState("Open");

  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You must be logged in to create a case.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/v1/createCase", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue: issue,
          caseStatus: caseStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Case created successfully!");
        setShowModal(false); // Close the modal after successful creation
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Error creating case.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => setShowModal(false)}>
      <DialogTrigger asChild>
        {/* Invisible trigger */}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issue">Issue</Label>
            <Input
              id="issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe the issue"
              required
            />
          </div>
          <div>
            <Label htmlFor="caseStatus">Case Status</Label>
            <select
              id="caseStatus"
              value={caseStatus}
              onChange={(e) => setCaseStatus(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <Button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Case
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
