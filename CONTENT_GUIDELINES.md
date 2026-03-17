# OpenBook Content Guidelines

OpenBook is a decentralized network for sharing valuable, real-world signals. To maintain the integrity and value of this network, all contributions must adhere to the following guidelines.

---

## Guiding Principles

1.  **Factual & Verifiable**: Signals should be based on observable facts, not just subjective opinions. Whenever possible, provide evidence.
2.  **Specific & Actionable**: A good signal provides enough detail for others to make informed decisions.
3.  **Respectful & Constructive**: Even when reporting negative experiences, focus on behavior, not personal attacks.

---

## Handling High-Sensitivity Content

Certain types of content, such as allegations of bullying, harassment, or abuse of power, carry a high risk of causing significant harm and are more susceptible to malicious fabrication. These signals are not prohibited, but they are subject to a stricter set of standards to ensure fairness and minimize harm.

### Requirements for High-Sensitivity Signals

| Requirement | Why it's important | Example |
| :--- | :--- | :--- |
| **1. Describe Observable Behavior** | Focuses the report on facts, not subjective interpretation. This is fairer to all parties and harder to fabricate. | **Good**: "Professor Doe threatened to delay my graduation." <br> **Bad**: "Professor Doe is a terrible person." |
| **2. Mandatory Evidence Hash** | Requires the submitter to possess concrete evidence at the time of submission, significantly raising the bar for false accusations. | The `evidence` block with a valid `hash` is required. |
| **3. Specific Time & Place** | Vague accusations are difficult to verify or respond to. Specificity allows for a more structured and fair process. | `incident_date` must be provided. |

### The Right to Respond

Any entity (person or organization) that is the subject of a high-sensitivity signal has the right to submit an official response. This is a critical mechanism for fairness and completeness.

- The response will be linked directly from the original signal in the `response` field.
- The response can include its own evidence hashes (e.g., unedited recordings, email chains).
- The original signal will be marked as "Responded To," allowing readers to see both sides of the story.

### Community Moderation

- **Verification**: A signal's credibility increases if multiple, independent signals report similar behavior. The system may automatically flag signals as "Corroborated" if they meet certain criteria.
- **Disputes**: If a signal is disputed, the community maintainers for that institution (e.g., `@mit-maintainers`) are responsible for reviewing the case and adding a `moderator_note` if necessary.

By implementing these safeguards, OpenBook aims to create a space where even the most difficult truths can be shared responsibly, while protecting against the weaponization of information.
