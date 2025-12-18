'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrength } from '@/components/auth/PasswordStrength';

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
    name: z.string().min(1, 'Name is required').optional(),
});

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register, isLoading, error } = useStore();
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const [success, setSuccess] = useState(false);

    const registered = searchParams.get('registered');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            username: '',
            name: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await register({
                email: values.email,
                username: values.username,
                password: values.password,
                name: values.name,
            });
            toast({
                title: "Registration successful!",
                description: "You have successfully created an account. Please login.",
            });
            router.push('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: message,
            });
        }
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <div className="flex flex-col items-center mb-6 space-y-2 text-center">
                <div className="w-16 h-16 bg-[#0a0a0a] border border-red-500/20 rounded-2xl flex items-center justify-center text-red-600 font-bold text-3xl mb-2 shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                    V
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-muted-foreground">Join the MiniYT community</p>
            </div>

            <CardContent>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                            </span>
                                            <Input
                                                placeholder="Enter your E-mail"
                                                {...field}
                                                className="pl-10 h-11 bg-background border-border rounded-lg"
                                                disabled={isLoading || success}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </span>
                                            <Input
                                                placeholder="Username"
                                                {...field}
                                                className="pl-10 h-11 bg-background border-border rounded-lg"
                                                disabled={isLoading || success}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                            </span>
                                            <Input
                                                placeholder="Full Name (optional)"
                                                {...field}
                                                className="pl-10 h-11 bg-background border-border rounded-lg"
                                                disabled={isLoading || success}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            </span>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your Password"
                                                {...field}
                                                className="pl-10 pr-10 h-11 bg-background border-border rounded-lg"
                                                disabled={isLoading || success}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                                disabled={isLoading || success}
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    <PasswordStrength password={field.value} />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg mt-4"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : success ? (
                                '✓ Account Created'
                            ) : (
                                'Register'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-end">
                <p className="text-sm text-center w-full">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Login There</Link>
                </p>
            </CardFooter>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-[50vh]">Loading...</div>}>
            <RegisterForm />
        </Suspense>
    );
}
