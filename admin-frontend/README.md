# React + Vite

## Backend API address

The frontend reads the backend base URL from `VITE_API_BASE_URL` at Vite startup/build time.

Local development uses the safe value from `.env.development`:

```text
VITE_API_BASE_URL=http://localhost:5269
```

Start the local frontend as usual:

```powershell
npm.cmd run dev
```

For another environment, set `VITE_API_BASE_URL` explicitly in the build process before running `npm.cmd run build`. The value must be an absolute `http` or `https` URL and may include a base path. Credentials, query parameters, and fragments are rejected.

`VITE_*` values are embedded into the browser bundle and are public. Never put passwords, JWT signing keys, connection strings, or other secrets in them.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
