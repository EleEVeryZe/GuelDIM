2. Use Strict File Naming ConventionsEnforce a rigid naming convention so files sort naturally in your terminal or IDE sidebar.Format: [ID]-[priority]-[short-slug].md
Example: 0412-p1-auth-jwt-expiration.mdPad IDs with leading zeros (0412 instead of 412) so they sort alphabetically.3. Embed Structured Metadata (Front Matter)Begin every Markdown ticket with a YAML front matter block. This allows you to programmatically parse, filter, and script your tickets later.yaml---
id: 0412
title: "Fix JWT expiration refresh token bug"
author: "@dev_name"
assignee: "@dev_name"
priority: "high"
milestone: "v1.2.0"
component: "backend"
created_at: 2026-05-11
---
## Description
The refresh token expires 5 minutes too early...
Use o código com cuidado.4. Tie Tickets Directly to Git BranchesCreate a strict 1:1 relationship between a ticket file, a Git branch, and a Pull Request (PR).Moving Status: When a developer starts a task, their PR should literally execute a git mv command, moving the file from .tasks/todo/ to .tasks/in-progress/.Closing Tasks: When the PR merges into main, the file moves to .tasks/done/vX.Y.Z/. This eliminates the need for status updates in a separate UI.5. Build a Simple Terminal Viewer (CLI)Large text-based systems benefit from fast terminal visualization. You can create a simple bash alias or use tools like glow to render your Kanban board directly in the terminal:bash# Quick view of current TODO items
alias todo="ls -1 .tasks/todo/"

# View a ticket with markdown formatting
glow .tasks/todo/0412-p1-auth-jwt-expiration.md
Use o código com cuidado.6. Avoid Merge Conflicts with Single FilesThe biggest risk of this method in large teams is merge conflicts.Rule: Never use a single, massive TODO.md file for the whole project.Why: If five developers edit the same file simultaneously, resolving conflicts will become a daily nightmare. One file per ticket completely isolates changes.7. Automate Validation with CI/CDAdd a pre-commit hook or a GitHub Action to validate your tickets.Ensure the YAML front matter contains all required fields (assignee, priority).Ensure file names match the exact required regex pattern.Reject the commit if a developer forgets to move a file to in-progress while working on a matching branch name.