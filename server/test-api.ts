
const BASE_URL = 'http://localhost:4000/api';

async function runTests() {
    const timestamp = Date.now();
    const testUser = {
        email: `test_${timestamp}@example.com`,
        username: `u_${timestamp}`.slice(0, 20),
        password: 'Password123!',
        name: 'Test User'
    };

    const testChannel = {
        name: `Channel ${timestamp}`,
        handle: `@handle_${timestamp}`,
        description: 'A test channel'
    };

    let token = '';
    let userId = '';
    let channelId = '';

    console.log('🚀 Starting Backend API Tests...\n');

    try {
        // 1. Test Registration
        console.log('1. Testing User Registration...');
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const registerData = await registerRes.json();
        if (registerRes.status === 201) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed:', registerData);
            process.exit(1);
        }

        // 2. Test Login
        console.log('\n2. Testing User Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        if (loginRes.status === 200 && loginData.data?.token) {
            token = loginData.data.token;
            userId = loginData.data.user.id;
            console.log('✅ Login Successful (Token received)');
        } else {
            console.error('❌ Login Failed:', loginData);
            process.exit(1);
        }

        // 3. Test Get Profile
        console.log('\n3. Testing Get Profile (Authenticated)...');
        const profileRes = await fetch(`${BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.status === 200 && profileData.data?.email === testUser.email) {
            console.log('✅ Get Profile Successful');
        } else {
            console.error('❌ Get Profile Failed:', profileData);
            process.exit(1);
        }

        // 4. Test Create Channel
        console.log('\n4. Testing Create Channel...');
        const createChannelRes = await fetch(`${BASE_URL}/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testChannel)
        });
        const createChannelData = await createChannelRes.json();
        if (createChannelRes.status === 201 && createChannelData.data?.id) {
            channelId = createChannelData.data.id;
            console.log('✅ Create Channel Successful');
        } else {
            console.error('❌ Create Channel Failed:', createChannelData);
            process.exit(1);
        }

        // 5. Test Create Channel Again (Should Fail)
        console.log('\n5. Testing Create Channel Again (Duplicate check)...');
        const duplicateChannelRes = await fetch(`${BASE_URL}/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Another Channel',
                handle: 'another_handle',
                description: 'Should fail'
            })
        });
        const duplicateData = await duplicateChannelRes.json();
        if (duplicateChannelRes.status !== 201) {
            console.log('✅ Duplicate check passed (Correctly rejected)');
        } else {
            console.error('❌ Duplicate check failed: Second channel created improperly');
            process.exit(1);
        }

        // 6. Test Update Channel
        console.log('\n6. Testing Update Channel...');
        const updateRes = await fetch(`${BASE_URL}/channels/${channelId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Updated Channel Name'
            })
        });
        const updateData = await updateRes.json();
        if (updateRes.status === 200 && updateData.data?.name === 'Updated Channel Name') {
            console.log('✅ Update Channel Successful');
        } else {
            console.error('❌ Update Channel Failed:', updateData);
            process.exit(1);
        }

        // 7. Test Get Channel
        console.log('\n7. Testing Get Channel...');
        const getRes = await fetch(`${BASE_URL}/channels/${channelId}`);
        const getData = await getRes.json();
        if (getRes.status === 200 && getData.data?.name === 'Updated Channel Name') {
            console.log('✅ Get Channel Successful');
        } else {
            console.error('❌ Get Channel Failed:', getData);
            process.exit(1);
        }

        // 8. Test Protected Route without token
        console.log('\n8. Testing Unauthorized Access...');
        const unauthRes = await fetch(`${BASE_URL}/users/me`);
        if (unauthRes.status === 401) {
            console.log('✅ Unauthorized access correctly blocked (401)');
        } else {
            console.error('❌ Unauthorized access test failed (Status:', unauthRes.status, ')');
            process.exit(1);
        }

        // 9. Test Channel Ownership (Different user should fail to update)
        console.log('\n9. Testing Channel Ownership (Unauthorized update)...');
        // Create a second user
        const maliciousUser = {
            email: `mal_${timestamp}@example.com`,
            username: `m_${timestamp}`.slice(0, 20),
            password: 'Password123!',
            name: 'Malicious User'
        };
        const malRegRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(maliciousUser)
        });
        if (malRegRes.status !== 201) {
            const regError = await malRegRes.json();
            console.error('❌ Malicious User Registration Failed:', regError);
            process.exit(1);
        }

        const malLoginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: maliciousUser.email,
                password: maliciousUser.password
            })
        });
        const malLoginData = await malLoginRes.json();
        if (malLoginRes.status !== 200 || !malLoginData.data?.token) {
            console.error('❌ Malicious User Login Failed:', malLoginData);
            process.exit(1);
        }
        const malToken = malLoginData.data.token;

        const maliciousUpdateRes = await fetch(`${BASE_URL}/channels/${channelId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${malToken}`
            },
            body: JSON.stringify({
                name: 'Hacked name'
            })
        });
        if (maliciousUpdateRes.status === 403 || maliciousUpdateRes.status === 401) {
            console.log('✅ Unauthorized update correctly blocked (401/403)');
        } else {
            console.error('❌ Ownership test failed: Malicious user updated the channel (Status:', maliciousUpdateRes.status, ')');
            process.exit(1);
        }

        console.log('\n✨ ALL BACKEND TESTS PASSED SUCCESSFULLY! ✨');

    } catch (error) {
        console.error('💥 Unexpected Test Error:', error);
        process.exit(1);
    }
}

runTests();
