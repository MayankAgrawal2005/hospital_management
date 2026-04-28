const http = require('http');

const data = JSON.stringify({
  name: "Mayank",
  email: "test@example.com",
  password: "password123",
  role: "patient"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
