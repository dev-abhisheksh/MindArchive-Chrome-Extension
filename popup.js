const saveBtn = document.getElementById("saveBtn")
const statuss = document.getElementById("status")
const loginLink = document.getElementById("loginLink");


saveBtn.addEventListener("click", async () => {
    try {
        statuss.innerText = "saving..."

        //get curret tab
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        })

        //extract page text
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const isYoutube = window.location.href.includes("youtube.com/watch");

                if (isYoutube) {
                    const title = document.querySelector("h1")?.innerText || "";
                    const desc = document.querySelector("#description")?.innerText || "";
                    return (title + "\n" + desc).trim();
                }

                // ❌ remove junk elements
                document.querySelectorAll(`
    nav, footer, aside, script, style,
    header, form, button, input,
    [role="navigation"], [role="complementary"]
  `).forEach(el => el.remove());

                // ❌ remove hyperlinks but keep text
                document.querySelectorAll("a").forEach(a => {
                    const span = document.createElement("span");
                    span.innerText = a.innerText;
                    a.replaceWith(span);
                });

                const article = document.querySelector("article");
                if (article) return article.innerText;

                const main = document.querySelector("main");
                if (main) return main.innerText;

                return document.body.innerText;
            }
        })

        const { token } = await chrome.storage.local.get("token")
        if (!token) {
            statuss.innerText = "Login required";
            loginLink.style.display = "block"; // show link
            return;
        }

        const isYoutube = tab.url.includes("youtube.com/watch")

        const data = {
            title: tab.title,
            url: tab.url,
            type: isYoutube ? "video" : "article",
            text: result && result.trim().length > 0
                ? result.slice(0, 5000)
                : tab.title
        };

        const res = await fetch("https://mindarchive.onrender.com/api/content/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })

        await res.json()
        statuss.innerText = "Saved"

    } catch (error) {
        console.error(error);
        statuss.innerText = "Error ";
    }
})