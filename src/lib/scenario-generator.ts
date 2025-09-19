import { faker } from '@faker-js/faker';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '~/env.js';
import type { TestScenario, VoiceAgentInput } from '~/types/voice-agent';

// Insurance providers list
const INSURANCE_PROVIDERS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealth',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Medicare',
  'Medicaid',
  'Tricare',
  'AARP',
  'WellCare',
  'Molina Healthcare',
  'Centene',
  'Independence Blue Cross'
];

// Scenario templates based on different patient types and situations
const SCENARIO_TEMPLATES = [
  {
    name: "New Patient - Initial Registration",
    description: "A new patient calls to register for the first time. They need to provide all their information and understand the registration process.",
    criteria: "The agent collects all necessary patient information, explains the registration process, and schedules an initial appointment."
  },
  {
    name: "Returning Patient - Basic Appointment Request",
    description: "A returning patient calls to schedule a routine appointment. They provide their phone number for verification.",
    criteria: "The agent recognizes the patient, verifies their information, and helps schedule an appointment."
  },
  {
    name: "Returning Patient - Insurance Update",
    description: "A returning patient calls to update their insurance information before their upcoming appointment.",
    criteria: "The agent verifies the patient's identity, collects new insurance information, and confirms the update."
  },
  {
    name: "Urgent Care Request",
    description: "A patient calls with urgent medical concerns and needs immediate attention or guidance.",
    criteria: "The agent assesses the urgency, provides appropriate guidance, and either schedules urgent care or connects to a human agent."
  },
  {
    name: "Appointment Rescheduling",
    description: "A patient calls to reschedule their existing appointment due to a conflict or change in plans.",
    criteria: "The agent locates the existing appointment, offers alternative times, and confirms the rescheduling."
  },
  {
    name: "Prescription Refill Request",
    description: "A patient calls to request a prescription refill for their existing medication.",
    criteria: "The agent verifies the patient's identity, checks prescription history, and processes the refill request."
  },
  {
    name: "Insurance Verification",
    description: "A patient calls to verify their insurance coverage and benefits before an appointment.",
    criteria: "The agent verifies the patient's identity, checks insurance information, and provides coverage details."
  },
  {
    name: "Medical Records Request",
    description: "A patient calls to request copies of their medical records for personal use or to share with another provider.",
    criteria: "The agent verifies the patient's identity, explains the records request process, and initiates the request."
  },
  {
    name: "Billing Inquiry",
    description: "A patient calls with questions about their medical bills, payment options, or insurance claims.",
    criteria: "The agent provides billing information, explains payment options, and connects to billing department if needed."
  },
  {
    name: "Specialist Referral",
    description: "A patient calls to request a referral to a specialist or to follow up on a specialist referral.",
    criteria: "The agent verifies the patient's information, processes the referral request, and provides next steps."
  }
];

