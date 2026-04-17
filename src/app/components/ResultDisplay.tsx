import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Activity, AlertCircle } from "lucide-react";
import React from "react";

interface ResultDisplayProps {
  symptoms: string[];
  prediction: {
    condition: string;
    confidence: number;
    description: string;
  };
}

export function ResultDisplay({ symptoms, prediction }: ResultDisplayProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Extracted Symptoms */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Activity className="w-5 h-5" />
            Extracted Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1"
              >
                {symptom}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predicted Health Issue */}
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <AlertCircle className="w-5 h-5" />
            Predicted Health Issue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl text-teal-900 whitespace-pre-line leading-relaxed">
            {prediction.description}</h3>
            {/* <div className="text-xl text-teal-900 whitespace-pre-line leading-relaxed">
            {prediction.description}
            </div> */}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confidence Level</span>
              <span className="text-sm text-teal-700">{prediction.confidence}%</span>
            </div>
            <Progress value={prediction.confidence} className="h-3" />
          </div>

          <div className="flex items-center gap-2 p-3 bg-teal-100 rounded-lg border border-teal-300">
            <div className={`w-3 h-3 rounded-full ${
              prediction.confidence >= 70 ? 'bg-green-500' : 
              prediction.confidence >= 50 ? 'bg-yellow-500' : 
              'bg-orange-500'
            }`} />
            <span className="text-sm text-teal-900">
              {prediction.confidence >= 70 ? 'High confidence' : 
               prediction.confidence >= 50 ? 'Moderate confidence' : 
               'Low confidence - further examination recommended'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
