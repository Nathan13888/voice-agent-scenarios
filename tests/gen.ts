#!/usr/bin/env bun

/**
 * Voice Agent Test Case Generator CLI
 * 
 * This CLI tool generates realistic test scenarios for voice agents using AI.
 * It supports both JSON configurations and natural language descriptions.
 * 
 * Usage:
 *   bun run tests/gen.ts
 *   bun run tests/gen.ts --input="Your voice agent description"
 *   bun run tests/gen.ts --input='{"agentConfig": {...}}' --scenarios=15
 *   bun run tests/gen.ts --help
 */

import { create_scenarios } from '../src/lib/scenario-generator';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    input?: string;
    scenarios?: number;
    help?: boolean;
    output?: string;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--input' || arg === '-i') {
      options.input = args[i + 1];
      i++; // Skip next argument as it's the value
    } else if (arg === '--scenarios' || arg === '-s') {
      const value = args[i + 1];
      options.scenarios = value ? parseInt(value) || 10 : 10;
      i++; // Skip next argument as it's the value
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[i + 1];
      i++; // Skip next argument as it's the value
    }
  }

  return options;
}

// Display help information
function showHelp() {
  console.log(`
Voice Agent Scenario Generator CLI

USAGE:
  bun run tests/gen.ts [OPTIONS]

OPTIONS:
  -i, --input <text>      Voice agent description (JSON or natural language)
  -s, --scenarios <number>   Number of scenarios to generate (default: 10)
  -o, --output <file>     Output file path (optional)
  -h, --help              Show this help message

EXAMPLES:
  # Generate with default example
  bun run tests/gen.ts

  # Generate with natural language input
  bun run tests/gen.ts --input="Create a voice agent for a medical clinic"

  # Generate with JSON configuration
  bun run tests/gen.ts --input='{"agentConfig":{"actions":["schedule"]}}'

  # Generate 20 scenarios and save to file
  bun run tests/gen.ts --scenarios=20 --output=scenarios.json

INPUT FORMATS:
  JSON Configuration:
    {"agentConfig": {"actions": [...], "initialState": {...}}}

  Natural Language:
    "Create a voice agent for a dental office that can schedule appointments"

  Requirements Document:
    "Voice Agent Requirements: Handle patient calls, schedule appointments..."
`);
}

// Format scenarios for output
function formatScenarios(scenarios: any[]) {
  return scenarios.map((scenario, index) => ({
    id: index + 1,
    scenarioName: scenario.scenarioName,
    scenarioDescription: scenario.scenarioDescription,
    patient: {
      name: scenario.name,
      dob: scenario.dob,
      email: scenario.email,
      phone: scenario.phone,
      gender: scenario.gender,
      insurance: scenario.insurance
    },
    successCriteria: scenario.criteria
  }));
}

// Main CLI function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Default input if none provided
  const input = options.input || `Create a voice agent for a medical clinic that can:
- Help patients schedule appointments
- Answer questions about insurance
- Collect patient information
- Transfer complex cases to human staff
- Be friendly and professional`;

  const numScenarios = options.scenarios || 10;

  console.log('🤖 Voice Agent Scenario Generator');
  console.log('==================================\n');
  console.log(`Input: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}`);
  console.log(`Generating ${numScenarios} scenarios...\n`);

  try {
    const scenarios = await create_scenarios(input, numScenarios);
    const formattedScenarios = formatScenarios(scenarios);

    if (options.output) {
      // Save to file
      const fs = await import('fs');
      fs.writeFileSync(options.output, JSON.stringify(formattedScenarios, null, 2));
      console.log(`✅ Generated ${scenarios.length} scenarios and saved to ${options.output}`);
    } else {
      // Display to console
      formattedScenarios.forEach((scenario, index) => {
        console.log(`📋 Scenario ${scenario.id}: ${scenario.scenarioName}`);
        console.log(`   Description: ${scenario.scenarioDescription}`);
        console.log(`   Patient: ${scenario.patient.name} (${scenario.patient.gender})`);
        console.log(`   Contact: ${scenario.patient.phone} | ${scenario.patient.email}`);
        console.log(`   Insurance: ${scenario.patient.insurance}`);
        console.log(`   Success Criteria: ${scenario.successCriteria}`);
        console.log('');
      });
    }

    console.log(`🎉 Successfully generated ${scenarios.length} test scenarios!`);
  } catch (error) {
    console.error('❌ Error generating scenarios:', error);
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (process.argv[1]?.endsWith('gen.ts')) {
  main().catch(console.error);
}

// Export for programmatic use
export { create_scenarios };
export { main as runCLI };