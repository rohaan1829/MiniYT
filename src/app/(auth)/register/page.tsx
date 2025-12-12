'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

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

const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
});

export default function RegisterPage() {
    const login = useStore((state) => state.login);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            username: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('Registering with:', values);
        // Mock successful registration
        login({
            id: '1',
            name: values.username,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.username}`,
        });
        // In a real app we'd redirect here, e.g. using router.push('/')
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <div className="flex flex-col items-center mb-6 space-y-2 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                    VD
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-gray-500">Join the Videxa community</p>
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

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </span>
                                            <Input placeholder="Username" {...field} className="pl-10 h-11 bg-white border-gray-100 rounded-lg" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg mt-4">
                            Register
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
