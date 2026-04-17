import React from "react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function MedicalDisclaimer() {
  return (
    <Alert className="border-2 border-amber-400 bg-amber-50">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900">Medical Disclaimer</AlertTitle>
      <AlertDescription className="text-amber-800">
        This application provides AI-based preliminary analysis only.
        Results may not be accurate and should not be considered a medical diagnosis.
        <strong className="block mt-1">
          Please consult a qualified doctor or healthcare professional.
        </strong>
      </AlertDescription>
    </Alert>
  );
}
