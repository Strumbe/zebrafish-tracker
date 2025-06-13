# Zebrafish Tracker

This repository contains a Next.js project.

## Remote Repository Setup

This project does not include a Git remote by default. To push your changes to
GitHub, first add your repository as a remote and then push:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

Replace `<your-repo-url>` with the URL of your GitHub repository.

## Running the App

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The server listens on port `3000`. On the machine running the command you can
visit `http://localhost:3000`. If you need to access it from another machine on
the same network, replace `localhost` with the host computer's IP address.

## Environment

This workspace has internet access. As long as you configure your Git remote
and credentials, commands like `git push` or `npm install` will work normally.

