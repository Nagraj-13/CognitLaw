import { useState } from "react"
import {Link} from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const mockCases = [
  { id: "1", title: "Smith vs. Johnson", date: "2023-05-15", status: "Active" },
  { id: "2", title: "Brown Estate Dispute", date: "2023-06-01", status: "Pending" },
  { id: "3", title: "Green Corp Lawsuit", date: "2023-06-10", status: "Closed" },
]

export default function CaseList() {
  const [cases, setCases] = useState(mockCases)

  return (
    (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cases.map((case_) => (
        <Link href={`/cases/${case_.id}`} key={case_.id}>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{case_.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {case_.date}</p>
              <p>Status: {case_.status}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>)
  );
}

