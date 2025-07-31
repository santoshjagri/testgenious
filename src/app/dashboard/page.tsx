
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, UserSquare2, GraduationCap, Settings, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const tools = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'AI Paper Generator',
      description: 'Effortlessly create comprehensive question papers using AI. Papers can also be created manually, making it great for mobile users.',
      link: '/create-paper',
      linkText: 'Create a Paper',
    },
    {
      icon: <UserSquare2 className="h-8 w-8 text-primary" />,
      title: 'ID Card Studio',
      description: 'Design and print professional, customized ID cards for your students and staff in minutes.',
      link: '/id-card',
      linkText: 'Design ID Cards',
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: 'Gradesheet Tool',
      description: 'Generate detailed, accurate gradesheets with automatic calculations for marks, GPA, and percentages.',
      link: '/gradesheet',
      linkText: 'Generate Gradesheets',
    },
    {
      icon: <Settings className="h-8 w-8 text-primary" />,
      title: 'Settings',
      description: 'Manage your application settings and clear locally stored data for all tools.',
      link: '/settings',
      linkText: 'Go to Settings',
    },
  ];

  return (
    <>
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          
          <section className="text-center py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground animate-fadeInUp">
              Our Tools
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground animate-fadeInUp" style={{ animationDelay: '200ms', opacity: 0 }}>
              Select one of the EduGenius AI tools below to get started.
            </p>
          </section>

          <section className="pb-12 md:pb-20">
            <div className="grid md:grid-cols-2 gap-8">
              {tools.map((tool, index) => (
                <Card 
                  key={index} 
                  className="flex flex-col text-center items-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp bg-card/80 backdrop-blur-sm border-border/20"
                  style={{ animationDelay: `${400 + index * 150}ms`, opacity: 0 }}
                >
                  <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 ring-8 ring-primary/5">
                      {tool.icon}
                    </div>
                    <CardTitle className="text-2xl">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-base">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="w-full">
                    <Button asChild variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                      <Link href={tool.link}>
                        {tool.linkText} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </main>
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { 
          animation: fadeInUp 0.7s ease-out forwards;
        }
      `}</style>
    </>
  );
}
