# Screenshots Guide for Assignment Submission

This directory should contain the following screenshots to document the project:

## Required Screenshots

### 1. docker-compose-running.png
- Screenshot showing `docker-compose up -d` command output
- Should display both services starting successfully
- Shows container names: pastebin-postgres and pastebin-app

### 2. application-browser.png
- Screenshot of the application running in browser at http://localhost:3000
- Should show the main "Reading List Dashboard" interface
- Include the URL bar showing localhost:3000

### 3. add-article-form.png
- Screenshot of adding an article through the form
- Fill in a sample article title and URL
- Show the "Add Article" button

### 4. article-list-with-data.png
- Screenshot showing articles in the list
- Display at least 2-3 articles
- Show read/unread toggle and delete buttons

### 5. docker-ps-output.png
- Screenshot of `docker ps` or `docker-compose ps` output
- Show both containers running (STATUS: Up, healthy)
- Display ports mapping (3000:3000, 5432:5432)

### 6. health-check-response.png
- Screenshot of health check endpoint response
- Run: `curl http://localhost:3000/api/health`
- Show JSON response with status: "healthy"

### 7. github-repository-structure.png
- Screenshot of GitHub repository main page
- Show folder structure (src/, docs/, Dockerfile, etc.)
- Display README.md and other key files

### 8. pull-request-view.png
- Screenshot of the Pull Request from feature/docker-setup to main
- Show PR title, description, and files changed
- Include screenshots in PR description

### 9. github-actions-success.png (if CI runs)
- Screenshot of GitHub Actions workflow passing
- Show green checkmarks for all jobs
- Display: lint-and-typecheck, docker-build jobs

### 10. makefile-commands.png
- Screenshot running `make help`
- Show all available make commands with descriptions

## How to Take Screenshots

### Using Terminal Commands
```bash
# For terminal output, you can use:
docker-compose ps > output.txt  # Save to file
# Then screenshot the terminal

# For health check:
curl http://localhost:3000/api/health | jq .
# Screenshot the formatted JSON output
```

### Browser Screenshots
1. Open http://localhost:3000 in your browser
2. Use browser's screenshot tool or:
   - Windows: Windows Key + Shift + S
   - Mac: Cmd + Shift + 4
   - Linux: PrtScn or Shift + PrtScn

### GitHub Screenshots
1. Navigate to https://github.com/Abdullah-AboOun/Paste-Bin
2. Capture repository structure
3. Open Pull Request and capture
4. Open Actions tab (if workflows ran)

## Naming Convention
- Use descriptive names as listed above
- Use PNG format for best quality
- Save all screenshots in this directory

## Tips
- Ensure screenshots are clear and readable
- Crop out unnecessary UI elements
- Show relevant information prominently
- Use high DPI/resolution for text clarity
