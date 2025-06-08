# Quirra - AI-Powered Product Requirements Assistant

Quirra is an intelligent web application that helps product managers and teams create comprehensive user stories and Product Requirements Documents (PRDs) through an interactive chat interface. It uses OpenAI's GPT model to guide users through a structured process of gathering requirements and generating well-formatted documentation.

## Features

- 🤖 Interactive chat interface for gathering product requirements
- 📝 Structured questionnaire covering all aspects of feature development
- 🎯 Generates INVEST-compliant user stories
- 📋 Comprehensive documentation including:
  - User stories
  - Acceptance criteria
  - Validation rules
  - Authorization rules
  - Edge cases
  - API specifications
  - Dependencies and limitations
- 🌓 Dark/Light theme support
- 📱 Responsive design
- 📋 Markdown support for better formatting
- 🔄 Real-time chat interaction

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- OpenAI API
- TipTap Editor
- Radix UI Components

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/quirra.git
cd quirra
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Usage

1. Enter your OpenAI API key when prompted
2. Start describing your product idea or feature
3. Answer the series of questions that Quirra asks
4. Receive a comprehensive user story and PRD at the end

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## License

This project is licensed under the MIT License - see the LICENSE file for details.
