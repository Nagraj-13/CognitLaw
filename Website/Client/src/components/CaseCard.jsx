export function CaseCard({ caseData }) {
  return (
    <div className="p-6 bg-white border border-gray-300 rounded-2xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold text-gray-900">{caseData.issue}</h4>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            caseData.caseStatus === "Open"
              ? "bg-green-100 text-green-700"
              : caseData.caseStatus === "Closed"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {caseData.caseStatus}
        </span>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed">
        {caseData.description || "No additional details provided."}
      </p>

      <div className="mt-4 text-gray-500 text-xs flex justify-between">
        <p>Created: {new Date(caseData.createdAt).toLocaleDateString()}</p>
        <p>Last Updated: {new Date(caseData.updatedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
