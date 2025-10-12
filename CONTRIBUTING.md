# How to contribute

## Contribute with PRs

First of all, thanks for contributing! To contribute code, open a pull request with your changes.

I'd like to ask you not to format existing code, like adding semicolons or changing single quotes to double quotes everywhere. When contributing code, focus on your changes and nothing else.

## Developing locally

Install dependencies:

```
pnpm install
```

Run tests:

```
pnpm test
```

Run dev playground:

```
pnpm dev
```

## Releasing

_Note:_ This is for maintainers.

1. Bump version in package.json.
2. Create a new commit on main with the version as commit title (no v prefix, e.g. just "0.6.1"). Either push directly to main or create a PR.
3. Create and publish a new release on GitHub. As release title, use the `v` prefix + version (e.g. "v0.6.1").
4. Fill in the description.
5. Clicking "publish" will automatically trigger a GitHub Action that publishes the new release to npmjs.