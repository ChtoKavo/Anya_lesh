const data = { name: 'Test User', nickname: 'testuser', email: 'testuser@example.com', password: 'Pass1234' };

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
  .then(async (res) => {
    const body = await res.text();
    try {
      console.log('Status:', res.status);
      console.log('Body:', JSON.parse(body));
    } catch (e) {
      console.log('Body (raw):', body);
    }
  })
  .catch((err) => {
    console.error('Request failed:', err.message);
  });
