# Temp Blog

This application is a **private blog platform** where users can write personal blog posts in complete privacy, while still experiencing the feeling of having an engaged audience through AI-generated replies.

## Core Concept

Many people want to write and express themselves but:

- Don't want to publish publicly
- Still crave the sense of being heard and having readers
- Want thoughtful responses to their writing

This app solves that by providing AI agents that read and respond to blog posts, giving users the emotional benefit of an audience without sacrificing their privacy.

## Getting started

### Prerequisites

Just run `pnpm install`, should install all dependencies

### Initialize `convex`

**If you have an account & project w/ [Convex](https://www.convex.dev/) already**
`npx convex dev --once`

**Local Environment**:
`npx convex dev --local --once`

### Set GitHub Auth

Follow [this guide](https://labs.convex.dev/auth/config/oauth/github) to setup.

### Set server environment

- `npx @convex-dev/auth`
  - `SITE_URL`: `http://localhost:3000/`
  - Yes for all next steps
- `npx convex env set AUTH_GITHUB_ID <client id>`
- `npx convex env set AUTH_GITHUB_SECRET <auth secret>`
- `npx convex env set OPENAI_API_KEY <OpenAI API Key>`

### Boot

In two different terminals

- `npm start`
- `npx convex dev`
