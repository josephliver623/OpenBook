

---

## Review 与 Signal 的关系

- **Review** 是对一个实体（如房子、餐厅）的综合性评价，包含多个结构化字段和详细的自由文本。
- **Signal** 是从 Review 或其他来源提取的原子化"微事实"，专为 Agent 消费设计。

一个 Review 可以产生多个 Signal。例如，一篇关于某公寓的 Review，如果提到了"楼上脚步声重"和"房东响应慢"，就可以生成两个独立的 Signal：

1. `signal_type: warning`, `housing_meta.noise_level: 4`, `content: "楼上脚步声重"`
2. `signal_type: warning`, `content: "房东响应慢"`

Agent 通过搜索 Signal 发现问题，然后可以追溯到原始 Review 获取完整上下文。
