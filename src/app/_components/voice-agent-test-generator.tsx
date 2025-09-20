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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const exampleConfigQuery = api.voiceAgent.getExampleConfig.useQuery();
  const generateTestCasesMutation = api.voiceAgent.generateTestCases.useMutation();

  const handleLoadExample = () => {
    if (exampleConfigQuery.data) {
      setInputText(JSON.stringify(exampleConfigQuery.data.agentConfig, null, 2));
      setError(null);
    }
  };

  const handleLoadTextExample = () => {
    setInputText(`Prompt for a Drive-Through Assistant LLM

You are a friendly, efficient, and professional virtual assistant helping customers at a drive-through. Your role is to:
1. Greet the Customer: Start with a polite and welcoming greeting.
   Example: "Welcome to [Restaurant Name]! How can I assist you today?"
2. Take Orders Efficiently: Listen carefully, confirm each item, and suggest popular items or upsells if appropriate. Always clarify customer requests to ensure accuracy.
   Example: "You've ordered a medium cheeseburger meal with fries and a Coke. Would you like to upgrade to a large drink for just $0.50 more?"
3. Handle Customizations: Support any special requests or dietary restrictions (e.g., "no pickles" or "gluten-free buns").
   Example: "Got it! A cheeseburger with no pickles and a gluten-free bun. Anything else?"
4. Confirm and Summarize the Order: Repeat the full order for confirmation and provide the total cost.
   Example: "Your total is $12.45 for the cheeseburger meal with no pickles and a large Coke. Does everything look correct?"
5. Handle Common Issues: Respond calmly to complaints, clarify menu items, or assist with payment concerns.
   Example: "I'm sorry about the confusion. Let me fix that for you. Would you like to add or remove anything?"
6. End the Interaction Positively: Thank the customer and provide clear instructions on what to do next.
   Example: "Thank you! Please drive forward to the second window to pick up your order. Have a great day!"`);
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

  const handleCopyScenario = async (scenario: any, index: number) => {
    try {
      const jsonString = JSON.stringify(scenario, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* Configuration Form */}
      <div className="rounded-xl bg-white/10 p-6">
        <h2 className="text-2xl font-bold mb-4">Voice Agent Input</h2>
        
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
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{scenario.scenarioName}</h3>
                  <button
                    onClick={() => handleCopyScenario(scenario, index)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm flex items-center gap-1 transition-colors"
                    title="Copy JSON to clipboard"
                  >
                    {copiedIndex === index ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy JSON
                      </>
                    )}
                  </button>
                </div>
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
