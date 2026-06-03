# GitHub MCP Server Setup

The GitHub MCP Server has been installed and configured for this project. Follow these steps to complete the setup.

## Current Status

✅ Docker image pulled (`ghcr.io/github/github-mcp-server`)  
✅ `.mcp.json` configuration created  
✅ `.mcp.json` added to `.gitignore` for security  
⚠️ GitHub Personal Access Token (PAT) needs to be configured  

## Step 1: Create GitHub Personal Access Token

1. Visit: https://github.com/settings/personal-access-tokens/new

2. Configure the token:
   - **Token name**: `Claude Code MCP Server`
   - **Expiration**: 90 days (or your preference)
   - **Repository access**: Choose based on your needs:
     - "All repositories" - Full access
     - "Public Repositories (read-only)" - Minimal
     - Select specific repositories

3. **Permissions** (minimum required):
   - Repository permissions:
     - ✅ **Contents**: Read and write
     - ✅ **Issues**: Read and write
     - ✅ **Pull requests**: Read and write
     - ✅ **Metadata**: Read-only (automatic)
   
   Optional (for organization features):
   - Organization permissions:
     - ✅ **Members**: Read-only

4. Click **Generate token** and **copy the token immediately** (you won't see it again!)

## Step 2: Store the Token Securely

Add the token to your shell profile (`~/.zshrc`):

```bash
echo 'export GITHUB_PAT="your_github_token_here"' >> ~/.zshrc
source ~/.zshrc
```

**Replace `your_github_token_here` with your actual token.**

## Step 3: Verify Installation

Restart your Claude Code session to load the new MCP server. You should see GitHub-related tools available.

Test the connection:
```bash
# Claude Code will automatically detect and load the GitHub MCP server
# You can now use natural language to interact with GitHub
```

## Available Capabilities

Once configured, you can use Claude Code to:

### Repositories
- List, search, and browse repositories
- Get repository information and statistics
- Fork repositories
- Manage repository settings

### Issues
- Create, read, update, and close issues
- Add labels and assignees
- Comment on issues
- Search issues across repositories

### Pull Requests
- Create, review, and merge pull requests
- Comment on PRs and review changes
- Request reviewers
- Manage PR labels and milestones

### Users & Organizations
- Get user and organization information
- List organization members
- Check repository permissions

### Code
- Search code across repositories
- Read file contents
- Browse repository structure

## Example Usage

With the MCP server installed, you can ask Claude Code things like:

```
"Create a new issue in github/github-mcp-server titled 'Feature request'"
"List all open pull requests in this repository"
"Show me recent issues assigned to me"
"Create a new branch called 'feature/mcp-integration'"
```

## Configuration Details

The MCP server is configured in `.mcp.json`:

```json
{
  "github": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-e",
      "GITHUB_PERSONAL_ACCESS_TOKEN",
      "ghcr.io/github/github-mcp-server"
    ],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_PAT}"
    }
  }
}
```

This configuration:
- Runs the GitHub MCP server in Docker
- Uses the `GITHUB_PAT` environment variable for authentication
- Automatically cleans up containers after use (`--rm`)

## Troubleshooting

### "Permission denied" or authentication errors
- Verify your GitHub PAT is set: `echo $GITHUB_PAT`
- Check the token has the required permissions
- Ensure you've reloaded your shell: `source ~/.zshrc`

### MCP server not loading
- Restart Claude Code session
- Check Docker is running: `docker ps`
- Verify the image is pulled: `docker images | grep github-mcp-server`

### Token expired
- Create a new token at https://github.com/settings/tokens
- Update the `GITHUB_PAT` environment variable
- Restart your shell session

## Security Notes

- ✅ `.mcp.json` is excluded from git (in `.gitignore`)
- ✅ Token is stored in your shell profile, not in the repository
- ⚠️ Never commit your GitHub PAT to version control
- ⚠️ Use fine-grained tokens with minimal required permissions
- 🔒 Consider using shorter expiration times (30-90 days)

## Advanced Configuration

### Read-Only Mode

To restrict to read-only operations:

```bash
export GITHUB_READ_ONLY=1
```

### Custom GitHub Enterprise Server

For GitHub Enterprise Server:

```bash
export GITHUB_HOST="https://your-ghes-domain.com"
```

### Specific Toolsets

Enable only specific features:

```bash
export GITHUB_TOOLSETS="repos,issues,pull_requests"
```

Available toolsets:
- `context` - Repository context
- `repos` - Repository management
- `issues` - Issue tracking
- `pull_requests` - PR management
- `users` - User information
- `actions` - GitHub Actions
- `code_security` - Security features
- `dependabot` - Dependency management
- `discussions` - Discussions
- `gists` - Gist management
- `git` - Git operations
- `labels` - Label management
- `notifications` - Notifications
- `orgs` - Organization management
- `projects` - Project boards
- `secret_protection` - Secret scanning
- `security_advisories` - Security advisories
- `stargazers` - Stars management

## Resources

- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Next Steps

1. ✅ Complete Step 2 above (store your GitHub PAT)
2. 🔄 Restart Claude Code
3. 🎉 Start using GitHub commands naturally!

---

**Installation Complete!** Once you've set up your GitHub PAT, the MCP server will be ready to use.
