This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Security and Configuration Setup

### Environment Variables
1. Copy the `.env.example` file to create your `.env`:
```bash
cp .env.example .env
```
2. Update the `.env` file with your actual configuration values
3. Never commit the `.env` file - it's automatically ignored via `.gitignore`

### Security Best Practices
- Never commit sensitive information like API keys, access tokens, or credentials
- All sensitive configuration should be stored in environment variables
- AWS credentials should be managed through AWS CLI or environment variables
- Keep the `.gitignore` file updated to prevent accidentally committing sensitive files
- Regularly rotate access keys and tokens
- Use secure HTTPS endpoints for all API communications

### Configuration Files
The following files contain sensitive information and should not be committed:
- `*.env` files
- `current-config.json`
- `bucket-policy.json`
- `distribution-config.json`
- AWS configuration files

## Getting Started

First, set up your environment:

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables as described above

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
