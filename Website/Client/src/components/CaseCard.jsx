export function CaseCard({ caseData }) {
    return (
      <div className="p-4 border rounded shadow-md">
        <h4 className="text-lg font-semibold">{caseData.issue}</h4>
        <p className="text-sm text-gray-500">Status: {caseData.caseStatus}</p>
        <p className="text-sm text-gray-400">Created: {new Date(caseData.createdAt).toLocaleDateString()}</p>
      </div>
    );
  }
  