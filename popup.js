const saveBtn = document.getElementById("saveBtn");
const statuss = document.getElementById("status");
const loginLink = document.getElementById("loginLink");

saveBtn.addEventListener("click", async () => {
    try {
        statuss.innerText = "saving...";

        // 1. Get current tab
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        const url = tab.url;

        // 2. Detect type (outside)
        let type = "article";

        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            type = "video";
        } else if (url.includes("twitter.com") || url.includes("x.com")) {
            type = "tweet";
        } else if (
            url.endsWith(".pdf") ||
            url.endsWith(".docx") ||
            url.endsWith(".xlsx")
        ) {
            type = "document";
        } else if (url.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
            type = "image";
        }

        // 3. Extract text (only when needed)
        let result = "";

        if (type === "article" || type === "video") {
            const response = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const isYoutube = window.location.href.includes("youtube.com/watch");

                    if (isYoutube) {
                        const title = document.querySelector("h1")?.innerText || "";
                        const desc = document.querySelector("#description")?.innerText || "";
                        return (title + "\n" + desc).slice(0, 2000);
                    }

                    const article = document.querySelector("article");
                    if (article) return article.innerText.slice(0, 5000);

                    const main = document.querySelector("main");
                    if (main) return main.innerText.slice(0, 5000);

                    return document.body.innerText.slice(0, 5000);
                }
            });

            result = response[0].result;
        }

        // 4. Get token
        const { token } = await chrome.storage.local.get("token");

        if (!token) {
            statuss.innerText = "Login required";
            loginLink.style.display = "block";
            return;
        }

        // 5. Prepare data
        const data = {
            title: tab.title,
            url,
            type,
            text:
                type === "article" || type === "video"
                    ? (result?.slice(0, 5000) || tab.title)
                    : ""
        };

        // 6. Send request
        const res = await fetch("https://mindarchive.onrender.com/api/content/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        await res.json();

        statuss.innerText = "Saved ✅";

    } catch (error) {
        console.error(error);
        statuss.innerText = "Error ❌";
    }
});