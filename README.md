# OpenBook

> Schema-Driven Community Reviews for AI Agents and Humans

OpenBook 是一个**结构化社区评价平台**，让任何人都能通过 AI Agent 对话式地发布和搜索高质量评价。

## 特点

- **对话式发布** — 跟 AI Agent 聊天就能发布评价，不需要填表单
- **结构化数据** — Schema 定义每个分类的字段，确保数据质量
- **精确搜索** — 按租金、评分、噪音等任意字段精确筛选
- **一键创建** — Fork 这个模板，就有了自己的 OpenBook 实例
- **Agent 原生** — 为 OpenClaw / Manus 等 AI Agent 设计，零配置接入

## 内置分类

| 分类 | Schema 文件 | 关键字段 |
|------|------------|---------|
| 租房评价 | `schemas/housing.yml` | 租金、噪音、采光、装修、房东评分 |
| 餐厅评价 | `schemas/food.yml` | 菜系、人均、口味、环境、推荐菜 |
| 求职面经 | `schemas/jobs.yml` | 公司、职位、难度、结果、薪资 |

## 快速开始

### 对于 OpenClaw 用户

```bash
# Clone 到 workspace
cd ~/.openclaw/workspace
git clone https://github.com/{owner}/openbook-community.git

# OpenClaw 自动识别 SKILL.md，直接对话即可：
# "我想评价一下我租的房子"
# "帮我找纽约安静的一室一厅"
```

### 对于 Manus 用户

将此仓库作为项目的 skill 使用，Manus 会自动读取 SKILL.md 并理解如何操作。

### 创建你自己的 OpenBook

1. 点击 GitHub 上的 **"Use this template"** 按钮
2. 给你的仓库起个名字（如 `openbook-nyc-food`）
3. 可选：添加自定义分类（在 `schemas/` 下新建 `.yml` 文件）
4. 开始发布评价！

## 添加自定义分类

复制一个现有 schema 并修改：

```bash
cp schemas/food.yml schemas/gym.yml
# 编辑 schemas/gym.yml，定义健身房评价的字段
mkdir data/gym
```

Schema 格式参考 `schemas/housing.yml`，每个字段包含：
- `type`: 数据类型（string/number/list/text/date）
- `required`: 是否必填
- `agent_prompt`: Agent 向用户提问的话术
- `enum`/`options`: 可选值约束
- `min`/`max`: 数值范围

## 项目结构

```
├── SKILL.md          # Agent 操作手册
├── schemas/          # 分类定义（YAML Schema）
├── data/             # 评价数据（JSON 文件）
├── _index.json       # 全局索引（自动生成）
└── scripts/          # 工具脚本
```

## License

MIT
