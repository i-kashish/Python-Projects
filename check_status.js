const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function checkStatus() {
    try {
        const adminEmail = 'checker' + Date.now() + '@school.com';
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Status Checker',
            email: adminEmail,
            password: 'password123',
            role: 'admin'
        });
        const token = registerRes.data.token;
        
        const config = {
            headers: { 'x-auth-token': token }
        };

        const [studentRes, teacherRes, attRes] = await Promise.all([
            axios.get(`${API_URL}/users?role=student`, config),
            axios.get(`${API_URL}/users?role=teacher`, config),
            axios.get(`${API_URL}/attendance`, config)
        ]);

        console.log('--- DB Status ---');
        console.log('Total Students:', studentRes.data.totalUsers);
        console.log('Total Teachers:', teacherRes.data.totalUsers);
        console.log('Total Attendance Records:', attRes.data.attendance.length);
        console.log('--- End Status ---');

    } catch (err) {
        console.error('Error checking status:', err.response?.data || err.message);
    }
}

checkStatus();
