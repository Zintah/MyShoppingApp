# My Shopping App

A Next.js application for tracking and creating weekly shopping lists with SQLite database storage.

## Features

- **📝 Shopping Lists**: Create and manage multiple weekly shopping lists
- **✅ Item Management**: Add, edit, delete, and mark items as completed
- **🏪 Item Catalog**: Save frequently purchased items for quick re-use
- **📊 Progress Tracking**: Visual progress bars showing completion status
- **🏷️ Categories & Organization**: Organize items by category with various units
- **🔍 Search & Filter**: Find items quickly in your catalog
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **💾 Persistent Storage**: SQLite database for reliable data storage
- **⚡ Quick Shopping**: One-click adding from your personal catalog

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with sqlite3 driver
- **API**: Next.js API Routes

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── lists/         # Shopping list API endpoints
│   │   └── items/         # Shopping item API endpoints
│   │   
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── AddItemForm.tsx    # Form to add new items
│   ├── NewListForm.tsx    # Form to create new lists
│   ├── ShoppingItem.tsx   # Individual item component
│   └── ShoppingList.tsx   # Main list component
├── lib/
│   └── database.ts        # SQLite database configuration
└── types/
    └── index.ts           # TypeScript type definitions
```

## Usage

### Shopping Lists
1. **Create a Shopping List**: Use the "Create New List" form to add a new weekly shopping list
2. **Add Items**: Click "Add Item" to add items with quantity, unit, and category
3. **Quick Add from Catalog**: Click "From Catalog" to quickly add your frequently used items
4. **Manage Items**: Check off completed items, edit details, or delete items
5. **Track Progress**: View completion progress with the progress bar
6. **Multiple Lists**: Switch between different weekly lists using the sidebar
7. **Delete Lists**: Use the trash icon to delete completed lists

### Item Catalog
1. **Access Catalog**: Click the "Item Catalog" tab to manage your frequently used items
2. **Add to Catalog**: Manually add items or they're automatically added when creating list items
3. **Search & Filter**: Use the search bar and category filter to find items quickly
4. **Usage Tracking**: Items are sorted by how frequently you use them
5. **Edit Items**: Click the edit icon to modify default quantities, units, or categories
6. **Quick Selection**: When adding items to lists, browse your catalog for instant adding

### Tips for Best Experience
- **Build Your Catalog First**: Add your commonly purchased items to make future shopping faster
- **Use Categories**: Organize items by store sections (Dairy, Produce, etc.) for efficient shopping
- **Set Realistic Defaults**: Configure typical quantities and units for each catalog item
- **Regular Maintenance**: Remove items you no longer buy and update quantities as needed

## Database

The application uses SQLite for data storage. The database file (`shopping.db`) will be created automatically in the project root when you first run the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is open source and available under the MIT License. 