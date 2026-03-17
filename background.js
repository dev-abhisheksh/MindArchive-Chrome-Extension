chrome.runtime.onMessage.addListener((msg) => {
    if (msg.token) {
        chrome.storage.local.set({ token: msg.token });
    }
});