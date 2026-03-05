# 🛡️ CodeSentinel — AI Code Review Agent

> A fully functional CLI code review agent powered by **Claude AI**. Review any file for bugs, security issues, and code quality — right from your terminal.

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
cd codesentinel
npm install
```

### 2. Make the CLI executable
```bash
chmod +x src/cli.js
npm link
```

### 3. Set your Anthropic API key
```bash
# Option A: environment variable (recommended for CI/CD)
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Option B: save it permanently
codesentinel config --set-key sk-ant-your-key-here
```

Get your API key at: https://console.anthropic.com

---

## 🧑‍💻 Commands

### Review a single file
```bash
codesentinel review ./src/app.js
```

```bash
# With options:
codesentinel review ./src/app.py --fix              # Show fixed version
codesentinel review ./src/app.js --severity critical # Only show critical issues
codesentinel review ./src/app.ts --output report.md  # Save report to markdown
codesentinel review ./src/app.go --output report.json # Save as JSON
codesentinel review ./src/app.java --lang Java        # Force language
codesentinel review ./src/app.js --json              # Raw JSON output (CI/CD)
```

### Scan an entire directory/project
```bash
codesentinel scan ./src
```

```bash
# With options:
codesentinel scan ./src --ext js,ts,py          # Specific file types
codesentinel scan . --ignore node_modules,dist  # Ignore patterns
codesentinel scan ./src --output full-report.md # Save full report
```

### Manage config
```bash
codesentinel config --set-key sk-ant-...   # Save API key
codesentinel config --show                 # View current config
codesentinel config --reset                # Reset everything
```

---

## 🔍 What the Agent Reviews

| Category | What it checks |
|---|---|
| 🔴 **Security** | SQL injection, XSS, hardcoded secrets, command injection, path traversal |
| 🔴 **Bugs** | Null/undefined errors, off-by-one, race conditions, wrong logic |
| 🟡 **Performance** | N+1 queries, memory leaks, inefficient loops, blocking calls |
| 🟡 **Error Handling** | Missing try/catch, unhandled promises, silent failures |
| 🟢 **Best Practices** | Naming, DRY violations, dead code, complexity |
| 🟢 **Style** | Consistency, readability, documentation |

---

## 📊 Severity Levels

- 🔴 **Critical** — Must fix immediately. Security vulnerabilities or data-breaking bugs.
- 🟡 **Warning** — Should fix. Could cause bugs or performance issues.
- 🟢 **Suggestion** — Nice to fix. Code quality and best practices.

---

## 🔧 CI/CD Integration

```yaml
# GitHub Actions example
- name: Code Review
  run: |
    npm install -g codesentinel
    codesentinel scan ./src --json --output review.json
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Exit codes:
- `0` — No critical issues
- `1` — Critical issues found (fails CI pipeline)

---

## 📁 Project Structure

```
codesentinel/
├── src/
│   ├── cli.js              # Entry point & command definitions
│   ├── commands/
│   │   ├── review.js       # Single file review command
│   │   ├── scan.js         # Directory scan command
│   │   └── config.js       # API key management
│   └── lib/
│       ├── agent.js        # Claude AI integration
│       ├── renderer.js     # Terminal output formatter
│       └── config.js       # Config file management
├── examples/
│   └── buggy-sample.js    # Sample file with intentional bugs to test
├── package.json
└── README.md
```

---

## 🌍 Supported Languages

JavaScript, TypeScript, Python, Java, Go, Ruby, PHP, Rust, C, C++, C#, Swift, Kotlin, Bash, SQL

---

## 🔑 API Key Notes

- Never commit your API key to git
- Add `.codesentinel/` to your `.gitignore` if sharing the config directory
- Use environment variables in CI/CD
- Your key is stored locally at `~/.codesentinel/config.json`

---

Built with ❤️ using Claude AI by Anthropic
