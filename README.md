# LendLocal - Base MiniApp

A marketplace for individuals to lend and borrow small, everyday items within their local community via a Base MiniApp.

## Features

- **Item Listing**: Users can list items they're willing to lend with details, photos, and fees
- **Local Discovery**: Browse and search for items within your local area
- **Borrowing Requests**: Streamlined process to request and approve item borrowing
- **User Profiles**: View lender profiles with ratings and reviews
- **Mobile-First Design**: Optimized for mobile use within Base App

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base Network integration via MiniKit
- **Styling**: Tailwind CSS with custom design system
- **Components**: OnchainKit for wallet and identity features
- **TypeScript**: Full type safety throughout the application

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.local` and add your OnchainKit API key:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Base App**:
   Navigate to `http://localhost:3000` in your Base App or compatible Farcaster client.

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
├── lib/                   # Utilities, types, and mock data
├── public/               # Static assets
└── README.md
```

## Key Components

- **AppShell**: Main layout wrapper
- **ItemCard**: Display item listings with lender info
- **ItemDetailModal**: Full item details with borrowing interface
- **ListItemForm**: Form for adding new items to lend
- **UserProfile**: Display user information and ratings

## Design System

The app uses a custom design system with:
- **Colors**: Base-themed color palette with semantic tokens
- **Typography**: Consistent text sizing and weights
- **Spacing**: Standardized spacing scale (xs, sm, md, lg, xl)
- **Components**: Reusable UI components with variants

## Mock Data

The app includes comprehensive mock data for development:
- Sample users with Farcaster profiles
- Various item categories (tools, electronics, books, etc.)
- Borrow requests and transactions

## Future Enhancements

- Smart contract integration for secure transactions
- Real-time messaging between users
- Push notifications for requests and updates
- Integration with actual location services
- Payment processing with Base network tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
