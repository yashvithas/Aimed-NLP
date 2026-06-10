import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { SymptomInput } from "./components/SymptomInput";
import { ReportUpload } from "./components/ReportUpload";
import { ResultDisplay } from "./components/ResultDisplay";
import { LoadingState } from "./components/LoadingState";
import { MedicalDisclaimer } from "./components/MedicalDisclaimer";
import { Activity, FileText, Sparkles } from "lucide-react";
import React from "react";


const analyzeInput = async (
  symptoms: string | null,
  file: File | null,
  language: string
): Promise<{
  symptoms: string[];
  prediction: {
    condition: string;
    confidence: number;
    description: string;
  };
}> => {

  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  } else if (symptoms) {
    formData.append("symptoms", symptoms);
  } else {
    throw new Error("No input provided");
  }

  formData.append("language", language);

  const res = await fetch("https://aimed-nlp.onrender.com/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("AI analysis failed");
  }

  const data = await res.json();

  return {
    symptoms: data.symptoms_identified ?? [],
    prediction: {
      condition: data.predicted_issue ?? "Unknown",
      confidence: data.confidence ?? 75,
      description: data.predicted_issue ?? "",
    },
  };
};

/* ---------------- APP COMPONENT ---------------- */

export default function App() {
  const [activeTab, setActiveTab] = useState<"symptoms" | "upload">("symptoms");
  const [symptomText, setSymptomText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [results, setResults] = useState<{
    symptoms: string[];
    prediction: {
      condition: string;
      confidence: number;
      description: string;
    };
  } | null>(null);

  const handleAnalyze = async () => {
    if (activeTab === "symptoms" && !symptomText.trim()) return;
    if (activeTab === "upload" && !uploadedFile) return;

    setIsLoading(true);
    setResults(null);

    try {
      const analysisResults = await analyzeInput(
        activeTab === "symptoms" ? symptomText : null,
        activeTab === "upload" ? uploadedFile : null,
        language
      );
      setResults(analysisResults);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const canAnalyze =
    activeTab === "symptoms"
      ? symptomText.trim().length > 0
      : uploadedFile !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-8 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl">
              AI Medical Analysis System
            </h1>
          </div>
          <p className="text-teal-100">
            Analyze symptoms or medical reports using AI and NLP
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(v as "symptoms" | "upload")
            }
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="symptoms">
                <FileText className="w-4 h-4 mr-2" />
                Enter Symptoms
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Sparkles className="w-4 h-4 mr-2" />
                Upload Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="symptoms">
              <SymptomInput
                value={symptomText}
                onChange={setSymptomText}
                onLanguageChange={setLanguage}
              />
            </TabsContent>

            <TabsContent value="upload">
              <ReportUpload onFileSelect={setUploadedFile} />
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isLoading}
            className="w-full mt-6"
          >
            Analyze
          </Button>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <LoadingState />
          </div>
        )}

        {results && !isLoading && (
          <ResultDisplay
            symptoms={results.symptoms}
            prediction={results.prediction}
          />
        )}

        <MedicalDisclaimer />
      </main>
    </div>
  );
}
