
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { idCardFormSchema, type IDCardFormValues } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, School, User, Image as ImageIcon, Calendar, Fingerprint, PenSquare, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface IDCardFormProps {
  onSubmit: (values: IDCardFormValues) => Promise<void>;
  isLoading: boolean;
  level: 'School' | 'College' | 'University';
}

export function IDCardForm({ onSubmit, isLoading, level }: IDCardFormProps) {
  const form = useForm<IDCardFormValues>({
    resolver: zodResolver(idCardFormSchema),
    defaultValues: {
      level: level,
      institutionName: '',
      institutionAddress: '',
      fullName: '',
      idNumber: '',
      classOrCourse: '',
      dateOfBirth: '',
      issueDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
      bloodGroup: '',
      contactNumber: '',
      holderAddress: '',
      authorityName: '',
    },
  });

  React.useEffect(() => {
    form.setValue('level', level);
  }, [level, form]);

  const classOrCourseLabel = {
    School: "Class & Section",
    College: "Course / Program",
    University: "Department / Major"
  };

  const fileInput = (name: keyof IDCardFormValues, label: string, description: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ...rest } }) => ( 
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/png, image/jpeg"
              onChange={(e) => onChange(e.target.files?.[0])}
              {...rest}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><School className="h-5 w-5" />Institution Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="institutionName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Institution Name</FormLabel><FormControl><Input placeholder="e.g., Genesis International" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="institutionAddress" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Address / Motto</FormLabel><FormControl><Input placeholder="e.g., Knowledge is Power" {...field} /></FormControl><FormMessage /></FormItem> )} />
                {fileInput("logo", "Institution Logo", "PNG or JPG file. Recommended: square aspect ratio.")}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Card Holder Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="fullName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Alex Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                {fileInput("photo", "Holder's Photo", "PNG or JPG file. A clear, passport-style headshot is best.")}
                <FormField name="idNumber" control={form.control} render={({ field }) => ( <FormItem><FormLabel>ID Number</FormLabel><FormControl><Input placeholder="e.g., 2024-001" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="classOrCourse" control={form.control} render={({ field }) => ( <FormItem><FormLabel>{classOrCourseLabel[level]}</FormLabel><FormControl><Input placeholder={level === 'School' ? 'e.g., Grade 10, Section A' : 'e.g., B.Sc. Computer Science'} {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="dateOfBirth" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="bloodGroup" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Blood Group (Optional)</FormLabel><FormControl><Input placeholder="e.g., O+" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField name="contactNumber" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Guardian's Contact (Optional)</FormLabel><FormControl><Input placeholder="e.g., +1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="holderAddress" control={form.control} render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Holder's Full Address</FormLabel><FormControl><Input placeholder="e.g., 123 Future Lane, Innovation City" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Validity & Authorization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField name="issueDate" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField name="expiryDate" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField name="authorityName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Authorizing Person's Name</FormLabel><FormControl><Input placeholder="e.g., Dr. Evelyn Reed, Principal" {...field} /></FormControl><FormMessage /></FormItem> )} />
                {fileInput("authoritySignature", "Authority's Signature", "PNG or JPG file with a transparent background if possible.")}
            </CardContent>
        </Card>

        <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating ID Card...</>
          ) : 'Generate ID Card'}
        </Button>
      </form>
    </Form>
  );
}

    