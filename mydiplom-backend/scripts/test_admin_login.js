const creds = { email: 'admin@example.com', password: 'AdminPass123' };

(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    const loginBody = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login body:', loginBody);

    if (!loginBody.token) return;

    const profileRes = await fetch('http://localhost:5000/api/profile/me', {
      headers: { Authorization: `Bearer ${loginBody.token}` },
    });
    const profileBody = await profileRes.json();
    console.log('Profile status:', profileRes.status);
    console.log('Profile body:', profileBody);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
