const email = `test_${Date.now()}@example.com`;
const username = `testuser_${Date.now()}`;

fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email,
    username,
    fullname: "Test User",
    password: "password123",
    role: "CUSTOMER",
  }),
})
  .then(res => res.json().then(data => ({ status: res.status, data })))
  .then(console.log)
  .catch(console.error);
