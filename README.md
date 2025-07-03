# Firebase Studio

This is a NextJS starter in Firebase Studio. It has been customized into **EduGenius AI**.

To get started, take a look at src/app/page.tsx.

## Running the App

### Development

To run the app in development mode:

```bash
npm run dev
```

This will typically start the Next.js development server on port 9002.

For Genkit flow development (if you modify flows in `src/ai/flows`):
```bash
npm run genkit:dev
# or for auto-reloading on changes
npm run genkit:watch
```

### Building for Production

To create a production build:

```bash
npm run build
```

### Starting the Production Server

After building, you can start the production server:

```bash
npm run start
```

## Deployment

This Next.js application is ready for deployment to platforms that support Node.js and Next.js.

### Firebase App Hosting
This project includes an `apphosting.yaml` file, configured for Firebase App Hosting. You can typically deploy using the Firebase CLI. Refer to the [Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting) for the latest instructions.

### Other Platforms (e.g., Vercel, Netlify)
You can deploy this application to other platforms like Vercel (from the creators of Next.js) or Netlify. These platforms often offer seamless integration with Next.js projects. Consult their respective documentation for deployment guides.

### General Considerations Before Deployment
1.  **Environment Variables**: If your application uses API keys or other sensitive information, ensure they are configured correctly as environment variables in your deployment environment. Do not commit sensitive keys directly into your repository. (Currently, the `.env` file is set up but empty).
2.  **Test Thoroughly**: Ensure all features, like question generation and history management, work as expected in a production-like environment.
3.  **Placeholder Content**: Remember to replace any placeholder images (e.g., `https://placehold.co/...`) with actual images suitable for your application. The current logo placeholder is `https://placehold.co/80x80.png`.
4.  **Dependencies**: Ensure all dependencies in `package.json` are appropriate for production. The `build` script should handle this, but it's good to be aware.
5.  **Genkit Flows**: The Genkit flows in `src/ai/flows` are designed to be server-side and will be bundled with your Next.js application during the build process.
