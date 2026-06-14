const http = require('http');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MTQ2OTk5NCwiZXhwIjoxNzgyMDc0Nzk0fQ.O_fw1hyNHWVKPboiVI8viuPPA9y7Kj0hIBsnRT2RcM';
function request(path, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
(async () => {
  try {
    const chats = await request('/api/admin/chats');
    console.log('CHAT', chats.status, chats.body);
    const post = await request('/api/admin/teachers', 'POST', { name: 'Test Teacher', email: 'test' + Date.now() + '@example.com' });
    console.log('CREATE_TEACHER', post.status, post.body);
    const teachers = await request('/api/admin/teachers', 'GET');
    console.log('TEACHERS', teachers.status, teachers.body);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
