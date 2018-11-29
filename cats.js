const SUBREDDIT = "catsstandingup";

let isLoading = false;
let after = null;


document.addEventListener("DOMContentLoaded", handleScroll);
document.addEventListener("scroll", handleScroll);

function handleScroll() {
    if (isLoading || !shouldLoadMore()) {
        return;
    }
    setLoading(true);
    let postsPromise = getPosts(SUBREDDIT, after);
    postsPromise.then(({ data }) => {
                    after = data.after;
                    addPosts(data.children);
                })
                .finally(() => {
                    setLoading(false);
                    handleScroll();
                });
}

function addPosts(posts) {
    document.getElementById("posts").innerHTML += posts.map(post => post.data)
                                                       .filter(post => post.post_hint === "image")
                                                       .map(getHtml)
                                                       .join("");
}

function getHtml(post) {
    const originalUrl = "https://reddit.com" + post.permalink;
    return `<div class="card">
                <div class="card__title">
                    <h2><a href="${originalUrl}">${post.title}</a></h2>
                    <div><strong>Author:</strong> ${post.author != null ? "/u/" + post.author : "unknown"}</div>
                </div>
                <div class="card__content">
                    <a href="${originalUrl}">
                        <img src="${post.url}">
                    </a>
                </div>
           </div>`;
}

function getPosts(subreddit, after) {
    console.log("Loading posts...");
    const url = '//kodu.ut.ee/~jaagupky/reddit.php' + toQueryParams({ subreddit, after });
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            }
            else {
                reject(xhr);
            }
        };
        xhr.send();
    });
}

function toQueryParams(params) {
    if (params == null || Object.keys(params).length === 0) {
        return "";
    }
    return "?" + Object.entries(params)
                       .filter(([key, value]) => value != null)
                       .map(([key, value]) => encodeURIComponent(key) + "=" + encodeURIComponent(value))
                       .join("&");
}

function setLoading(value) {
    isLoading = value;
    document.getElementById("loader").style.display = value ? "block" : "none";
}

function shouldLoadMore() {
    const scrollPosition = window.pageYOffset;
    const windowSize = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;
    return (bodyHeight - (scrollPosition + windowSize)) < 1000;
}

