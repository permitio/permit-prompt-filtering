const OpenAI = require('openai');
require('dotenv').config();


class AccessClassifier {
    constructor(resourceType = null, attributes = []) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        this.resourceType = resourceType;
        this.attributes = attributes;
        this.systemPrompt = this.buildSystemPrompt();
    }

    buildSystemPrompt() {
        let prompt = `You are a request classifier that understands user intent.
 
 ${this.resourceType ? `Classify requests for resource type: ${this.resourceType}` : 'Determine appropriate resource type'}
 
 ${this.attributes.length ? `Look for these attributes: ${this.attributes.join(', ')}` : ''}
 
 Key rules:
 - For HotelType requests, only use rateType values: "IATA", "premium", or "public"
 - For financial requests:
  * Use FinancialAdvice when user seeks recommendations, guidance, or strategy
  * Use FinancialData when user wants current values, stats, or status
 
 Examples:
 "Show me IATA rates" -> HotelType with rateType: "IATA"
 "What's the price?" -> HotelType with rateType: "public"
 "How should I invest?" -> FinancialAdvice
 "Show my portfolio value" -> FinancialData
 
 Return JSON:
 {
    "resourceType": "${this.resourceType || 'determined by intent'}",
    "resourceKey": "identifier",
    "attributes": {
        ${this.attributes.map(attr => `"${attr}": "determined value"`).join(',\n        ')}
    },
    "action": "read"
 }`;

        return prompt;
    }

    async classify(userPrompt) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: this.systemPrompt
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                temperature: 0
            });

            return JSON.parse(response.choices[0].message.content.trim());
        } catch (error) {
            console.error("Classification failed:", error);
            throw error;
        }
    }
}

module.exports = AccessClassifier;


