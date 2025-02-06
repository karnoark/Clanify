# Mobile App Wireframes and User Flows

## Customer App Flows

### 1. Authentication Flow
```mermaid
graph TD
    A[Launch App] --> B{Has Account?}
    B -->|No| C[Sign Up Screen]
    B -->|Yes| D[Login Screen]
    C --> E[Enter Details]
    E --> F[Verify Email]
    F --> G[Complete Profile]
    G --> H[Dashboard]
    D --> I[Enter Credentials]
    I --> H
```

### 2. Subscription Flow
```mermaid
graph TD
    A[Dashboard] --> B[Browse Plans]
    B --> C[View Plan Details]
    C --> D[Select Plan]
    D --> E[Choose Preferences]
    E --> F[Add Address]
    F --> G[Payment]
    G --> H[Confirmation]
    H --> I[View Active Plan]
```

### 3. Daily Meal Management Flow
```mermaid
graph TD
    A[Dashboard] --> B[Today's Meals]
    B --> C{Action?}
    C -->|View| D[Meal Details]
    C -->|Skip| E[Skip Confirmation]
    C -->|Rate| F[Rating Screen]
    D --> G[Nutritional Info]
    E --> H[Updated Schedule]
    F --> I[Feedback Submitted]
```

## Vendor App Flows

### 1. Menu Management Flow
```mermaid
graph TD
    A[Dashboard] --> B[Menu Section]
    B --> C{Action?}
    C -->|Add| D[New Meal Form]
    C -->|Edit| E[Edit Meal]
    C -->|Delete| F[Confirm Delete]
    D --> G[Preview]
    E --> G
    G --> H[Publish]
```

### 2. Order Management Flow
```mermaid
graph TD
    A[Dashboard] --> B[Orders]
    B --> C[Daily Summary]
    C --> D{Status?}
    D -->|Pending| E[Preparation]
    D -->|Ready| F[Delivery]
    D -->|Delivered| G[Completed]
    E --> H[Update Status]
    F --> H
    H --> I[Notifications]
```

## Screen Layouts

### Customer Screens

#### 1. Dashboard
```
+------------------------+
|     Header/Profile     |
+------------------------+
| Today's Meals         |
| [Meal Cards]          |
+------------------------+
| Active Subscription   |
| [Plan Details]        |
+------------------------+
| Quick Actions         |
| [Skip][Rate][Support] |
+------------------------+
| Bottom Navigation     |
+------------------------+
```

#### 2. Plan Browser
```
+------------------------+
|   Search/Filter Bar    |
+------------------------+
| Featured Plans        |
| [Scrollable Cards]    |
+------------------------+
| All Plans            |
| [List View]          |
+------------------------+
| Bottom Navigation     |
+------------------------+
```

### Vendor Screens

#### 1. Vendor Dashboard
```
+------------------------+
|     Header/Profile     |
+------------------------+
| Today's Summary       |
| [Orders][Revenue]     |
+------------------------+
| Active Subscriptions  |
| [List View]          |
+------------------------+
| Recent Activity      |
| [Activity Feed]      |
+------------------------+
| Bottom Navigation     |
+------------------------+
```

#### 2. Menu Manager
```
+------------------------+
|     Header/Actions     |
+------------------------+
| Calendar View         |
| [Week Selector]       |
+------------------------+
| Meal Slots           |
| [Breakfast]          |
| [Lunch]              |
| [Dinner]             |
+------------------------+
| Bottom Navigation     |
+------------------------+
```

## Design Guidelines

### Color Palette
- Primary: #FF5722 (Orange)
- Secondary: #2196F3 (Blue)
- Success: #4CAF50 (Green)
- Warning: #FFC107 (Yellow)
- Error: #F44336 (Red)
- Background: #FFFFFF (White)
- Text: #333333 (Dark Gray)

### Typography
- Headings: SF Pro Display
- Body: SF Pro Text
- Sizes:
  - H1: 24px
  - H2: 20px
  - H3: 18px
  - Body: 16px
  - Caption: 14px

### Component Styling
- Border Radius: 8px
- Shadow:
  - Elevation 1: 0 2px 4px rgba(0,0,0,0.1)
  - Elevation 2: 0 4px 8px rgba(0,0,0,0.1)
  - Elevation 3: 0 8px 16px rgba(0,0,0,0.1)
