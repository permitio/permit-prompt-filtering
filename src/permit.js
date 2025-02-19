const { Permit } = require('permitio');
require('dotenv').config();

const permit = new Permit({
    token: process.env.PERMIT_API_KEY,
    pdp: process.env.PDP_URL,
});

async function checkAccess(userId, parsedRequest) {
    try {
        console.log('\n🔒 Checking Permission:');
        console.log(`👤 User: ${userId}`);
        console.log(`📑 Resource Type: ${parsedRequest.resourceType}`);
        console.log(`🎯 Action: ${parsedRequest.action}`);

        let resource = {
            type: parsedRequest.resourceType,
            key: parsedRequest.resourceKey
        };

        // Add attributes only if they exist
        if (Object.keys(parsedRequest.attributes || {}).length > 0) {
            resource.attributes = parsedRequest.attributes;
            console.log('📋 Attributes:', parsedRequest.attributes);
        }

        try {
            const permitted = await permit.check(
                userId,
                parsedRequest.action,
                resource
            );

            if (permitted) {
                console.log('✅ Access Granted');
            } else {
                // Log specific denial reason
                if (parsedRequest.resourceType === 'HotelType') {
                    console.log('❌ Access Denied - Insufficient rate type permissions');
                } else if (parsedRequest.resourceType === 'FinancialAdvice') {
                    console.log('❌ Access Denied - User not authorized for financial advice');
                } else {
                    console.log('❌ Access Denied - Insufficient permissions');
                }
            }

            return permitted;
        } catch (checkError) {
            if (checkError.message.includes('role')) {
                console.error('❌ Role-based permission check failed:', checkError.message);
            } else if (checkError.message.includes('attribute')) {
                console.error('❌ Attribute-based permission check failed:', checkError.message);
            } else {
                console.error('❌ Permission check failed:', checkError.message);
            }
            throw checkError;
        }
    } catch (err) {
        console.error("❌ Permission check failed:", err);
        throw err;
    }
}

module.exports = {
    checkAccess
};