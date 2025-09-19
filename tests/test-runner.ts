#!/usr/bin/env node

/**
 * Test Runner for Voice Agent Test Case Generator
 * 
 * This script demonstrates how to use the test generation framework
 * and can be run to generate sample test cases.
 */

import { create_scenarios } from './scenario-generator';
import type { VoiceAgentInput } from './types';

// Example agent configuration
const agentConfig: VoiceAgentInput = {
  agentConfig: {
    actions: ["find_patient_info", "dial_human_agent"],
    initialState: {
      name: "INFORMATION_COLLECTION",
      prompt: "You are an AI receptionist for a clinic. Your goal is to gather patient information, such as contact details and insurance, or look up existing patient records. If the patient needs to schedule an appointment, transition to SCHEDULING_APPOINTMENT. If the call involves a medical history discussion, transition to HPI_COLLECTION. For all other inquiries, connect to a human agent. Always ask for clarifications, ensure accuracy, and thank the patient before ending the call.",
      modelName: "gpt-4o",
      transitions: ["SCHEDULING_APPOINTMENT", "HPI_COLLECTION"],
      initialMessage: "Hello, thank you for calling the clinic. I'm your AI receptionist. Are you a new or returning patient?"
    },
    additionalStates: [
      {
        name: "SCHEDULING_APPOINTMENT",
        prompt: "You are scheduling an appointment for a clinic. Ask the patient their appointment type and offer available slots (e.g., Tuesdays 4-5 PM, Wednesdays 2-3 PM, Fridays 9-10 AM). Confirm or reschedule as needed. Always thank the patient and end the call politely.",
        modelName: "gpt-4o-mini",
        transitions: []
      },
      {
        name: "HPI_COLLECTION",
        prompt: "You are collecting medical history for a patient's upcoming doctor visit. Gather information about their symptoms, medical history, medications, and allergies. Ask clear, step-by-step questions to prepare the doctor for the visit. If unsure about anything, connect to a human agent and thank the patient before ending the call.",
        modelName: "gpt-4o-mini",
        transitions: []
      }
    ]
  }
};

async function main() {
  // console.log('🎯 Voice Agent Test Case Generator');
  // console.log('=====================================\n');
  
  // Generate test scenarios
  const numScenarios = process.argv[2] ? parseInt(process.argv[2]) : 5;
  // console.log(`Generating ${numScenarios} test scenarios...\n`);
  
  const scenarios = create_scenarios(agentConfig, numScenarios);
  
  // Display results as structured JSON
  // console.log('Generated Test Scenarios:');
  console.log(JSON.stringify(scenarios, null, 2));
  
  // Export to JSON file
  const fs = await import('fs');
  const outputFile = `test-scenarios-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(scenarios, null, 2));
  console.log(`💾 Test scenarios exported to: ${outputFile}`);
  
  // Summary statistics
  // const genderCounts = scenarios.reduce((acc, scenario) => {
  //   acc[scenario.gender] = (acc[scenario.gender] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);
  
  // const insuranceCounts = scenarios.reduce((acc, scenario) => {
  //   acc[scenario.insurance] = (acc[scenario.insurance] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);
  
  // console.log('\n📊 Summary Statistics:');
  // console.log(`   Total scenarios: ${scenarios.length}`);
  // console.log(`   Gender distribution:`, genderCounts);
  // console.log(`   Insurance providers:`, Object.keys(insuranceCounts).length, 'unique providers');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