function generateRandomDateOfBirth(): string {
  const start = new Date(1940, 0, 1);
  const end = new Date(2005, 11, 31);
  const randomDate = faker.date.between({ from: start, to: end });
  return randomDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

function generatePhoneNumber(): string {
  return faker.phone.number({ style: 'human' });
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const domain = faker.helpers.arrayElement(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateGender(): 'Male' | 'Female' | 'Other' {
  return faker.helpers.arrayElement(['Male', 'Female', 'Other']);
}

function generateInsuranceProvider(): string {
  return faker.helpers.arrayElement(INSURANCE_PROVIDERS);
}

function createScenarioFromTemplate(template: typeof SCENARIO_TEMPLATES[0], agentConfig: any): TestScenario {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const gender = generateGender();
  
  return {
    scenarioName: template.name,
    scenarioDescription: template.description.replace(
      /John Doe|Jane Doe|the patient/gi, 
      fullName
    ),
    name: fullName,
    dob: generateRandomDateOfBirth(),
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(),
    gender,
    insurance: generateInsuranceProvider(),
    criteria: template.criteria
  };
}

function generateCustomScenario(agentConfig: any): TestScenario {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const gender = generateGender();
  
  // Generate a custom scenario based on agent capabilities
  const actions = agentConfig.actions || [];
  const states = [agentConfig.initialState, ...(agentConfig.additionalStates || [])];
  
  let scenarioName = "Custom Patient Interaction";
  let description = `${fullName} calls the clinic with a specific request.`;
  let criteria = "The agent handles the patient's request appropriately.";
  
  // Customize based on available actions and states
  if (actions.includes('find_patient_info')) {
    description += ` They may be a returning patient or need to verify their information.`;
    criteria += " The agent should be able to find and verify patient information.";
  }
  
  if (states.some((state: any) => state.name === 'SCHEDULING_APPOINTMENT')) {
    description += ` They are interested in scheduling an appointment.`;
    criteria += " The agent should help with appointment scheduling.";
  }
  
  if (states.some((state: any) => state.name === 'HPI_COLLECTION')) {
    description += ` They may need to discuss medical history or symptoms.`;
    criteria += " The agent should be prepared to collect medical history if needed.";
  }
  
  if (actions.includes('dial_human_agent')) {
    description += ` If the request is complex, they may need to speak with a human agent.`;
    criteria += " The agent should know when to transfer to a human agent.";
  }
  
  return {
    scenarioName,
    scenarioDescription: description,
    name: fullName,
    dob: generateRandomDateOfBirth(),
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(),
    gender,
    insurance: generateInsuranceProvider(),
    criteria
  };
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function extractAgentConfigFromText(inputText: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analyze this text and extract voice agent configuration information. Return a JSON object with the following structure:
{
  "actions": ["action1", "action2"],
  "initialState": {
    "name": "STATE_NAME",
    "prompt": "Initial state prompt",
    "modelName": "gpt-4o",
    "transitions": ["NEXT_STATE1", "NEXT_STATE2"],
    "initialMessage": "Hello message"
  },
  "additionalStates": [
    {
      "name": "STATE_NAME",
      "prompt": "State prompt",
      "modelName": "gpt-4o-mini",
      "transitions": []
    }
  ]
}

Text to analyze: "${inputText}"

Extract any mentioned:
- Actions the agent can perform
- States or conversation flows
- Prompts or instructions
- Transitions between states
- Initial messages

If information is missing, use reasonable defaults for a medical clinic voice agent.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to default configuration
    return {
      actions: ["find_patient_info", "dial_human_agent"],
      initialState: {
        name: "INFORMATION_COLLECTION",
        prompt: "You are an AI receptionist for a medical clinic. Help patients with their requests.",
        modelName: "gpt-4o",
        transitions: ["SCHEDULING_APPOINTMENT"],
        initialMessage: "Hello, thank you for calling the clinic. How can I help you today?"
      },
      additionalStates: [
        {
          name: "SCHEDULING_APPOINTMENT",
          prompt: "You are scheduling an appointment. Ask about appointment type and availability.",
          modelName: "gpt-4o-mini",
          transitions: []
        }
      ]
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return default configuration
    return {
      actions: ["find_patient_info", "dial_human_agent"],
      initialState: {
        name: "INFORMATION_COLLECTION",
        prompt: "You are an AI receptionist for a medical clinic. Help patients with their requests.",
        modelName: "gpt-4o",
        transitions: ["SCHEDULING_APPOINTMENT"],
        initialMessage: "Hello, thank you for calling the clinic. How can I help you today?"
      },
      additionalStates: [
        {
          name: "SCHEDULING_APPOINTMENT",
          prompt: "You are scheduling an appointment. Ask about appointment type and availability.",
          modelName: "gpt-4o-mini",
          transitions: []
        }
      ]
    };
  }
}

async function generatePersonalityWithGemini(): Promise<{
  personality: string;
  background: string;
  communication_style: string;
  quirks: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Generate a colorful, unique personality for a patient calling a medical clinic. Include:
- A distinctive personality trait (e.g., "anxious", "chatty", "impatient", "confused", "elderly and forgetful")
- A brief background (age range, occupation, life situation)
- Communication style (formal, casual, rushed, confused, etc.)
- 2-3 quirky characteristics that make them memorable

Return as JSON with keys: personality, background, communication_style, quirks (array)`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing
    return {
      personality: "anxious and chatty",
      background: "middle-aged professional",
      communication_style: "rushed and worried",
      quirks: ["repeats questions", "talks very fast"]
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      personality: "nervous",
      background: "working adult",
      communication_style: "formal but anxious",
      quirks: ["asks many questions"]
    };
  }
}

async function generateScenarioWithGemini(personality: any, agentConfig: any): Promise<{
  scenarioName: string;
  scenarioDescription: string;
  criteria: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Create a realistic medical clinic scenario for a patient with this personality:
Personality: ${personality.personality}
Background: ${personality.background}
Communication Style: ${personality.communication_style}
Quirks: ${personality.quirks.join(", ")}

Agent capabilities: ${agentConfig.actions.join(", ")}
Available states: ${[agentConfig.initialState.name, ...agentConfig.additionalStates.map((s: any) => s.name)].join(", ")}

Generate a scenario that:
1. Uses the patient's personality naturally
2. Tests the agent's capabilities
3. Is realistic for a medical clinic
4. Includes specific success criteria

Return as JSON with keys: scenarioName (string), scenarioDescription (string), criteria (string)`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Ensure criteria is a string
      if (typeof parsed.criteria !== 'string') {
        parsed.criteria = JSON.stringify(parsed.criteria);
      }
      return parsed;
    }
    
    return {
      scenarioName: "Patient Appointment Request",
      scenarioDescription: "A patient calls to schedule an appointment",
      criteria: "The agent handles the request appropriately"
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      scenarioName: "General Patient Inquiry",
      scenarioDescription: "A patient calls with a general inquiry",
      criteria: "The agent provides helpful assistance"
    };
  }
}

export async function create_scenarios(input: string, num_scenarios: number): Promise<TestScenario[]> {
  const scenarios: TestScenario[] = [];
  
  // Try to parse as JSON first, fallback to text analysis
  console.log('Parsing agent input:', input);
  let agentConfig;
  try {
    const parsedInput = JSON.parse(input);
    agentConfig = parsedInput.agentConfig || parsedInput;
  } catch (error) {
    // If not JSON, use Gemini to extract agent configuration from text
    agentConfig = await extractAgentConfigFromText(input);
  }
  
  // Generate scenarios using Gemini Flash
  for (let i = 0; i < num_scenarios; i++) {
    console.log(`Generating scenario ${i + 1} of ${num_scenarios}`);
    try {
      // Generate personality with Gemini
      const personality = await generatePersonalityWithGemini();
      
      // Generate scenario with Gemini
      const scenarioData = await generateScenarioWithGemini(personality, agentConfig);
      
      // Generate realistic patient data with faker
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
      
      const scenario: TestScenario = {
        scenarioName: scenarioData.scenarioName,
        scenarioDescription: `${scenarioData.scenarioDescription} ${personality.personality} patient ${fullName} (${personality.background}) calls with a ${personality.communication_style} approach. ${personality.quirks.join(", ")}.`,
        name: fullName,
        dob: generateRandomDateOfBirth(),
        email: generateEmail(firstName, lastName),
        phone: generatePhoneNumber(),
        gender,
        insurance: generateInsuranceProvider(),
        criteria: typeof scenarioData.criteria === 'string' ? scenarioData.criteria : JSON.stringify(scenarioData.criteria)
      };
      
      scenarios.push(scenario);
      console.log(`Generated scenario ${i + 1} of ${num_scenarios}: ${scenario.scenarioName}`);
    } catch (error) {
      console.error(`Error generating scenario ${i + 1}:`, error);
      // Fallback to template-based scenario
      const template = faker.helpers.arrayElement(SCENARIO_TEMPLATES);
      if (template) {
        console.log(`Fallback to template-based scenario ${i + 1} of ${num_scenarios}`);
        scenarios.push(createScenarioFromTemplate(template, agentConfig));
      }
    }
  }
  
  return scenarios;
}

// Keep the original function for backward compatibility
export function create_scenarios_legacy(input: VoiceAgentInput, num_scenarios: number): TestScenario[] {
  const scenarios: TestScenario[] = [];
  
  // Generate scenarios from templates (70% of scenarios)
  const templateCount = Math.floor(num_scenarios * 0.7);
  const customCount = num_scenarios - templateCount;
  
  // Shuffle templates to get random selection
  const shuffledTemplates = faker.helpers.shuffle([...SCENARIO_TEMPLATES]);
  
  for (let i = 0; i < templateCount && i < shuffledTemplates.length; i++) {
    const template = shuffledTemplates[i];
    if (template) {
      scenarios.push(createScenarioFromTemplate(template, input.agentConfig));
    }
  }
  
  // Fill remaining slots with templates if we need more
  if (templateCount > shuffledTemplates.length) {
    for (let i = 0; i < templateCount - shuffledTemplates.length; i++) {
      const template = faker.helpers.arrayElement(SCENARIO_TEMPLATES);
      if (template) {
        scenarios.push(createScenarioFromTemplate(template, input.agentConfig));
      }
    }
  }
  
  // Generate custom scenarios (30% of scenarios)
  for (let i = 0; i < customCount; i++) {
    scenarios.push(generateCustomScenario(input.agentConfig));
  }
  
  // Shuffle the final results to mix template and custom scenarios
  return faker.helpers.shuffle(scenarios);
}
