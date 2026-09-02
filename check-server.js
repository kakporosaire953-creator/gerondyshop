const http = require('http');
const url = 'http://localhost:3000/api/auth/me';
http.get(url, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers));
  res.setEncoding('utf8');
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY', body);
  });
}).on('error', (err) => {
  console.error('ERR', err.message);
});
