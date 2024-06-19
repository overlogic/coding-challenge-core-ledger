# Project Overview

Welcome to the project repository! This guide will help you get started and understand the different parts of the project.

## Technologies Used

- **SST**: We use [SST](https://sst.dev/) for easy serverless deployments and live lambda development.
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/).
- **Messaging**: EventBridge Event Bus for easy publishing and subscribing.

## Code Structure

Feel free to adjust the code structure as you see fit and use the patterns that work best for you.

- **Infrastructure**: Located in the `/stacks` folder.
- **Application Code**: Found in `/packages`.
- **Lambda Functions**: Found in `/functions`.

## Installation

You will need an active AWS account to run this code. Follow these steps to set up your environment:

1. [Setup AWS Account](https://sst.dev/chapters/create-an-aws-account.html)
2. [Create IAM User](https://sst.dev/chapters/create-an-iam-user.html)
3. [Configure AWS CLI](https://sst.dev/chapters/configure-the-aws-cli.html)

> **Hint**: Please ensure you have node v18.18.2 or above installed.

Then, follow these commands:

```sh
pnpm install
pnpm run build # Ensures all types are working
pnpm run dev # will start deploy the ressources and start the live lambda development
```

You can optionally run with `aws-vault`:

If you update the database models, generate the migration files with:

```sh
pnpm run generate:migrations
```

> **Hint**: If you encounter timeouts during `pnpm run dev`, it might be due to the database needing to spin up as it is currently in idle mode.

## Running Tests

To run tests, ensure your environment is deployed or running with `pnpm run dev`. In another terminal window, run:

```sh
cd packages/core && pnpm run test
```

> **Hint**: The database might need some time to start. If you get timeouts, try again after a few minutes.

## Removing Resources

Remember to remove resources after you are done to avoid unnecessary AWS billing costs, especially for the database.

```sh
pnpm run remove
```
