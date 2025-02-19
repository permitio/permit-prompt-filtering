# OpenAI + Permit.io Natural Language Access Control

This demo showcases building a dynamic access control system that combines OpenAI's natural language understanding with Permit.io's ABAC (Attribute-Based Access Control). The system intelligently classifies user requests and enforces permissions based on user attributes.

## Overview

The system handles two types of access scenarios to demonstrate its flexibility:

1. **Hotel Rate Access** (Complex attribute matching)
   ```
   "What's the price of Hilton Budapest?"
   -> Classifies as public rate if not specified
   -> Checks user attributes for special rates (IATA, premium)
   ```

2. **Financial Advice Access** (Simple opt-in validation)
   ```
   "Help me with my investment strategy"
   -> Classifies as financial advice request
   -> Checks if user has opted in for AI advice
   ```

## Prerequisites

- Node.js installed
- OpenAI API key
- Permit.io account and API key

## Setup

1. Install dependencies:
```bash
npm install openai permitio dotenv
```

2. Create a `.env` file:
```env
OPENAI_API_KEY=your_openai_key
PERMIT_API_KEY=your_permit_key
PERMIT_PDP_URL=your_pdp_url
```

3. Configure Permit.io:
   - Create resource types:
     - `HotelType` with `rateType` attribute
     - `FinancialAdvice` (no attributes needed)
   - Set up user attributes:
     - `iata_membership` (boolean)
     - `premium_member` (boolean)
     - `ai_advice_opt_in` (boolean)

## Project Structure

```
├── README.md
├── package.json
├── server.js
└── src/
    ├── classifier.js    # Generic OpenAI classifier
    └── permit.js        # Permit.io access checks
```

## How It Works

1. **Intelligent Request Classification**
   - System understands user intent from natural language
   - Handles explicit and implicit requests
   - Defaults to appropriate values when details are missing
   ```javascript
   // Explicit: "Show me the IATA rate for Hilton"
   {
     resourceType: "HotelType",
     resourceKey: "hilton",
     attributes: { rateType: "IATA" }
   }

   // Implicit: "What's the price of Hilton?"
   {
     resourceType: "HotelType",
     resourceKey: "hilton",
     attributes: { rateType: "public" }
   }
   ```

2. **Dynamic Permission Checks**
   - ABAC policies based on user attributes
   - Different validation patterns for different resources
   ```javascript
   // Hotel rates: Match rate type with user attributes
   if (rateType === "IATA") requires user.iata_membership
   if (rateType === "premium") requires user.premium_member

   // Financial advice: Simple opt-in check
   if (resourceType === "FinancialAdvice") requires user.ai_advice_opt_in
   ```

## Test Cases

The system handles various scenarios:

1. **Basic Access Control**
   - IATA agent accessing IATA rates
   - Premium user accessing premium rates
   - Regular user accessing public rates

2. **Edge Cases**
   - Ambiguous requests (defaults to public rates)
   - Missing information (uses "unknown" key)
   - Mixed requests (classifies primary intent)

3. **Financial Advice**
   - Opted-in users can access advice
   - Regular users are denied
   - Implicit advice requests are recognized

## Example Output

```
🔍 TEST CASE: Ambiguous rate request
👤 User: regular_user_1
💭 Request: "Show me the rates for Hilton"

📋 Classification: {
  "resourceType": "HotelType",
  "resourceKey": "Hilton",
  "attributes": {
    "rateType": "public"
  }
}

🎯 Result: ALLOWED ✅
```

## Key Features

1. **Generic Classification**
   - No hardcoded rules or patterns
   - OpenAI understands context and intent
   - Handles ambiguous and implicit requests

2. **Flexible Access Patterns**
   - Complex attribute matching (hotel rates)
   - Simple opt-in validation (financial advice)
   - Easily extensible to new use cases

3. **Natural Language Understanding**
   - Users can request access naturally
   - System infers missing details
   - Handles various request formats

## License

MIT