# Common Components

This directory contains reusable components that can be used across the application.

## DistressButton

The `DistressButton` component provides an emergency feature to notify selected contacts when a user is in distress.

### Features

- When pressed, checks if a connected partner is set
- If a partner is connected: triggers an alert to notify the partner
- If no partner is connected: shows a modal with local support resources
- Customizable appearance through props

### Usage

```jsx
import DistressButton from '../common/DistressButton';

// Basic usage
<DistressButton />

// With custom styling
<DistressButton 
  variant="error" 
  size="sm" 
  className="my-custom-class" 
/>

// Full width button
<DistressButton fullWidth={true} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'error'` | Button variant (`'primary'`, `'secondary'`, `'accent'`, `'outline'`, `'text'`, `'error'`) |
| `size` | string | `'md'` | Button size (`'sm'`, `'md'`, `'lg'`) |
| `className` | string | `''` | Additional CSS classes |
| `fullWidth` | boolean | `false` | Whether the button should take full width |

### Support Resources

The component displays the following support resources when no partner is connected:

1. National Suicide Prevention Lifeline
2. Crisis Text Line
3. SAMHSA National Helpline
4. Postpartum Support International

### Implementation Details

- Uses Redux to check if a partner is connected
- Makes API call to `/partners/distress` endpoint when a partner is connected
- Shows toast notifications for success/error states
- Displays a modal with support resources when no partner is connected
