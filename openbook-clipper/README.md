# OpenBook Clipper

A Chrome extension that lets you clip valuable posts and comments from Xiaohongshu (RedNote) directly into the OpenBook format.

[English](./README.md) | [简体中文](#简体中文)

---

## What It Does

When you're browsing Xiaohongshu and find a post worth preserving — a rental scam warning, a noise complaint about a building, a review of a landlord — click the OpenBook Clipper icon. The extension will:

1. **Extract** the post title, author, content, and all comments from the current page
2. **Generate** a SHA-256 evidence hash of the raw content (for tamper-proof verification)
3. **Auto-detect** city, tags, and category from the content
4. Let you **edit** metadata, select which comments to include, and add your own notes
5. **Export** a ready-to-submit OpenBook Markdown file

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `openbook-clipper` folder
5. The extension icon (blue "OB") will appear in your toolbar

## Usage

1. Navigate to any Xiaohongshu post page (`xiaohongshu.com/explore/...`)
2. Click the **OpenBook Clipper** icon in your toolbar
3. Review the extracted content and evidence hash
4. Fill in metadata (city, area, category, tags)
5. Select which comments to include
6. Click **Copy to Clipboard** or **Download .md file**
7. Submit the file as a PR to the [OpenBook repository](https://github.com/josephliver623/OpenBook)

## Privacy & Security

- All data extraction happens **locally in your browser**
- Your Xiaohongshu cookies and login state **never leave your device**
- No data is sent to any server — the extension works entirely offline
- The evidence hash is computed locally using the Web Crypto API

## File Structure

```
openbook-clipper/
├── manifest.json      # Chrome extension manifest (MV3)
├── content.js         # Content script — extracts data from XHS pages
├── content.css        # Floating "Clip" button style
├── background.js      # Service worker
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles (dark theme)
├── popup.js           # Popup logic
└── icons/             # Extension icons
```

---

<a name="简体中文"></a>

## 简体中文

### 这是什么

一个 Chrome 浏览器插件，让你在浏览小红书时，一键将有价值的帖子和评论"剪藏"为 OpenBook 格式。

### 安装方法

1. 下载或克隆本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角的**开发者模式**
4. 点击**加载已解压的扩展程序**，选择 `openbook-clipper` 文件夹
5. 工具栏会出现蓝色的 "OB" 图标

### 使用方法

1. 打开任意小红书帖子页面
2. 点击工具栏的 **OpenBook Clipper** 图标
3. 查看提取的内容和证据哈希
4. 填写元数据（城市、区域、分类、标签）
5. 选择要包含的评论
6. 点击**复制到剪贴板**或**下载 .md 文件**
7. 将文件作为 PR 提交到 [OpenBook 仓库](https://github.com/josephliver623/OpenBook)

### 隐私与安全

- 所有数据提取都在**你的浏览器本地**完成
- 你的小红书 Cookie 和登录状态**绝不会离开你的设备**
- 不会向任何服务器发送数据——插件完全离线工作
- 证据哈希使用浏览器原生的 Web Crypto API 在本地计算
