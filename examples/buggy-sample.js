// buggy-sample.js — intentionally buggy code for testing CodeSentinel
// Run: codesentinel review examples/buggy-sample.js --fix

const mysql = require('mysql');
const SECRET_KEY = "super_secret_password_123";  // hardcoded secret
const DB_PASS = "admin1234";                      // another hardcoded secret

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: DB_PASS,
  database: 'users_db'
});

// SQL injection vulnerability
function getUserByName(username) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.query(query);
}

// XSS vulnerability
function renderUserProfile(user) {
  document.getElementById('profile').innerHTML = user.bio;  // unescaped
}

// No error handling on async function
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
}

// Off-by-one error
function getLastNItems(arr, n) {
  return arr.slice(arr.length - n + 1);  // wrong, should be arr.length - n
}

// Memory leak — event listener never removed
function attachClickHandler(element) {
  element.addEventListener('click', function() {
    console.log('clicked');
  });
}

// Missing null check
function processUser(user) {
  return user.profile.address.city.toUpperCase();  // will crash if any is null
}

// Passwords stored in plain text
function saveUser(username, password) {
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
  db.query(query);
}

// Race condition
let counter = 0;
async function incrementCounter() {
  const current = counter;
  await someAsyncOperation();
  counter = current + 1;  // race condition — reads stale value
}

async function someAsyncOperation() {
  return new Promise(resolve => setTimeout(resolve, 100));
}

module.exports = { getUserByName, renderUserProfile, fetchUserData, saveUser };
