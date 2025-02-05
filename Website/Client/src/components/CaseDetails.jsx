import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gavel, BookOpen, Scale, FileText, AlertTriangle } from "lucide-react";
import CaseUpload from './LawyerInput';  // Import CaseUpload component
import { Button } from '@/components/ui/Button'; // Import Button component

const CaseDetail = ({ caseId }) => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);  // State to track errors
  const [isEditing, setIsEditing] = useState(false);  // State to manage edit mode

  useEffect(() => {
    const fetchData = async () => {
      const authToken = localStorage.getItem('authToken');  // Get the token from localStorage

      try {
        const response = await fetch(`http://localhost:8000/api/v1/get_case_data/${caseId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,  // Include the token in the Authorization header
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setCaseData(data.data);  // Set the response data to state
          } else {
            setError(true); // If no data, set error to true
          }
        } else {
          setError(true); // If response is not ok, set error to true
        }
      } catch (error) {
        console.error('Error fetching case data:', error);
        setError(true); // If fetch fails, set error to true
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caseId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <CaseUpload caseId={caseId} />;
  }
  if(isEditing){
    return <CaseUpload caseId={caseId} />;
  }

  if (!caseData || !caseData["Case Analysis"]) {
    return <div className="text-center text-lg text-red-600">No case data found</div>;
  }

  const { "Case Analysis": caseAnalysis, Cases } = caseData;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* <h1 className="text-3xl font-bold mb-6">Legal Case Dashboard</h1> */}
      <Button onClick={() => setIsEditing(true)} className="mt-6">
        Edit Case
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2" />
              Key Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {caseAnalysis.key_issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" />
              Laws Cited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {caseAnalysis.laws_cited.map((law, index) => (
                  <li key={index}>{law}</li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="mr-2" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            {caseAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2" />
            Case Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{caseAnalysis.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gavel className="mr-2" />
            Related Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Case</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Cases.flatMap((caseGroup, index) =>
                  caseGroup.cases.map((caseItem, index) => (
                      <TableRow key={`${caseGroup.keyword}-${index}`}>
                      {index === 0 && (
                          <TableCell rowSpan={caseGroup.cases.length}>
                          <Badge>{caseGroup.keyword}</Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <a
                          href={caseItem.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          >
                          {caseItem.text}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Button */}
     
      {/* Show CaseUpload component if editing */}
      
    </div>
  );
};

export default CaseDetail;
