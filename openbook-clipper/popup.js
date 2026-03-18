// OpenBook Clipper — Popup Logic

(function () {
  "use strict";

  // ── State ────────────────────────────────────────────────────

  let extractedData = null;
  let selectedComments = new Set();
  let currentMarkdown = "";

  // ── DOM refs ─────────────────────────────────────────────────

  const stateNotXhs = document.getElementById("state-not-xhs");
  const stateExtracting = document.getElementById("state-extracting");
  const stateEditing = document.getElementById("state-editing");
  const statePreview = document.getElementById("state-preview");

  // ── Helpers ──────────────────────────────────────────────────

  function showState(el) {
    [stateNotXhs, stateExtracting, stateEditing, statePreview].forEach(
      (s) => s.classList.add("hidden")
    );
    el.classList.remove("hidden");
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2000);
  }

  function randomHex(n) {
    const arr = new Uint8Array(n);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, n);
  }

  function escapeYaml(str) {
    if (!str) return '""';
    if (/[:#\[\]{}&*!|>'"%@`]/.test(str) || str.trim() !== str) {
      return '"' + str.replace(/"/g, '\\"') + '"';
    }
    return str;
  }

  // ── Generate Markdown ────────────────────────────────────────

  function generateMarkdown() {
    const post = extractedData;
    const title = document.getElementById("input-title").value || post.title || "无标题";
    const city = document.getElementById("input-city").value || "Unknown";
    const area = document.getElementById("input-area").value || "";
    const category = document.getElementById("input-category").value || "housing";
    const tagsRaw = document.getElementById("input-tags").value;
    const userNote = document.getElementById("input-note").value;

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const tagsStr = tags.length > 0 ? `[${tags.join(", ")}]` : "[]";

    const id = `${city.toLowerCase().replace(/\s+/g, "")}-${category}-${post.date || new Date().toISOString().slice(0, 10)}-${randomHex(4)}`;

    let md = `---
id: ${id}
category: ${category}
city: ${escapeYaml(city)}
area: ${escapeYaml(area)}
date: ${post.date || new Date().toISOString().slice(0, 10)}
tags: ${tagsStr}
source_url: ${post.url}
source_platform: xiaohongshu
evidence_hash: ${post.evidenceHash}
disputed: false
---

# ${title}

`;

    if (userNote) {
      md += `${userNote}\n\n`;
    }

    md += `## 原始内容\n\n`;
    md += `> **作者：** ${post.author || "未知"}\n`;
    md += `> **日期：** ${post.date || "未知"}\n`;
    md += `> **来源：** [小红书](${post.url})\n\n`;
    md += `${post.content || ""}\n\n`;

    // Selected comments
    const selectedList = post.comments.filter((_, i) => selectedComments.has(i));
    if (selectedList.length > 0) {
      md += `## 评论区精选\n\n`;
      selectedList.forEach((c) => {
        md += `**${c.author || "匿名用户"}**`;
        if (c.date) md += ` (${c.date})`;
        if (c.likes) md += ` [${c.likes} 赞]`;
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

  // ── Render Comments ──────────────────────────────────────────

  function renderComments(comments) {
    const list = document.getElementById("comments-list");
    const total = document.getElementById("comments-total");
    const section = document.getElementById("comments-section");

    if (!comments || comments.length === 0) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");
    total.textContent = `(${comments.length} 条)`;
    list.innerHTML = "";

    comments.forEach((c, i) => {
      const item = document.createElement("div");
      item.className = "comment-item" + (selectedComments.has(i) ? " selected" : "");
      item.innerHTML = `
        <input type="checkbox" class="comment-checkbox" data-idx="${i}" ${selectedComments.has(i) ? "checked" : ""}>
        <div class="comment-body">
          <div class="comment-author">${c.author || "匿名用户"}</div>
          <div class="comment-text">${c.content}</div>
          <div class="comment-meta">${c.date || ""} ${c.likes ? "· " + c.likes + " 赞" : ""}</div>
        </div>
      `;

      item.addEventListener("click", (e) => {
        if (e.target.type === "checkbox") return;
        const cb = item.querySelector(".comment-checkbox");
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event("change"));
      });

      const cb = item.querySelector(".comment-checkbox");
      cb.addEventListener("change", () => {
        if (cb.checked) {
          selectedComments.add(i);
          item.classList.add("selected");
        } else {
          selectedComments.delete(i);
          item.classList.remove("selected");
        }
      });

      list.appendChild(item);
    });
  }

  // ── Populate form with extracted data ────────────────────────

  function populateForm(data) {
    document.getElementById("preview-title").textContent = data.title || "无标题";
    document.getElementById("preview-author").textContent = `作者: ${data.author || "未知"}`;
    document.getElementById("preview-content").textContent = data.content || "无内容";
    document.getElementById("preview-comments-count").textContent =
      `${data.comments ? data.comments.length : 0} 条评论 · ${data.likes || 0} 赞 · ${data.collects || 0} 收藏`;
    document.getElementById("evidence-hash").textContent = data.evidenceHash || "计算中...";
    document.getElementById("input-title").value = data.title || "";

    // Auto-detect city from content
    const content = (data.title + " " + data.content).toLowerCase();
    if (content.includes("上海") || content.includes("shanghai")) {
      document.getElementById("input-city").value = "Shanghai";
    } else if (content.includes("杭州") || content.includes("hangzhou")) {
      document.getElementById("input-city").value = "Hangzhou";
    } else if (content.includes("北京") || content.includes("beijing")) {
      document.getElementById("input-city").value = "Beijing";
    } else if (content.includes("深圳") || content.includes("shenzhen")) {
      document.getElementById("input-city").value = "Shenzhen";
    }

    // Auto-detect tags from content
    const autoTags = [];
    if (content.includes("噪音") || content.includes("噪声") || content.includes("吵")) autoTags.push("noise");
    if (content.includes("隔音")) autoTags.push("bad-soundproofing");
    if (content.includes("押金")) autoTags.push("deposit-issue");
    if (content.includes("地铁")) autoTags.push("near-subway");
    if (content.includes("装修")) autoTags.push("renovation-noise");
    if (autoTags.length > 0) {
      document.getElementById("input-tags").value = autoTags.join(", ");
    }

    // Default select all comments
    if (data.comments) {
      data.comments.forEach((_, i) => selectedComments.add(i));
    }
    renderComments(data.comments || []);
  }

  // ── Event Handlers ───────────────────────────────────────────

  document.getElementById("btn-select-all").addEventListener("click", () => {
    const allSelected = selectedComments.size === extractedData.comments.length;
    selectedComments.clear();
    if (!allSelected) {
      extractedData.comments.forEach((_, i) => selectedComments.add(i));
    }
    renderComments(extractedData.comments);
    document.getElementById("btn-select-all").textContent = allSelected ? "全选" : "取消全选";
  });

  document.getElementById("btn-preview").addEventListener("click", () => {
    currentMarkdown = generateMarkdown();
    document.getElementById("markdown-preview").textContent = currentMarkdown;
    showState(statePreview);
  });

  document.getElementById("btn-back").addEventListener("click", () => {
    showState(stateEditing);
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    currentMarkdown = generateMarkdown();
    navigator.clipboard.writeText(currentMarkdown).then(() => {
      showToast("已复制到剪贴板");
    });
  });

  document.getElementById("btn-copy-md").addEventListener("click", () => {
    navigator.clipboard.writeText(currentMarkdown).then(() => {
      showToast("已复制到剪贴板");
    });
  });

  document.getElementById("btn-download").addEventListener("click", () => {
    currentMarkdown = generateMarkdown();
    const city = document.getElementById("input-city").value.toLowerCase().replace(/\s+/g, "") || "unknown";
    const category = document.getElementById("input-category").value || "housing";
    const date = extractedData.date || new Date().toISOString().slice(0, 10);
    const filename = `${city}-${category}-${date}-${randomHex(4)}.md`;

    const blob = new Blob([currentMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已下载 ${filename}`);
  });

  // ── Init ─────────────────────────────────────────────────────

  async function init() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.url.includes("xiaohongshu.com")) {
        showState(stateNotXhs);
        return;
      }

      // Check if it's a note page
      if (
        !tab.url.includes("/explore/") &&
        !tab.url.includes("/discovery/item/")
      ) {
        showState(stateNotXhs);
        return;
      }

      showState(stateExtracting);

      // Inject content script if needed and extract
      chrome.tabs.sendMessage(tab.id, { action: "extract" }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded, inject it
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ["content.js"],
            },
            () => {
              setTimeout(() => {
                chrome.tabs.sendMessage(tab.id, { action: "extract" }, handleResponse);
              }, 500);
            }
          );
        } else {
          handleResponse(response);
        }
      });
    } catch (err) {
      console.error("Init error:", err);
      showState(stateNotXhs);
    }
  }

  function handleResponse(response) {
    if (response && response.success) {
      extractedData = response.data;
      populateForm(extractedData);
      showState(stateEditing);
    } else {
      showState(stateNotXhs);
    }
  }

  init();
})();
