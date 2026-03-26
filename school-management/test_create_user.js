const axios = require('axios');

async function testCreateStudent() {
    try {
        const response = await axios.post('http://localhost:5001/api/users', {
            name: 'Test Student',
            email: 'test' + Date.now() + '@example.com',
            rollNumber: '123',
            class: '10th',
            department: 'Science',
            role: 'student',
            password: 'password123'
        });
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testCreateStudent();
