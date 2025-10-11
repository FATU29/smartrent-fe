# 🚀 Smart Rent Frontend - Modern React Architecture

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Getting Started](#getting-started)
4. [Naming Conventions](#naming-conventions)
5. [Component Structure](#component-structure)
6. [Development Guidelines](#development-guidelines)
7. [Version Control](#version-control)

---

## 🎯 Project Overview

**Smart Rent Frontend** is a modern React/Next.js application built with a sophisticated hybrid architecture that combines multiple design patterns for scalability, maintainability, and optimal developer experience.

### Tech Stack

- **Framework**: Next.js 15.4.5 with TypeScript
- **Package Manager**: npm (required)
- **UI Library**: TailwindCSS + shadcn/ui components
- **State Management**: React Hook Form + Custom hooks + Contexts
- **Internationalization**: next-intl
- **Icons**: Iconify & Lucide React
- **Code Quality**: ESLint + Prettier + Husky

### Prerequisites

- Node.js (latest version - check with `nvm use`)
- npm package manager
- Environment variables configuration
- Use only TailwindCSS colors or shadcn theme system

---

## 🏗️ Architecture Patterns

Dự án sử dụng **Hybrid Architecture** kết hợp 4 patterns chính để đảm bảo code quality và scalability:

### 1. 🔬 **Atomic Design Pattern**

Tổ chức components theo cấp bậc hierarchy từ nhỏ đến lớn, giúp code dễ maintain và reuse.

#### **Structure Hierarchy:**

```
Components/
├── Atoms/           # Thành phần cơ bản nhất (Button, Input, Label)
├── Molecules/       # Kết hợp atoms (EmailField, SearchBox)
├── Organisms/       # Khối chức năng lớn (AuthDialog, Navbar)
├── Templates/       # Layout tổng thể (PageLayout, AuthLayout)
└── Pages/           # Triển khai cụ thể với data (HomePage, LoginPage)
```

#### **Composition Example:**

```
AuthDialog (Organism)
└── LoginForm (Molecule)
    ├── EmailField (Molecule)
    │   ├── Label (Atom)
    │   ├── Input (Atom)
    │   └── Mail Icon (Atom)
    └── PasswordField (Molecule)
        ├── Label (Atom)
        ├── Input (Atom)
        ├── Lock Icon (Atom)
        └── Show/Hide Button (Atom)
```

#### **Implementation Rules:**

- **Atoms**: Không thể chia nhỏ hơn, không có business logic
- **Molecules**: Kết hợp atoms, có thể có logic đơn giản
- **Organisms**: Chứa business logic, tương tác với state/API
- **Templates**: Chỉ layout, không có data cụ thể
- **Pages**: Kết nối data và templates

### 2. 🎯 **Feature-Based Architecture**

Tổ chức code theo chức năng business, mỗi feature độc lập và dễ maintain.

#### **Feature Organization:**

```
src/
├── api/             # API services & endpoints
│   ├── paths.ts     # API URL definitions
│   └── types/       # API response types
│
├── hooks/           # Custom React hooks
│   ├── useAuth/     # Authentication logic
│   ├── useApi/      # API calling hook
│   └── useDialog/   # Modal state management
│
├── contexts/        # React contexts for global state
│   ├── useTheme/    # Dark/Light theme
│   └── useSwitchLanguage/  # Language switching
│
└── configs/         # App configurations
    └── axios/       # HTTP client setup
```

#### **Benefits:**

- **Scalability**: Dễ thêm features mới
- **Maintainability**: Mỗi feature tự quản lý
- **Team Collaboration**: Dev có thể work parallel trên các features khác nhau
- **Code Splitting**: Lazy load theo feature

### 3. 🔍 **Separation of Concerns**

Tách biệt trách nhiệm rõ ràng giữa các layers, mỗi layer chỉ làm 1 việc.

#### **Layer Structure:**

```
src/
├── constants/       # App constants & configuration
│   ├── index.ts     # General constants
│   ├── regex/       # Validation patterns
│   └── common/      # Shared constants
│
├── utils/           # Pure utility functions
│   ├── i18n.ts      # Internationalization helpers
│   ├── localStorage/  # Browser storage
│   └── handleDeepLink/  # URL handling
│
├── types/           # TypeScript definitions
│   └── index.ts     # Global type definitions
│
├── lib/             # External library configurations
│   └── utils.ts     # Utility functions for libs
│
└── styles/          # Styling files
    ├── globals.css  # Global styles
    └── reset.scss   # CSS reset
```

#### **Separation Principles:**

- **Business Logic**: Trong hooks và contexts
- **UI Logic**: Trong components
- **Data Fetching**: Trong api layer
- **Styling**: Trong TailwindCSS classes
- **Configuration**: Trong configs folder
- **Types**: Trong types folder

### 4. 📦 **Barrel Exports Pattern**

Sử dụng index.ts files để tạo clean import paths và hide internal structure.

#### **Implementation:**

```typescript
// src/components/atoms/index.ts
export { default as Button } from './button'
export { default as Input } from './input'
export { default as Label } from './label'
export { default as Card } from './card'

// src/components/molecules/index.ts
export { EmailField } from './emailField'
export { PasswordField } from './passwordField'
export { LoginForm } from './loginForm'

// src/hooks/index.ts
export { default as useAuth } from './useAuth'
export { default as useDialog } from './useDialog'
export { default as useApi } from './useApi'
```

#### **Clean Imports:**

```typescript
// ❌ Bad - Deep imports
import Button from '@/components/atoms/button'
import Input from '@/components/atoms/input'
import Label from '@/components/atoms/label'

// ✅ Good - Barrel imports
import { Button, Input, Label } from '@/components/atoms'

// ❌ Bad - Multiple relative imports
import { EmailField } from '../emailField'
import { PasswordField } from '../passwordField'
import { LoginForm } from '../loginForm'

// ✅ Good - Single barrel import
import { EmailField, PasswordField, LoginForm } from '@/components/molecules'
```

#### **Benefits:**

- **Clean Imports**: Fewer import lines
- **Encapsulation**: Hide internal file structure
- **Refactoring**: Easy to move files without breaking imports
- **API Design**: Each folder acts like a mini-package

---

## ⚙️ Getting Started

### Installation

```bash
# Clone repository
git clone <repository-url>
cd smart-rent-fe

# Install dependencies (must use npm)
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

### Environment Setup

- Check Node.js version: `nvm use` (use latest)
- Ensure npm is used (not yarn or pnpm)
- Configure environment variables
- Install recommended VS Code extensions

---

## 📝 Naming Conventions

### Next.js Standards

- **Folder Structure**: camelCase (`userProfile`, `authDialog`)
- **Dynamic Route Params**: snake_case (`[user_id].tsx`, `[property_slug].tsx`)
- **Hooks**: camelCase (`useAuth`, `useDebounce`)
- **Components**: PascalCase (`PostItem`, `UserProfile`)
- **Functions/Methods**: camelCase (`getUserInfo()`, `handleSubmit()`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Interfaces/Types**: PascalCase (`UserData`, `ApiResponse`)
- **Enums**: PascalCase for name, SCREAMING_SNAKE_CASE for members
  ```typescript
  enum UserRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    USER = 'USER',
  }
  ```

### File Naming Patterns

```
📁 Component Structure:
components/atoms/button/
├── index.tsx           # Main component
├── index.styled.ts     # Styled-components (if used)
└── index.scss          # SCSS styles (if used)

📁 Hook Structure:
hooks/useDebounce/
└── index.tsx

📁 Context Structure:
contexts/useAuth/
└── index.tsx
```

---

## 🎨 Component Structure

### Atomic Design Implementation

Components được tổ chức theo [Atomic Design principles](https://viblo.asia/p/tim-hieu-ve-atomic-design-JlkRymxqRZW) trong `/src/components`:

#### **Atoms** (`/src/components/atoms/`)

Thành phần UI cơ bản nhất, download từ shadcn/ui:

```typescript
// Example: Button atom
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ variant, size, children }) => {
  // Pure UI component, no business logic
}
```

**Creation Rules:**

- Tạo folder trước khi code: `atoms/button/index.tsx`
- Styled-components: `atoms/button/index.styled.ts`
- SCSS: `atoms/button/index.scss`

#### **Molecules** (`/src/components/molecules/`)

Kết hợp nhiều atoms thành component phức tạp hơn:

```typescript
// Example: EmailField molecule
const EmailField: React.FC<EmailFieldProps> = (props) => {
  // Combines: Label + Input + Icon + Error message
  // Has simple validation logic
}
```

#### **Organisms** (`/src/components/organisms/`)

Khối chức năng lớn, chứa business logic và tương tác APIs.

---

## 🛠️ Development Guidelines

### Pre-Commit Hooks 🔒

Every commit automatically runs quality checks to maintain code standards:

- ✅ **Type Checking** - Validates TypeScript types (`tsc --noEmit`)
- ✅ **i18n Validation** - Ensures translation files are in sync
- ✅ **Lint & Format** - Auto-fixes and formats staged files

**Quick Commands:**

```bash
npm run pre-commit    # Run all checks manually
npm run typecheck     # Type check only
npm run i18n:check    # Validate translations
npm run format        # Format all files
```

**📚 Documentation:**

- [Pre-Commit Hooks Guide](./docs/PRE_COMMIT_HOOKS.md) - Detailed documentation
- [Quick Reference](./docs/QUICK_REFERENCE.md) - Cheat sheet for developers

**⚡ Performance:** Hooks complete in ~5-10 seconds (optimized for speed)

### Icons & Assets

- **Primary Icons**: [Iconify](https://icon-sets.iconify.design/) và [Lucide React](https://lucide.dev/icons/)
- **Images**: Đặt trong `/public` folder
- **Important**: [Compress images](https://www.iloveimg.com/compress-image) trước khi upload
- **SVG**: Import trực tiếp hoặc đặt trong `/public/svg/`

### Custom Hooks Pattern

Tạo folder trước khi code: `hooks/useDebounce/index.tsx`

```typescript
// Example: useAuth hook
export const useAuth = () => {
  // Authentication logic và state management
  return { user, loading, login, logout }
}
```

### Context Pattern

Tạo folder trước khi code: `contexts/useAuth/index.tsx`

```typescript
// Example: AuthContext for state management
export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)
```

### API Structure

```
src/api/
├── paths.ts         # Define API URLs
└── types/           # API response types
    └── auth.type.ts # Format: 'api_name'.type.ts
```

---

## 🔄 Version Control

### Branch Naming Convention

Follow standardized branch naming for better project management:

- **Feature Branches**: `feature/JIRA-123_implement-property-search`
- **Bug Fixes**: `bugfix/JIRA-456_fix-payment-validation`
- **Hotfixes**: `hotfix/JIRA-789_critical-security-patch`
- **Release Branches**: `release/v1.2.0`

### Commit Message Standards

Use descriptive commit messages linked to task tracking:

```
JIRA-123: Add property search functionality
JIRA-456: Fix email validation in login form
JIRA-789: Update user authentication flow
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/JIRA-123_implement-search

# Make commits with proper messages
git commit -m "JIRA-123: Add search component structure"
git commit -m "JIRA-123: Implement search API integration"

# Push and create PR
git push origin feature/JIRA-123_implement-search
```

---

## 📁 Complete Project Structure

```
smart-rent-fe/
├── public/                    # Static assets
│   ├── images/               # Compressed images
│   └── svg/                  # SVG icons
│
├── src/
│   ├── components/           # UI Components (Atomic Design)
│   │   ├── atoms/           # Basic components (shadcn/ui)
│   │   │   ├── button/index.tsx
│   │   │   ├── input/index.tsx
│   │   │   └── label/index.tsx
│   │   ├── molecules/       # Combined components
│   │   │   ├── emailField/index.tsx
│   │   │   ├── passwordField/index.tsx
│   │   │   └── loginForm/index.tsx
│   │   ├── organisms/       # Complex UI blocks
│   │   │   └── authDialog/index.tsx
│   │   └── templates/       # Page layouts
│   │
│   ├── pages/               # Next.js pages
│   │   ├── _app.tsx        # App wrapper
│   │   ├── _document.tsx   # HTML document
│   │   └── index.tsx       # Home page
│   │
│   ├── api/                # API layer
│   │   ├── paths.ts        # API endpoints
│   │   └── types/          # API response types
│   │       └── auth.type.ts
│   │
│   ├── configs/            # App configurations
│   │   └── axios/          # HTTP client setup
│   │
│   ├── constants/          # App constants
│   │   ├── index.ts        # General constants
│   │   ├── regex/          # Validation patterns
│   │   └── common/         # Shared constants
│   │
│   ├── contexts/           # React contexts
│   │   ├── useTheme/index.tsx
│   │   └── useSwitchLanguage/index.tsx
│   │
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth/index.tsx
│   │   ├── useApi/index.tsx
│   │   └── useDialog/index.tsx
│   │
│   ├── lib/                # External library setup
│   │   └── utils.ts        # Utility functions
│   │
│   ├── messages/           # i18n translations
│   │   ├── en.json         # English
│   │   └── vi.json         # Vietnamese
│   │
│   ├── state/              # Global state management
│   ├── styles/             # CSS files
│   │   ├── globals.css     # Global styles
│   │   └── reset.scss      # CSS reset
│   │
│   ├── theme/              # Theme configurations
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # Global types
│   │
│   └── utils/              # Helper functions
│       ├── i18n.ts         # Internationalization
│       ├── localStorage/   # Browser storage
│       └── handleDeepLink/ # URL handling
│
├── package.json            # Dependencies & scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # TailwindCSS config
├── tsconfig.json         # TypeScript config
└── eslint.config.mjs     # ESLint configuration
```

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run build:check     # Build without linting
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type check
npm run i18n:check      # Validate translations
npm run format          # Format all files
npm run format:check    # Check formatting
npm run pre-commit      # Run all pre-commit checks

# Git workflow
git checkout -b feature/JIRA-123_new-feature
git add .
git commit -m "JIRA-123: Implement new feature"  # Pre-commit hooks run automatically
git push origin feature/JIRA-123_new-feature
```

---

**🎯 This documentation provides comprehensive guidelines for developing with our hybrid architecture. The combination of Atomic Design, Feature-Based organization, Separation of Concerns, and Barrel Exports ensures scalable, maintainable, and developer-friendly code structure.**
