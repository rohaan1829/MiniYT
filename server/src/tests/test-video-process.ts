import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUpload() {
    const API_URL = 'http://localhost:4000/api';
    const loginData = {
        email: 'test@example.com',
        password: 'password123'
    };

    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, loginData);
        const token = loginRes.data.token;
        console.log('Logged in successfully');

        const formData = new FormData();
        formData.append('title', 'Test Transcoding Video');
        formData.append('description', 'Testing the new background workflow');

        // Create a dummy small mp4 if it doesn't exist
        const videoPath = path.join(__dirname, 'test-video.mp4');
        if (!fs.existsSync(videoPath)) {
            console.log('Creating dummy video file...');
            fs.writeFileSync(videoPath, Buffer.alloc(1024 * 1024)); // 1MB dummy file
        }

        formData.append('video', fs.createReadStream(videoPath));

        console.log('Uploading video...');
        const uploadRes = await axios.post(`${API_URL}/videos/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload response:', JSON.stringify(uploadRes.data, null, 2));
        const videoId = uploadRes.data.data.id;
        console.log(`Video created with ID: ${videoId}. Now waiting for processing...`);

        // Poll for status
        let status = 'processing';
        let attempts = 0;
        while (status === 'processing' && attempts < 10) {
            attempts++;
            await new Promise(r => setTimeout(r, 5000));
            const videoRes = await axios.get(`${API_URL}/videos/${videoId}`);
            status = videoRes.data.data.status;
            console.log(`Attempt ${attempts}: Status is ${status}`);
            if (status === 'ready') {
                console.log('✅ Video processing successful!');
                console.log('Thumbnail URL:', videoRes.data.data.thumbnailUrl);
                return;
            }
        }

        if (status !== 'ready') {
            console.log('❌ Video processing timed out or failed. Status:', status);
        }

    } catch (error: any) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

// Ensure you run this with ts-node or tsx
// npm install axios form-data
testUpload();
