// content.js
let lastToken = localStorage.getItem("token");

console.log("Content script running, Initial token:", lastToken);

if (lastToken) {
    chrome.runtime.sendMessage({ token: lastToken });
}

// Poll for token changes to handle SPA routing (e.g. login without full page reload)
setInterval(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken && currentToken !== lastToken) {
        console.log("Token updated, sending to background.");
        chrome.runtime.sendMessage({ token: currentToken });
        lastToken = currentToken;
    } else if (!currentToken && lastToken) {
        // Handle logout
        chrome.runtime.sendMessage({ token: null });
        lastToken = null;
    }
}, 1000);