
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, UserSquare2, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
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
  ];

  return (
    <>
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="text-center py-12 md:py-20 lg:py-24 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-primary via-blue-500 to-indigo-600 text-transparent bg-clip-text">
              Revolutionize Your School's Workflow
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              EduGenius AI is the ultimate toolkit for educators. Save time and reduce administrative burden with our powerful, AI-driven solutions for creating papers, ID cards, and gradesheets.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/30 transition-shadow">
                 <Link href={user ? "/dashboard" : "/signup"}>
                  {user ? "Go to Dashboard" : "Get Started for Free"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
               {!user && (
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Link href="/login">Log In</Link>
                </Button>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 md:py-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">An All-in-One Solution</h2>
                <p className="text-muted-foreground mt-2">Everything you need, in one powerful platform.</p>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="flex flex-col text-center items-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp bg-card/80 backdrop-blur-sm border-border/20" 
                  style={{ animationDelay: `${200 + index * 150}ms`, opacity: 0 }}
                >
                  <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 ring-8 ring-primary/5">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="w-full">
                    <Button asChild variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/10">
                      <Link href={feature.link}>
                        {feature.linkText} <ArrowRight className="ml-2 h-4 w-4" />
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
