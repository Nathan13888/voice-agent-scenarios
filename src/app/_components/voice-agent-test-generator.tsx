"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface TestCaseResult {
  scenarios: Array<{
    scenarioName: string;
    scenarioDescription: string;
    name: string;
    dob: string;
    email: string;
    phone: string;
    gender: 'Male' | 'Female' | 'Other';
    insurance: string;
    criteria: string;
  }>;
  count: number;
  generatedAt: string;
}

export function VoiceAgentTestGenerator() {
  const [inputText, setInputText] = useState("");
  const [numScenarios, setNumScenarios] = useState(10);
  const [testResults, setTestResults] = useState<TestCaseResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exampleConfigQuery = api.voiceAgent.getExampleConfig.useQuery();
  const generateTestCasesMutation = api.voiceAgent.generateTestCases.useMutation();

  const handleLoadExample = () => {
    if (exampleConfigQuery.data) {
      setInputText(JSON.stringify(exampleConfigQuery.data.agentConfig, null, 2));
      setError(null);
    }
  };

  const handleLoadTextExample = () => {
    setInputText("Create a voice agent for a medical clinic that can help patients schedule appointments, answer questions about insurance, and collect patient information. The agent should be friendly and professional, and be able to transfer complex cases to human staff.");
    setError(null);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter some input text");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateTestCasesMutation.mutateAsync({
        inputText,
        numScenarios,
      });
      setTestResults(result);
    } catch (error: any) {
      setError(error.message || "Failed to generate test cases");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* Configuration Form */}
      <div className="rounded-xl bg-white/10 p-6">
        <h2 className="text-2xl font-bold mb-4">Voice Agent Input (Powered by Gemini Flash)</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Voice Agent Description or Configuration
            </label>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setError(null);
              }}
              className="w-full p-3 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 font-mono text-sm h-64"
              placeholder="Enter your voice agent description, requirements, or JSON configuration..."
            />
            <p className="text-xs text-white/60 mt-1">
              Enter any text describing your voice agent - JSON configuration, natural language description, requirements, or specifications. 
              Gemini Flash will intelligently extract the configuration and generate colorful personalities and realistic scenarios.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Number of Test Scenarios</label>
            <input
              type="number"
              min="1"
              max="50"
              value={numScenarios}
              onChange={(e) => setNumScenarios(parseInt(e.target.value) || 10)}
              className="w-full p-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleLoadExample}
            disabled={exampleConfigQuery.isLoading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-700 rounded text-white"
          >
            {exampleConfigQuery.isLoading ? "Loading..." : "Load JSON Example"}
          </button>
          
          <button
            onClick={handleLoadTextExample}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
          >
            Load Text Example
          </button>
          
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || isGenerating}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 rounded text-white"
          >
            {isGenerating ? "Generating..." : "Generate Test Cases"}
          </button>
        </div>
      </div>

      {/* Results */}
      {testResults && (
        <div className="rounded-xl bg-white/10 p-6">
          <h2 className="text-2xl font-bold mb-4">
            Generated Test Cases ({testResults.count})
          </h2>
          
          <div className="space-y-4">
            {testResults.scenarios.map((scenario, index) => (
              <div key={index} className="border border-white/30 rounded p-4 bg-white/5">
                <h3 className="text-lg font-semibold mb-2">{scenario.scenarioName}</h3>
                <p className="text-sm text-white/80 mb-3">{scenario.scenarioDescription}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Patient:</strong> {scenario.name} ({scenario.gender})
                  </div>
                  <div>
                    <strong>DOB:</strong> {scenario.dob}
                  </div>
                  <div>
                    <strong>Phone:</strong> {scenario.phone}
                  </div>
                  <div>
                    <strong>Email:</strong> {scenario.email}
                  </div>
                  <div>
                    <strong>Insurance:</strong> {scenario.insurance}
                  </div>
                </div>
                
                <div className="mt-3">
                  <strong>Success Criteria:</strong>
                  <p className="text-sm text-white/80 mt-1">
                    {typeof scenario.criteria === 'string' ? scenario.criteria : JSON.stringify(scenario.criteria)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
