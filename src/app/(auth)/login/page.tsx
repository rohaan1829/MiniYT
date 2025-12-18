'use client';

import { useState, useEffect, Suspense } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().default(false).optional(),
});

function LoginForm() {
    const router = useRouter();
    const { login, isLoading } = useStore();
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');
    const expired = searchParams.get('expired');

    useEffect(() => {
        if (registered) {
            toast({
                title: "Account Created",
                description: "You have successfully registered. Please log in.",
            });
            router.replace('/login');
        }
        if (expired) {
            toast({
                variant: "destructive",
                title: "Session Expired",
                description: "Your session has expired. Please log in again.",
            });
            router.replace('/login');
        }
    }, [registered, expired, toast, router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await login(values.email, values.password);
            toast({
                title: "Welcome back!",
                description: "You have successfully logged in.",
            });
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Invalid credentials. Please try again.';
            toast({
                variant: "destructive",
                title: "Login Failed",
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
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Login to continue watching</p>
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
                                                disabled={isLoading}
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
                                                disabled={isLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8-11-8-11-8-11-8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between">
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <label
                                                htmlFor="rememberMe"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Remember Me
                                            </label>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Log In'
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full mt-6 h-11 rounded-lg border-border bg-background hover:bg-secondary"
                        disabled={isLoading}
                    >
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continue with Google
                    </Button>
                </div>

            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Register</Link>
                </p>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-[50vh]">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
