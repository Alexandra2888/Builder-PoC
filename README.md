# AI Builder - Design to Code

An AI-powered application builder that transforms your ideas into fully functional Next.js applications in seconds. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and powered by LangChain + Anthropic Claude.

![AI Builder Demo](https://via.placeholder.com/800x400/3b82f6/ffffff?text=AI+Builder+Demo)

## 🚀 Features

- **AI Design Generation**: Describe your app in natural language and get a complete design specification
- **Design Review & Approval**: Interactive workflow to review, approve, or request changes to generated designs
- **Code Generation**: Automatically generate production-ready Next.js code from approved designs
- **Live Preview**: Real-time preview of generated applications with responsive viewport switching
- **File Explorer**: Browse and examine all generated project files
- **Code Editor**: Monaco editor with syntax highlighting and TypeScript support
- **Design History**: Track and revert to previous design iterations
- **Export & Download**: Download complete projects for local development

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Zustand** - Lightweight state management
- **Monaco Editor** - VS Code-like code editing experience
- **React Resizable Panels** - Flexible layout system

### Backend & AI
- **LangChain.js** - AI application framework
- **Anthropic Claude** - Advanced language model for design and code generation
- **Next.js API Routes** - Serverless backend functionality

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd builder-poc
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 How to Use

### 1. Design Tab - Create Your App Design

1. **Describe Your App**: Write a detailed description of the application you want to build
2. **Use Quick Templates**: Or select from predefined templates (Dashboard, Landing Page, E-commerce, etc.)
3. **Generate Design**: Click "Generate Design" to create a comprehensive design specification
4. **Review Results**: Examine the generated components, layout, colors, and styling

### 2. Approve or Iterate

- **✅ Approve**: If you're happy with the design, click "Approve & Generate Code"
- **💬 Request Changes**: Provide feedback for design modifications
- **❌ Reject**: Start over with a new design

### 3. Code Tab - Generated Application

Once approved, switch to the Code tab to:
- **Browse Files**: Explore the complete Next.js project structure
- **View Code**: Examine generated components, pages, and configurations
- **Live Preview**: See your app running in real-time
- **Download**: Export the complete project for local development

## 🎯 Example Prompts

Here are some example prompts to get you started:

### Dashboard Application
```
Create a modern analytics dashboard for a SaaS company with:
- Clean sidebar navigation
- Data visualization charts
- User management interface  
- Dark mode support
- Responsive design for mobile and desktop
```

### E-commerce Store
```
Build an online store for handmade jewelry with:
- Product catalog with filtering
- Shopping cart functionality
- Checkout process
- Customer reviews
- Modern, elegant design
```

### Portfolio Website
```
Design a creative portfolio for a UI/UX designer featuring:
- Hero section with personal branding
- Project showcase with case studies
- About me section
- Contact form
- Smooth animations and transitions
```

## 🏗️ Project Structure

```
builder-poc/
├── app/
│   ├── api/                 # API routes
│   │   ├── generate-design/ # Design generation endpoint
│   │   └── generate-code/   # Code generation endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── tabs/               # Tab components
│   │   ├── design-tab.tsx  # Design generation interface
│   │   └── code-tab.tsx    # Code viewing interface
│   ├── ui/                 # shadcn/ui components
│   ├── header.tsx          # Application header
│   └── main-layout.tsx     # Main layout component
├── lib/
│   ├── hooks/              # React hooks
│   ├── api.ts              # API client functions
│   ├── store.ts            # Zustand state management
│   └── utils.ts            # Utility functions
└── README.md
```

## ⚙️ Configuration

### Customizing AI Behavior

You can modify the AI prompts in:
- `app/api/generate-design/route.ts` - Design generation prompts
- `app/api/generate-code/route.ts` - Code generation prompts

### Styling and Themes

- Edit `app/globals.css` for global styles
- Modify `tailwind.config.js` for Tailwind customization
- Update `components.json` for shadcn/ui configuration

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. **New Components**: Add to `components/` directory
2. **API Endpoints**: Create in `app/api/` directory
3. **State Management**: Extend `lib/store.ts`
4. **Styling**: Use Tailwind classes or extend `globals.css`

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your `ANTHROPIC_API_KEY` to environment variables
4. Deploy!

### Environment Variables for Production

```env
ANTHROPIC_API_KEY=your_production_api_key
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful and accessible components
- [LangChain](https://langchain.com) - Framework for developing AI applications
- [Anthropic](https://anthropic.com) - AI safety company behind Claude
- [Vercel](https://vercel.com) - The platform for frontend developers

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue if your problem isn't already reported
3. Join our community discussions

---

**Built with ❤️ by the AI Builder team**
