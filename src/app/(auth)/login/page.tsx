'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().default(false).optional(),
});

export default function LoginPage() {
    const login = useStore((state) => state.login);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Mock login - skip validation for now since no backend
        login({
            id: '1',
            name: 'John Doe',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        });
        router.push('/');
    }

    // Direct redirect for demo purposes
    const handleQuickLogin = () => {
        login({
            id: '1',
            name: 'Demo User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
        });
        router.push('/');
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <div className="flex flex-col items-center mb-6 space-y-2 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    VD
                </div>
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-gray-500">Login to continue watching</p>
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
                                            <span className="absolute left-3 top-2.5 text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                            </span>
                                            <Input placeholder="Enter your E-mail" {...field} className="pl-10 h-11 bg-white border-gray-100 rounded-lg" />
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
                                            <span className="absolute left-3 top-2.5 text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            </span>
                                            <Input type="password" placeholder="Enter your Password" {...field} className="pl-10 h-11 bg-white border-gray-100 rounded-lg" />
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

                        <Button type="button" onClick={handleQuickLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg">
                            Log In
                        </Button>
                    </form>
                </Form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-50 px-2 text-gray-500">Or</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full mt-6 h-11 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continue with Google
                    </Button>
                </div>

            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-gray-500">
                    Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Register</Link>
                </p>
            </CardFooter>
        </Card>
    );
}
