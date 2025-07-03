
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, UserSquare2, GraduationCap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: 'AI Question Paper Generator',
      description: 'Effortlessly create comprehensive and well-structured question papers. Customize subjects, topics, and question types with our powerful AI.',
      link: '/create-paper',
      linkText: 'Create a Paper',
      image: {
        src: 'https://placehold.co/600x400.png',
        alt: 'AI generating a test paper in a futuristic interface.',
        hint: 'blue AI'
      }
    },
    {
      icon: <UserSquare2 className="h-10 w-10 text-primary" />,
      title: 'ID Card Studio',
      description: 'Design and print professional ID cards for your students and staff. Choose from multiple templates and customize them to fit your institution\'s brand.',
      link: '/id-card',
      linkText: 'Design ID Cards',
      image: {
        src: 'https://placehold.co/600x400.png',
        alt: 'A modern, professional ID card with blue accents in a clear holder, rendered in 3D.',
        hint: 'corporate id'
      }
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      title: 'Advanced Gradesheet Tool',
      description: 'Generate detailed, accurate gradesheets with automatic calculations for percentages, grades, and GPA. Supports both single and bulk student entry.',
      link: '/gradesheet',
      linkText: 'Generate Gradesheets',
      image: {
        src: 'https://placehold.co/600x400.png',
        alt: 'A digital gradesheet with charts and data visualization in blue tones.',
        hint: 'blue data'
      }
    },
  ];

  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl space-y-12 md:space-y-20">
          
          {/* Hero Section */}
          <section className="text-center animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary">
              Welcome to ExamGenius AI
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              The all-in-one solution for educators. Streamline your workflow from question paper creation to final gradesheet generation with our intuitive, AI-powered tools.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="text-lg">
                <Link href="/create-paper">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="flex flex-col shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-fadeInUp" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                   <Image 
                      src={feature.image.src}
                      alt={feature.image.alt}
                      width={600}
                      height={400}
                      className="rounded-md object-cover mb-4 aspect-video"
                      data-ai-hint={feature.image.hint}
                    />
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={feature.link}>
                      {feature.linkText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </section>

        </div>
      </main>
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { 
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
