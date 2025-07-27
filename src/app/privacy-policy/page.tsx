
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {

  return (
    <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardContent className="prose dark:prose-invert max-w-none p-6 sm:p-8">
            <div className="not-prose mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                    Privacy Policy
                </h1>
                <p className="text-muted-foreground">Last Updated: July 29, 2024</p>
            </div>
            
            <p>
              Welcome to EduGenius AI. Your privacy is important to us. This Privacy Policy explains how we handle your information when you use our application.
            </p>
            
            <h2>1. Information We Handle</h2>
            <p>
              EduGenius AI is designed with privacy as a priority. The core functionality operates directly within your web browser.
            </p>
            <ul>
              <li><strong>Local Data Storage:</strong> All the data you create, including question papers, gradesheets, ID cards, and their respective histories, is stored exclusively in your browser's local storage. This data is not transmitted to, or stored on, our servers. It remains on your device.</li>
              <li><strong>AI-Generated Content:</strong> When you use the "AI Generate" feature, the information you provide in the form (such as subject, class level, topics, and instructions) is sent to Google's Generative AI models to generate the content. We do not log or store this information on our servers. The generated content is sent back directly to your browser.</li>
              <li><strong>No Personal Accounts:</strong> We do not require you to create an account. The application does not collect personal information like your name, email address, or other contact details.</li>
            </ul>

            <h2>2. How We Use Information</h2>
            <p>
              The information you provide is used solely for the following purposes:
            </p>
            <ul>
                <li>To generate question papers, gradesheets, and ID cards as requested by you.</li>
                <li>To save your work history in your browser's local storage for your convenience.</li>
            </ul>

            <h2>3. Third-Party Services</h2>
            <p>
              We use Google's Generative AI (Gemini) models to power our question generation feature. Your interaction with this feature is subject to Google's Privacy Policy. We recommend you review their policy to understand how they handle data.
            </p>

            <h2>4. Data Security & Your Control</h2>
             <p>
                Since all your generated data is stored on your own device, you have full control over it.
            </p>
            <ul>
                <li><strong>Security:</strong> The security of your data depends on the security of your own device and browser.</li>
                <li><strong>Data Deletion:</strong> You can clear your "Paper History," "GS History," and "ID History" at any time using the "Clear History" buttons within the application. Furthermore, clearing your browser's cache and site data will permanently remove all stored information.</li>
            </ul>

            <h2>5. Children's Privacy</h2>
            <p>
              Our application does not knowingly collect personal information from children under the age of 13. All data entry is done by the user and stored locally.
            </p>
            
            <h2>6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
