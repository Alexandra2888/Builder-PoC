import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

interface ProjectFile {
  path: string
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { project } = await request.json()

    if (!project) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      )
    }

    // Create a new ZIP file
    const zip = new JSZip()

    // Add all project files to the ZIP
    project.files.forEach((file: ProjectFile) => {
      zip.file(file.path, file.content)
    })

    // Add essential project files if not already included
    const existingPaths = project.files.map((f: ProjectFile) => f.path)

    // Add package.json if not present
    if (!existingPaths.includes('package.json')) {
      const packageJson = {
        name: project.name.toLowerCase().replace(/\s+/g, '-'),
        version: "0.1.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          lint: "next lint"
        },
        dependencies: {
          "next": "15.5.3",
          "react": "^19.1.0",
          "react-dom": "^19.1.0",
          "typescript": "^5",
          "@types/node": "^20",
          "@types/react": "^19",
          "@types/react-dom": "^19",
          "tailwindcss": "^4",
          "class-variance-authority": "^0.7.1",
          "clsx": "^2.1.1",
          "tailwind-merge": "^3.3.1",
          "lucide-react": "^0.544.0",
          "@radix-ui/react-slot": "^1.2.3"
        },
        devDependencies: {
          "eslint": "^8",
          "eslint-config-next": "15.5.3"
        }
      }
      zip.file('package.json', JSON.stringify(packageJson, null, 2))
    }

    // Add tsconfig.json if not present
    if (!existingPaths.includes('tsconfig.json')) {
      const tsConfig = {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "ES6"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [
            {
              name: "next"
            }
          ],
          baseUrl: ".",
          paths: {
            "@/*": ["./*"]
          }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
      }
      zip.file('tsconfig.json', JSON.stringify(tsConfig, null, 2))
    }

    // Add next.config.js if not present
    if (!existingPaths.includes('next.config.js') && !existingPaths.includes('next.config.ts')) {
      const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig`
      zip.file('next.config.js', nextConfig)
    }

    // Add README.md if not present
    if (!existingPaths.includes('README.md')) {
      const readme = `# ${project.name}

${project.description}

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## About

This project was generated using AI-powered design to code conversion.
`
      zip.file('README.md', readme)
    }

    // Add .gitignore if not present
    if (!existingPaths.includes('.gitignore')) {
      const gitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`
      zip.file('.gitignore', gitignore)
    }

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'blob' })

    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${project.name.toLowerCase().replace(/\s+/g, '-')}-project.zip"`
      }
    })

  } catch (error) {
    console.error('Export project failed:', error)
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    )
  }
}
