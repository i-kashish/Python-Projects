const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function populateData() {
    try {
        console.log('--- Starting Data Population ---');

        // 1. Register/Login as Admin to get token
        let token;
        let adminId;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'System Admin',
                email: 'admin' + Date.now() + '@school.com',
                password: 'adminpassword123',
                role: 'admin'
            });
            token = loginRes.data.token;
            adminId = loginRes.data.user.id;
            console.log('Logged in as Admin. Token obtained.');
        } catch (err) {
            console.error('Failed to get admin token:', err.response?.data || err.message);
            return;
        }

        const config = {
            headers: { 'x-auth-token': token }
        };

        // 2. Create 25 Students
        const students = [];
        console.log('Creating 25 students...');
        for (let i = 1; i <= 25; i++) {
            try {
                const studentRes = await axios.post(`${API_URL}/users`, {
                    name: `Student ${i}`,
                    email: `student${i}_${Date.now()}@school.com`,
                    password: 'password123',
                    role: 'student',
                    class: '10th A',
                    rollNumber: `R0${i}`,
                    department: 'Science'
                }, config);
                students.push(studentRes.data.user);
                process.stdout.write('.');
            } catch (err) {
                console.error(`\nFailed to create student ${i}:`, err.response?.data || err.message);
            }
        }
        console.log(`\nCreated ${students.length} students.`);

        // 3. Mark Attendance (14 Present, 5 Absent, 6 Late)
        console.log('Marking attendance...');
        const today = new Date().toISOString().split('T')[0];
        
        const marks = [
            { count: 14, status: 'present' },
            { count: 5, status: 'absent' },
            { count: 6, status: 'late' }
        ];

        let studentIndex = 0;
        for (const mark of marks) {
            console.log(`Marking ${mark.count} as ${mark.status}...`);
            for (let i = 0; i < mark.count; i++) {
                if (studentIndex >= students.length) break;
                
                const student = students[studentIndex];
                try {
                    await axios.post(`${API_URL}/attendance`, {
                        student: student.id,
                        date: today,
                        status: mark.status,
                        class: '10th A',
                        subject: 'Mathematics'
                    }, config);
                    process.stdout.write('.');
                } catch (err) {
                    console.error(`\nFailed to mark attendance for ${student.name}:`, err.response?.data || err.message);
                }
                studentIndex++;
            }
            console.log();
        }

        console.log('--- Data Population Complete ---');
        console.log(`Summary: 25 Students Added, Attendance Marked: 14 Present, 5 Absent, 6 Late.`);

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

populateData();
