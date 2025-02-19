require('dotenv').config();
const AccessClassifier = require('./src/classifier');
const { checkAccess } = require('./src/permit');

// Initialize our classifiers
const hotelClassifier = new AccessClassifier('HotelType', ['rateType']);
const financeClassifier = new AccessClassifier('FinancialAdvice');

async function testScenario(scenario) {
    console.log('\n' + '='.repeat(50));
    console.log(`🔍 TEST CASE: ${scenario.description}`);
    console.log(`👤 User: ${scenario.userId}`);
    console.log(`💭 Request: "${scenario.prompt}"`);

    try {
        // Choose classifier based on scenario type
        const classification = await (scenario.type === 'finance'
            ? financeClassifier.classify(scenario.prompt)
            : hotelClassifier.classify(scenario.prompt));

        console.log('\n📋 Classification:', JSON.stringify(classification, null, 2));

        const isAllowed = await checkAccess(scenario.userId, classification);
        console.log(`\n🎯 Result: ${isAllowed ? 'ALLOWED ✅' : 'DENIED ❌'}`);
        console.log(`📝 Expected: ${scenario.expected}`);

        const matchesExpectation = (isAllowed === scenario.shouldBeAllowed);
        console.log(`✨ Test ${matchesExpectation ? 'PASSED ✅' : 'FAILED ❌'}`);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

async function runTests() {
    const scenarios = [
        // Hotel rate scenarios - Mix of allowed and denied
        {
            type: 'hotel',
            description: "IATA agent accessing IATA rates",
            userId: 'iata_agent_1',
            prompt: "Give me the IATA rate for Hilton Budapest tonight",
            shouldBeAllowed: true,
            expected: "Should be allowed (IATA member requesting IATA rates)"
        },
        {
            type: 'hotel',
            description: "Regular user attempting IATA rates",
            userId: 'regular_user_1',
            prompt: "Show me IATA rates for Marriott",
            shouldBeAllowed: false,
            expected: "Should be denied (No IATA membership)"
        },
        {
            type: 'hotel',
            description: "Regular user accessing public rates",
            userId: 'regular_user_1',
            prompt: "What's the price for Hyatt New York?",
            shouldBeAllowed: true,
            expected: "Should be allowed (Public rates accessible to all)"
        },

        // Finance scenarios - Testing intent recognition
        {
            type: 'finance',
            description: "Regular user requesting portfolio data",
            userId: 'regular_user_1',
            prompt: "Show me my portfolio stats",
            shouldBeAllowed: true,
            expected: "Should be allowed (Basic data access)"
        },
        {
            type: 'finance',
            description: "Regular user requesting advice",
            userId: 'regular_user_1',
            prompt: "How should I invest?",
            shouldBeAllowed: false,
            expected: "Should be denied (Advice requires AI opt-in)"
        },
        {
            type: 'finance',
            description: "Regular user requesting performance data",
            userId: 'regular_user_1',
            prompt: "What's my portfolio's current value?",
            shouldBeAllowed: true,
            expected: "Should be allowed (Simple data retrieval)"
        },
        {
            type: 'finance',
            description: "Regular user asking for strategy advice",
            userId: 'regular_user_1',
            prompt: "Is my investment strategy optimal?",
            shouldBeAllowed: false,
            expected: "Should be denied (Advice request without opt-in)"
        },
        {
            type: 'finance',
            description: "AI user requesting investment advice",
            userId: 'ai_opted_in_user',
            prompt: "How should I rebalance my portfolio?",
            shouldBeAllowed: true,
            expected: "Should be allowed (Opted-in user requesting advice)"
        }
    ];

    for (const scenario of scenarios) {
        await testScenario(scenario);
    }
}

runTests().catch(console.error);