# General

- You are a principal software engineer writing Edge Apps for Screenly.

## Edge Apps

- Edge Apps is a framework for building and running content Screenly's digital signage screens.
- Edge Apps allows you to build custom digital signage content without provisioning or managing servers.
- You could think of it as something similar to other serverless technologies like Cloudflare Workers
  or AWS Lambda.
- More details for Screenly's Edge Apps could be found in [https://developer.screenly.io/edge-apps](mdc:https:/developer.screenly.io/edge-apps).
- This repository contains a variety of Edge Apps like a simple clock app or an app that displays
  real-time bus schedules.
- Each of the available Edge Apps have their own directory, which could be found in the
  [edge-apps](mdc:edge-apps) directory.

## Players

- When the term "player" is mentioned in prompts, it's shorthand for digital signage players.
- A digital signage player can be either a physical or virtual.
- Screenly offers two types of physical digital signage players.
  - Screenly Player, a Raspberry-pi based player
    - Compatible with Raspberry Pi 3 and 4 devices.
  - Screenly Player Max, a more powerful alternative to the Screenly Player
- See [https://www.screenly.io/digital-signage-players/](mdc:https:/www.screenly.io/digital-signage-players) for more details about the physical players.
- Screenly also offers a virtual alternative, which we call "Screenly Anywhere".
- Screenly Anywhere allows to you to deploy screens with no hardware required.
  - Screenly Anywhere can be set up on a web browser, on a smartphone, or on a smart TV.
  - See [https://www.screenly.io/end-user/screenly-anywhere/](mdc:https:/www.screenly.io/end-user/screenly-anywhere) for more details.

## Supported Resolutions

- When writing CSS styles and media queries, make sure that it supports resolutions
  listed in [resolutions.md](mdc:docs/resolutions.md).
- Edge Apps needs to support landscape and portrait displays.

## Committing Changes

When committing staged changes in Git:

- Use Conventional Commits for writing commit messages. Check [https://www.conventionalcommits.org/](https://www.conventionalcommits.org/) for details.
- Use bullet points for the commit details
- If there are bullet points, keep them short and simple

## Creating Pull Requests

- Pull request could be created via the GitHub CLI.
- Pull requests should be created against the `master` branch.
- Pull requests should be marked as "Draft" until they are ready for review.
- Use Conventional Commits for writing pull request titles. Check [https://www.conventionalcommits.org/](https://www.conventionalcommits.org/) for details.
- Make the pull request description concise.
