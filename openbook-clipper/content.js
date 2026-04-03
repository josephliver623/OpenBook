// OpenBook Clipper — Content Script
// Extracts post and comment data from 社交平台 pages

(function () {
  "use strict";

  // ── Utility ──────────────────────────────────────────────────

  function cleanText(el) {
    if (!el) return "";
    return el.innerText.replace(/\s+/g, " ").trim();
  }

  function toISODate(str) {
    if (!str) return new Date().toISOString().slice(0, 10);
    // 社交平台常见格式: "2024-11-15", "11-15", "3天前", "昨天", etc.
    const full = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    const m = str.match(full);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    return new Date().toISOString().slice(0, 10);
  }

  function randomHex(n) {
    const arr = new Uint8Array(n);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, n);
  }

  // ── SHA-256 Evidence Hash ────────────────────────────────────

  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // ── Post Extraction ──────────────────────────────────────────

  function extractPost() {
    const result = {
      url: window.location.href,
      noteId: "",
      title: "",
      author: "",
      date: "",
      content: "",
      images: [],
      likes: "",
      collects: "",
      comments: [],
    };

    // Note ID from URL
    const urlMatch = window.location.pathname.match(
      /\/(?:explore|discovery\/item)\/([a-f0-9]+)/
    );
    if (urlMatch) result.noteId = urlMatch[1];

    // Title — try multiple selectors
    const titleEl =
      document.querySelector("#detail-title") ||
      document.querySelector(".title") ||
      document.querySelector('[class*="title"]');
    if (titleEl) result.title = cleanText(titleEl);

    // Author
    const authorEl =
      document.querySelector(".username") ||
      document.querySelector('[class*="author"]') ||
      document.querySelector(".user-nickname") ||
      document.querySelector('[class*="name"]');
    if (authorEl) result.author = cleanText(authorEl);

    // Date
    const dateEl =
      document.querySelector(".date") ||
      document.querySelector('[class*="date"]') ||
      document.querySelector('[class*="time"]') ||
      document.querySelector(".bottom-container .right span");
    if (dateEl) result.date = toISODate(cleanText(dateEl));
    else result.date = new Date().toISOString().slice(0, 10);

    // Content — main post body
    const contentEl =
      document.querySelector("#detail-desc") ||
      document.querySelector(".desc") ||
      document.querySelector('[class*="desc"]') ||
      document.querySelector('[class*="content"]') ||
      document.querySelector(".note-text");
    if (contentEl) result.content = cleanText(contentEl);

    // Images
    const imgEls = document.querySelectorAll(
      '.swiper-slide img, [class*="slide"] img, .note-image img'
    );
    imgEls.forEach((img) => {
      const src = img.src || img.getAttribute("data-src");
      if (src && !result.images.includes(src)) result.images.push(src);
    });

    // Likes & Collects
    const likeEl = document.querySelector(
      '[class*="like"] [class*="count"], .like-wrapper .count'
    );
    if (likeEl) result.likes = cleanText(likeEl);

    const collectEl = document.querySelector(
      '[class*="collect"] [class*="count"], .collect-wrapper .count'
    );
    if (collectEl) result.collects = cleanText(collectEl);

    return result;
  }

  // ── Comment Extraction ───────────────────────────────────────

  function extractComments() {
    const comments = [];

    // 社交平台评论区的常见选择器
    const commentContainers = document.querySelectorAll(
      '.comment-item, [class*="comment-item"], [class*="commentItem"], .parent-comment, [class*="noteComment"]'
    );

    commentContainers.forEach((container) => {
      const comment = { author: "", content: "", likes: "", date: "", replies: [] };

      // Comment author
      const authorEl =
        container.querySelector('[class*="name"]') ||
        container.querySelector(".user-nickname") ||
        container.querySelector('[class*="author"]');
      if (authorEl) comment.author = cleanText(authorEl);

      // Comment content
      const contentEl =
        container.querySelector('[class*="content"]') ||
        container.querySelector('[class*="text"]') ||
        container.querySelector("p");
      if (contentEl) comment.content = cleanText(contentEl);

      // Comment likes
      const likeEl = container.querySelector(
        '[class*="like"] [class*="count"], [class*="like-count"]'
      );
      if (likeEl) comment.likes = cleanText(likeEl);

      // Comment date
      const dateEl = container.querySelector(
        '[class*="date"], [class*="time"]'
      );
      if (dateEl) comment.date = cleanText(dateEl);

      // Replies (sub-comments)
      const replyEls = container.querySelectorAll(
        '[class*="reply-item"], [class*="sub-comment"]'
      );
      replyEls.forEach((replyEl) => {
        const reply = { author: "", content: "" };
        const rAuthor = replyEl.querySelector('[class*="name"]');
        const rContent =
          replyEl.querySelector('[class*="content"]') ||
          replyEl.querySelector("p");
        if (rAuthor) reply.author = cleanText(rAuthor);
        if (rContent) reply.content = cleanText(rContent);
        if (reply.content) comment.replies.push(reply);
      });

      if (comment.content) comments.push(comment);
    });

    return comments;
  }

  // ── Generate OpenBook Markdown ───────────────────────────────

  function generateMarkdown(post, meta) {
    const id = `${meta.city.toLowerCase()}-${meta.category}-${post.date}-${randomHex(4)}`;
    const tags = meta.tags.length > 0 ? `[${meta.tags.join(", ")}]` : "[]";

    let md = `---
id: ${id}
category: ${meta.category}
city: ${meta.city}
area: ${meta.area}
date: ${post.date}
tags: ${tags}
source_url: ${post.url}
source_platform: social-platform
evidence_hash: ${meta.evidenceHash}
disputed: false
---

# ${meta.title || post.title || "无标题"}

`;

    if (meta.userNote) {
      md += `${meta.userNote}\n\n`;
    }

    md += `## 原始内容\n\n`;
    md += `> **作者：** ${post.author}\n`;
    md += `> **日期：** ${post.date}\n`;
    md += `> **来源：** [社交平台](${post.url})\n\n`;
    md += `${post.content}\n\n`;

    if (post.comments && post.comments.length > 0) {
      md += `## 评论区精选\n\n`;
      post.comments.forEach((c, i) => {
        md += `**${c.author || "匿名用户"}**`;
        if (c.date) md += ` (${c.date})`;
        if (c.likes) md += ` 👍${c.likes}`;
        md += `\n`;
        md += `> ${c.content}\n\n`;
        if (c.replies && c.replies.length > 0) {
          c.replies.forEach((r) => {
            md += `>> **${r.author || "匿名"}**: ${r.content}\n\n`;
          });
        }
      });
    }

    return md;
  }

  // ── Message Handler ──────────────────────────────────────────

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extract") {
      const post = extractPost();
      post.comments = extractComments();
      // Compute evidence hash from the raw content
      const rawContent = JSON.stringify({
        url: post.url,
        title: post.title,
        content: post.content,
        author: post.author,
        comments: post.comments.map((c) => ({
          author: c.author,
          content: c.content,
        })),
        extractedAt: new Date().toISOString(),
      });
      sha256(rawContent).then((hash) => {
        post.evidenceHash = hash;
        post.rawForHash = rawContent;
        sendResponse({ success: true, data: post });
      });
      return true; // async response
    }

    if (request.action === "generateMarkdown") {
      const md = generateMarkdown(request.post, request.meta);
      sendResponse({ success: true, markdown: md });
      return true;
    }
  });

  // ── Inject floating button on XHS pages ──────────────────────

  function injectClipButton() {
    if (document.getElementById("openbook-clip-btn")) return;

    // Only show on note/explore pages
    if (
      !window.location.pathname.includes("/explore/") &&
      !window.location.pathname.includes("/discovery/item/")
    )
      return;

    const btn = document.createElement("div");
    btn.id = "openbook-clip-btn";
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
      <span>Clip to OpenBook</span>
    `;
    btn.title = "Clip this post to OpenBook";
    btn.addEventListener("click", () => {
      // Trigger popup
      chrome.runtime.sendMessage({ action: "openPopup" });
    });
    document.body.appendChild(btn);
  }

  // Run on page load and URL changes (SPA)
  injectClipButton();
  const observer = new MutationObserver(() => {
    injectClipButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
