# Thoth UI Component Library

This is the shared UI component library for the Thoth AI Dream Archive project. It contains reusable components that maintain consistent design across all platforms.

## Installation

```bash
npm install @thoth/ui
```

## Core Components

### Atoms
- **Button**: Primary, secondary, text, and icon buttons
- **Input**: Text input with support for icons and error messages
- **Textarea**: Text area with support for labels and error messages

### Molecules
- **Card**: Glassmorphism card component

### Organisms
- **Header**: Navigation header with logo, tabs, and user profile

### Templates
- **PageLayout**: Main page layout with atmosphere effect

## Theme

The component library uses the following design tokens:

- **Colors**:
  - `dreamBg`: #0a0502
  - `dreamAccent`: #ff4e00
  - Various white opacity levels

- **Fonts**:
  - `sans`: Inter
  - `serif`: Cormorant Garamond

- **Border Radius**:
  - sm: 0.5rem
  - md: 1rem
  - lg: 1.5rem
  - xl: 2.5rem

## Usage

```tsx
import { Button, Input, Card, Header, PageLayout } from '@thoth/ui';

// Example usage
const App = () => {
  return (
    <PageLayout>
      <Header
        logo={<YourLogo />}
        logoText="Thoth"
        logoSubtext="AI Dream Archive"
        tabs={[
          { id: 'record', label: 'Capture', icon: <MicIcon /> },
          { id: 'history', label: 'Archive', icon: <HistoryIcon /> },
          { id: 'global', label: 'Collective', icon: <GlobeIcon /> },
          { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
        ]}
        activeTab="record"
        onTabChange={(tabId) => console.log(tabId)}
        user={{ name: 'John Doe', photoURL: 'https://example.com/avatar.jpg' }}
      />
      
      <Card>
        <h1 className="text-2xl font-serif italic text-white mb-4">Dream Capture</h1>
        <Input
          label="Dream Title"
          placeholder="Enter a title for your dream"
        />
        <Button
          variant="primary"
          size="lg"
          onClick={() => console.log('Submit')}
        >
          Save Dream
        </Button>
      </Card>
    </PageLayout>
  );
};
```

## Development

### Start Storybook

```bash
npm run dev
```

### Build the library

```bash
npm run build
```

### Run tests

```bash
npm run test
```

### Lint the code

```bash
npm run lint
```

## Design Philosophy

The Thoth UI library follows these principles:

1. **Consistency**: Maintain a unified design language across all platforms
2. **Accessibility**: Ensure all components are accessible to users with disabilities
3. **Performance**: Optimize components for fast rendering and minimal bundle size
4. **Flexibility**: Provide props to customize components for different use cases
5. **Glassmorphism**: Use semi-transparent, blurred backgrounds for a modern, dreamlike aesthetic

## Browser Support

- Chrome
- Firefox
- Safari
- Edge

## License

MIT
