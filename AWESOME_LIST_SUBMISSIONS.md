# Awesome List Submission Guide

## Pre-Written PR Descriptions

### awesome-devtools

**Title:** Add Status Badge 2.0 — Free uptime monitoring badges

**Description:**
Adds Status Badge 2.0, a free forever uptime badge service running on Cloudflare Workers.

Features:
- One-line script embed
- Runs on Cloudflare's free tier (100K requests/day)
- Shadow DOM isolated
- MIT licensed

**Line to add:**
```markdown
- [Status Badge 2.0](https://github.com/ozxc44/status-badge-2) - Free uptime monitoring badges on Cloudflare Workers
```

### awesome-cloudflare

**Title:** Add Status Badge 2.0 — Workers-based monitoring

**Description:**
Adds Status Badge 2.0, demonstrating real-world use of Cloudflare Workers + KV for uptime monitoring.

**Line to add:**
```markdown
- [Status Badge 2.0](https://github.com/ozxc44/status-badge-2) - Serverless status badges using Workers + KV
```

### awesome-serverless

**Title:** Add Status Badge 2.0 — Serverless monitoring example

**Description:**
Adds Status Badge 2.0, a practical example of serverless architecture for monitoring.

**Line to add:**
```markdown
- [Status Badge 2.0](https://github.com/ozxc44/status-badge-2) - Free status badges on Cloudflare Workers
```

## Command to Submit PR

```bash
# For each awesome list:
gh repo clone OWNER/REPO /tmp/REPO
cd /tmp/REPO

# Find the appropriate category in README.md
# Add the line
git checkout -b add-status-badge-2
git commit -am "Add Status Badge 2.0"
gh pr create --title "Add Status Badge 2.0" --body "See commit message"
```
