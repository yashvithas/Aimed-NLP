import { useState } from "react";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import React from "react";

interface SymptomInputProps {
  value: string;
  onChange: (value: string) => void;
  onLanguageChange: (lang: string) => void;
}

export function SymptomInput({ value, onChange, onLanguageChange }: SymptomInputProps) {
  const [language, setLanguage] = useState("english");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    onLanguageChange(lang);
  };

  return (
    <Card className="border-2 border-teal-100">
      <CardHeader>
        <CardTitle className="text-teal-700">Enter Your Symptoms</CardTitle>
        <CardDescription>
          Use simple words. You can type in romanized language.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Language Dropdown */}
        <div>
          <Label>Select Language</Label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border rounded p-2 w-full mt-1"
          >
            <option value="english">English</option>
            <option value="telugu">Telugu</option>
            <option value="hindi">Hindi</option>
            <option value="tamil">Tamil</option>
            <option value="kannada">Kannada</option>
          </select>
        </div>

        {/* Symptom Text Box */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: fever, cough, headache, chest pain"
          className="min-h-[150px] resize-none border-2 border-gray-200 focus:border-teal-400"
          rows={6}
        />

      </CardContent>
    </Card>
  );
}