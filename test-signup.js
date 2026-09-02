const http = require('http');
const data = JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  phone: '0123456789'
});
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('BODY', body);
  });
});
req.on('error', (err) => {
  console.error('ERR', err.message);
});
req.write(data);
req.end();
