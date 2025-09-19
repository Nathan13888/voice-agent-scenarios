# Voice Agent Scenario Generator

A powerful tool for generating realistic test scenarios for voice agents using AI. This project supports both web-based and CLI usage, powered by Gemini Flash for creating colorful personalities and realistic test cases.

## Demos

View examples found in the `examples` folder of what the web interface looks like.

## Features

- **Flexible Input Support**: Accepts JSON configurations, natural language descriptions, or requirements documents
- **AI-Powered Scenario Generation**: Uses Gemini Flash to create unique, colorful patient personalities
- **Web Interface**: Modern Next.js frontend with real-time generation
- **CLI Support**: Direct programmatic access for automation and integration

## Prerequisites

- Node.js 18+ 
- Bun (recommended) or npm
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nathan13888/voice-agent-scenarios
cd voice-agent-scenarios
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL="file:./db.sqlite"
```

## Usage Methods

### 1. Next.js Web Frontend

The web interface provides an intuitive way to generate test scenarios with real-time feedback.

#### Start the Development Server
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Using the Web Interface

1. **Input Your Voice Agent Description**
   - **JSON Configuration**: Paste a structured JSON configuration
   - **Natural Language**: Describe your voice agent in plain text
   - **Requirements Document**: Provide detailed specifications

2. **Example Inputs**

   **JSON Format:**
   ```json
   {
     "agentConfig": {
       "actions": ["find_patient_info", "dial_human_agent"],
       "initialState": {
         "name": "INFORMATION_COLLECTION",
         "prompt": "You are an AI receptionist for a clinic...",
         "modelName": "gpt-4o",
         "transitions": ["SCHEDULING_APPOINTMENT"],
         "initialMessage": "Hello, thank you for calling..."
       },
       "additionalStates": [...]
     }
   }
   ```

   **Natural Language:**
   ```
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
      Example: "Thank you! Please drive forward to the second window to pick up your order. Have a great day!"
   ```

3. **Generate Test Scenarios**
   - Set the number of scenarios (1-50)
   - Click "Generate Test Cases"
   - View colorful, realistic test scenarios with patient personalities


### 2. CLI Usage with gen.ts

For programmatic access, automation, or integration into existing workflows.

#### Basic CLI Usage

```bash
# Generate scenarios from an example configuration
bun run tests/gen.ts

# Or with custom input
bun run tests/gen.ts --input="Your voice agent description here"
```

#### Programmatic Usage

```typescript
import { create_scenarios } from './src/lib/scenario-generator';

// Generate scenarios from any input
const scenarios = await create_scenarios(
  "Create a voice agent for a dental office that schedules cleanings and handles insurance",
  10 // number of scenarios
);

console.log(scenarios);
```

## Future Improvements

1. Support different models for generation.
2. Ground scenario outputs to more realistic scenarios.
3. Automatically send scenarios to a live voice agent for testing.

