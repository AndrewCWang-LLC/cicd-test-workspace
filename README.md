# CI/CD Test Workspace

Testing how to set up Blue/Green deployment. This is a test
workspace with BullMQ, Redis, and a NextJS app.

We're deploying this to AWS ECS. There's no intention to run docker
compose with these because it hogs so much resources.

### Setup

```shell
mkdir cicd-test-workspace
cd cicd-test-workspace
npm init -y
npm install typescript -D
mkdir -p apps/website
mkdir -p apps/bullmq
mkdir -p packages/redis
```

Root package.json:
```json
{
  "name": "cicd-test-workspace",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

Setup NextJS and BullMQ apps:
```shell
cd apps/website
npx create-next-app@latest . --ts
rm -rf .git
mv .gitignore ../../.gitignore
cd ../bullmq
npm init -y
npm install bullmq ioredis typescript ts-node @types/node
mkdir src
touch src/index.ts
```

In BullMQ folder, add tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "paths": {
      "@bullground/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

In website folder, edit tsconfig's `path` section
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@website/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Set up Redis:
```shell
cd ../../packages/redis
npm init -y
npm install ioredis @types/ioredis typescript
mkdir src
touch src/index.ts
```

Create tsconfig.json for Redis. Ensure you have the `paths` section
```json
{
  "compilerOptions": {
    "lib": ["esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@cicd-test-workspace/redis/*": ["./src/*"]
    },
    "rootDir": "./src",
    "outDir": "./build"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

Edit redis package.json to include imports and exports:
```json
{
  "name": "@cicd-test-workspace/redis",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "exports": [
    {
      "import": "./src/index.ts",
      "require": "./src/index.ts"
    }
  ],
  "keywords": [],
  "author": "",
  "license": "ISC",
  "private": true
}
```

Add local dependency:

```shell
npm install @cicd-test-workspace/redis --workspace=apps/website
npm install @cicd-test-workspace/redis --workspace=apps/bullmq
```
