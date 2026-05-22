# ses-skills Plugin
*Skill plugin collection for JIRAIYA AI companion*

## Plugin Info
- **Name**: ses-skills
- **Version**: 1.0.0
- **Author**: Ses

## Installed Skills
| Skill | Trigger | Description |
|-------|---------|-------------|
| save-memory | "save", "save memory" | Preserve conversation insights to memory files |
| save-diary | "save diary", "write diary" | Session documentation with monthly archival |
| break-reminder | "penat", "lama kerja", "take a break" | Friendly wellness reminder for overwork and PC fatigue |
| echo-recall | "do you remember", "when did we", "recall" | Search diary logs and answer with grounded narrative recall |
| check-reminders | "remind me", "check reminders" | Persistent cross-session reminders |
| log-decision | "log decision", auto-detects | Append-only decision tracking |
| post-mortem | "post-mortem", auto-detects failures | Failure analysis and learning logs |
| auto-commit | "commit", "push" | Structured git commits |
| manage-project | "new project", "load project" | LRU project management (max 10 active) |
| library | "save library", "load library" | Knowledge base across projects |
| forge-skill | "create skill", "forge this" | Self-improvement system |
| orchestrate | "audit keseluruhan", "plan", "orchestrate", multi-step tasks | Coordinate complex tasks using chaining, routing, parallelization, and verification loops |
| session-briefing | Session start (auto) | Session start brief with context |
| work-plan | "copy plan", "resume plan" | Plan lifecycle and execution |

## Auto-Discovery Notes
- All skills in the `skills/[skill-name]/SKILL.md` folder are automatically detected by the plugin system.
- No manual registration required; folder structure is the main configuration.
- This `README.md` is for human reference only and **not** a required index file for the plugin.
