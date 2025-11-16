# Blotter Components

## ActionsDropdown Component

An enhanced, accessible dropdown menu for case management actions in the OngoingCases table.

### Features

✅ **Portal Rendering**: Dropdown renders outside the table using React Portal to prevent clipping and scrolling issues

✅ **Auto-Flipping**: Automatically flips direction when near the bottom of the screen to stay visible

✅ **Smooth Animations**: Fade and scale transitions using HeadlessUI's Transition component

✅ **Modern Design**: Rounded corners, subtle shadows, and gradient hover effects

✅ **Icon Support**: Clean layout with Heroicons beside each action text

✅ **Destructive Actions**: No-show actions highlighted in red with warning icons and separated by divider

✅ **Full Accessibility**: 
- Keyboard navigation (Tab, Enter, Escape)
- Focus management and focus trap
- ARIA labels and roles
- Click outside to close
- Screen reader friendly

### Usage

```jsx
import ActionsDropdown from "./components/ActionsDropdown";

<ActionsDropdown
  record={record}
  onViewDetails={handleShowDetails}
  onEditCase={handleEdit}
  onMarkSolved={handleSolved}
  onMarkNoShow={handleMarkNoShow}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `record` | Object | The case record data |
| `onViewDetails` | Function | Handler for viewing case details |
| `onEditCase` | Function | Handler for editing the case |
| `onMarkSolved` | Function | Handler for marking case as solved |
| `onMarkNoShow` | Function | Handler for marking no-shows (receives record and type: 'complainant' or 'respondent') |

### Technical Details

- **Portal Target**: `document.body`
- **Positioning**: Fixed positioning with dynamic calculation
- **Z-Index**: 9999 to ensure visibility above all other elements
- **Dropdown Width**: 14rem (224px)
- **Animation Duration**: 200ms enter, 150ms leave
- **Dependencies**: 
  - `@headlessui/react` (Menu, Transition)
  - `@heroicons/react` (Icons)
  - `react-dom` (createPortal)

### Menu Items

1. **View Details** - Blue theme, eye icon
2. **Edit Case** - Indigo theme, pencil icon
3. **Mark as Solved** - Green theme, check icon
4. **Divider** - Visual separator
5. **Mark Complainant No-Show** - Red theme (destructive), user minus icon
6. **Mark Respondent No-Show** - Red theme (destructive), warning icon

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires support for:
  - CSS Fixed Positioning
  - React Portals
  - ES6+ JavaScript features

