// content.js
const token = localStorage.getItem("token");

console.log("Content script running, token:", token);

if (token) {
    chrome.runtime.sendMessage({ token });
}