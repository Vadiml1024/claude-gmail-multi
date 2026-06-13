# gmail-multi-mcp

Connect **multiple Gmail accounts** to Claude (or any [MCP](https://modelcontextprotocol.io)
client) from one local server. The official Gmail connector only supports a single Google
account — this lets you search, read, draft, send, label, and organize mail across as many
accounts as you like, each addressed by a friendly alias.

Your OAuth tokens are stored **locally on your machine only** — never uploaded anywhere.

## Features

- 🔢 **Unlimited accounts** — every tool takes an `account` parameter (`"personal"`, `"work"`, …)
- 🔎 **Search & read** — full Gmail search syntax, thread/message reading, attachment download
- ✍️ **Compose** — create/list/delete drafts, send mail, replies with correct threading headers
- 🏷️ **Organize** — full label management, archive, trash
- 🔐 **Local-first** — standard Google OAuth; tokens live in `~/.gmail-mcp/`, chmod 600
- 🧩 **22 tools**, works with Claude Code, Claude Desktop, Cursor, and any MCP client

## Prerequisites

- **Node.js ≥ 20**
- A Google account (and a free Google Cloud project — setup below)

## 1. Install

```bash
git clone https://github.com/Vinksj/claude-gmail-multi.git
cd claude-gmail-multi
npm install
npm run build
```

## 2. Create your Google OAuth app (one-time, ~10 min)

You register one OAuth "app" with Google; it then works for all the accounts you connect.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create a project (e.g. `gmail-mcp`).
2. **APIs & Services → Library** → search **Gmail API** → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - User type **External** → Create.
   - App name + your support email + your contact email → Save and Continue.
   - Scopes page → Save and Continue. Test users page → Save and Continue.
4. **Publish to production:** on the OAuth consent screen, set **Publishing status → Publish app**.
   *(In "Testing" mode Google expires your refresh token every 7 days. Publishing avoids that.
   You'll click through a one-time "Google hasn't verified this app" warning per account — that's
   normal for a personal app: choose **Advanced → Continue**.)*
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type **Desktop app** → Create → **Download JSON**.
6. Save that file as `~/.gmail-mcp/credentials.json`:
   ```bash
   mkdir -p ~/.gmail-mcp && chmod 700 ~/.gmail-mcp
   mv ~/Downloads/client_secret_*.json ~/.gmail-mcp/credentials.json
   chmod 600 ~/.gmail-mcp/credentials.json
   ```

> Note: newer Google Cloud UIs put these under **"Google Auth Platform"** (Branding / Audience /
> Clients) instead of "OAuth consent screen" — same steps, different labels.

## 3. Connect your accounts

```bash
npm run auth -- --alias personal --email you@gmail.com
npm run auth -- --alias work --email you@company.com
```

Each opens a browser → pick the matching Google account → approve. The optional `--email` flag
aborts if the wrong account gets authorized (an easy mistake with multi-login browsers). Connect
as many as you want; re-run any time a token is revoked.

## 4. Register with your MCP client

**Claude Code:**
```bash
claude mcp add --scope user gmail-multi -- node "$(pwd)/dist/index.js"
```

**Claude Desktop / other clients** — add to your MCP config:
```json
{
  "mcpServers": {
    "gmail-multi": {
      "command": "node",
      "args": ["/absolute/path/to/gmail-multi-mcp/dist/index.js"]
    }
  }
}
```

Tools appear as `gmail-multi`'s `search_threads`, `create_draft`, etc. Ask things like
*"search my work inbox for unread from this week"* or *"draft a reply in personal to Alice."*

## Tools

| Group | Tools |
|---|---|
| Accounts | `list_accounts`, `add_account` |
| Read | `search_threads`, `get_thread`, `get_message`, `download_attachment` |
| Compose | `create_draft`, `list_drafts`, `delete_draft`, `send_draft`, `send_message` |
| Labels | `list_labels`, `create_label`, `update_label`, `delete_label`, `label_thread`, `unlabel_thread`, `label_message`, `unlabel_message` |
| Cleanup | `archive_thread`, `trash_thread`, `trash_message` |

Every tool except `list_accounts` takes an `account` parameter (alias or email). Replies via
`replyToMessageId` get correct `In-Reply-To`/`References` headers and threading automatically.

## How it works

- One self-owned Google Cloud OAuth app (Desktop client) authorizes any number of accounts.
- Single scope: `https://www.googleapis.com/auth/gmail.modify` (read, search, drafts, send,
  labels, archive, trash — narrower than full `https://mail.google.com/`).
- Per-account refresh tokens stored in `~/.gmail-mcp/tokens/<alias>.json` (chmod 600); the
  account registry is `~/.gmail-mcp/config.json`. Nothing leaves your machine.

```
~/.gmail-mcp/
├── credentials.json        # your OAuth client (you add this)
├── config.json             # alias → email map (auto-managed)
└── tokens/<alias>.json     # per-account refresh tokens (auto-managed)
```

## Security notes

- Tokens are stored as plain files readable only by your user (chmod 600). On a single-user
  machine with full-disk encryption this is reasonable; moving token storage to the OS keychain
  is a sensible future hardening step.
- Never commit `~/.gmail-mcp/` — it lives in your home directory, outside this repo, and the
  repo's `.gitignore` excludes build artifacts and dependencies regardless.
- The `gmail.modify` scope cannot permanently delete mail — `trash_*` tools move items to Trash
  (recoverable for 30 days).

## Development

```bash
npm run build      # tsc -> dist/
npm run inspect    # MCP Inspector UI against the built server
npm run auth -- --alias <name> [--email <expected>]
```

Important: stdout is the JSON-RPC channel — never `console.log` in server code; use `console.error`.

## License

MIT © Saurabh Jain
