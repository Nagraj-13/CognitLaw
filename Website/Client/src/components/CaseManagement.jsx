import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CaseCard } from "./CaseCard"; // This will be the individual case component
import { CreateCaseModal } from "./CreateCaseModal"; // This is the modal to create a new case

export function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch cases for the lawyer on component mount
  useEffect(() => {
    const fetchCases = async () => {
      const response = await fetch("/api/v1/cases"); // Replace with your API endpoint
      const data = await response.json();
      setCases(data.data); // Assuming data is in `data` field
    };

    fetchCases();
  }, []);

  const handleCreateCase = () => {
    setShowModal(true);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Case Management</h3>
      <Button onClick={handleCreateCase} className="mb-4">
        Create Case
      </Button>

      {cases.length === 0 ? (
        <p>No cases found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem._id} caseData={caseItem} />
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      {showModal && <CreateCaseModal setShowModal={setShowModal} />}
    </div>
  );
}
