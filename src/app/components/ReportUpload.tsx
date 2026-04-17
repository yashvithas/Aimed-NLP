import { Upload, FileText } from "lucide-react";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useState } from "react";
import React from "react";

interface ReportUploadProps {
  onFileSelect: (file: File | null) => void;
}

export function ReportUpload({ onFileSelect }: ReportUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || null);
    onFileSelect(file);
  };

  return (
    <Card className="border-2 border-teal-100">
      <CardHeader>
        <CardTitle className="text-teal-700">Upload Medical Report</CardTitle>
        <CardDescription>Scanned reports will be processed using OCR if required.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-teal-400 transition-colors cursor-pointer bg-gray-50">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-12 h-12 text-teal-500 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, TXT
              </p>
            </label>
          </div>
          {fileName && (
            <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <FileText className="w-5 h-5 text-teal-600" />
              <span className="text-sm text-teal-800">{fileName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
