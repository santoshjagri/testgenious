
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { idCardFormSchema, type IDCardFormValues, type IDCardTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, School, User, Calendar, PenSquare, Palette, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';

interface IDCardFormProps {
  onSubmit: (values: IDCardFormValues) => Promise<void>;
  isLoading: boolean;
  template: IDCardTemplate;
}

export function IDCardForm({ onSubmit, isLoading, template }: IDCardFormProps) {
  const form = useForm<IDCardFormValues>({
    resolver: zodResolver(idCardFormSchema),
    defaultValues: {
      template: template,
      institutionName: 'Genesis International School',
      institutionAddress: 'Knowledge is Power',
      fullName: 'Alex Doe',
      idNumber: `GEN-${Math.floor(1000 + Math.random() * 9000)}`,
      rollNo: `${Math.floor(10 + Math.random() * 40)}`,
      classOrCourse: 'Grade 10, Section A',
      dateOfBirth: '2008-05-12',
      issueDate: format(new Date(), "yyyy-MM-dd"),
      expiryDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
      contactNumber: '+1-202-555-0186',
      holderAddress: '123 Future Lane, Innovation City',
      authorityName: 'Dr. Evelyn Reed, Principal',
      headerColor: '#0c4a6e',
      backgroundColor: '#f1f5f9',
      fontColor: '#0f172a',
      photoQuality: 0.7,
    },
  });

  React.useEffect(() => {
    form.setValue('template', template);
  }, [template, form]);

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
  
  const colorInput = (name: keyof IDCardFormValues, label: string) => (
     <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex h-10 items-center gap-2 rounded-md border border-input px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
             <Input
              type="text"
              {...field}
              placeholder="#RRGGBB"
              className="flex-1 border-0 p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
             <FormControl>
               <div className="relative h-6 w-6 shrink-0">
                 <Input
                  type="color"
                  value={field.value || '#ffffff'}
                  onChange={field.onChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`Select ${label}`}
                />
                 <div
                  className="h-full w-full rounded-md border"
                  style={{ backgroundColor: field.value || '#ffffff' }}
                  aria-hidden="true"
                />
              </div>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )

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
                {fileInput("logo", "Institution Logo (Optional)", "PNG or JPG. Recommended: square.")}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Card Holder Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="fullName" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Alex Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                {fileInput("photo", "Holder's Photo", "PNG or JPG. A clear headshot is best.")}
                <FormField name="classOrCourse" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Role / Class / Dept.</FormLabel><FormControl><Input placeholder="e.g., Grade 10 / B.Sc. CS" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="dateOfBirth" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="idNumber" control={form.control} render={({ field }) => ( <FormItem><FormLabel>ID Number (Optional)</FormLabel><FormControl><Input placeholder="e.g., 2024-001" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="rollNo" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Roll No. (Optional)</FormLabel><FormControl><Input placeholder="e.g., 25" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="contactNumber" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Guardian's Contact (Optional)</FormLabel><FormControl><Input placeholder="e.g., +1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="holderAddress" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Holder's Full Address</FormLabel><FormControl><Input placeholder="e.g., 123 Future Lane" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
                {fileInput("authoritySignature", "Authority's Signature (Optional)", "PNG with transparent background if possible.")}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Customization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {colorInput("headerColor", "Header / Accent Color")}
              {colorInput("backgroundColor", "Background Color")}
              {colorInput("fontColor", "Font Color")}
              <FormField
                control={form.control}
                name="photoQuality"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-3">
                    <FormLabel className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Photo Compression Quality</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4 pt-2">
                        <Slider
                          min={0.1}
                          max={1}
                          step={0.1}
                          value={[field.value ?? 0.7]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <span className="text-sm font-medium tabular-nums text-muted-foreground">
                          {((field.value ?? 0.7) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Lower quality reduces file size but may look blurry. 70% is a good balance.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
