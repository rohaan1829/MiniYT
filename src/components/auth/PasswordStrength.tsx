'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const [strength, setStrength] = useState(0);
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (!password) {
            setStrength(0);
            setLabel('');
            return;
        }

        let score = 0;
        if (password.length > 5) score++;
        if (password.length > 7) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        // Cap at 4
        if (score > 4) score = 4;

        setStrength(score);

        if (score <= 1) setLabel('Weak');
        else if (score === 2) setLabel('Fair');
        else if (score === 3) setLabel('Good');
        else if (score >= 4) setLabel('Strong');
    }, [password]);

    if (!password) return null;

    const getColor = (score: number) => {
        if (score <= 1) return 'bg-red-500';
        if (score === 2) return 'bg-orange-500';
        if (score === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-2 mt-2">
            <div className="flex gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={cn(
                            "h-full rounded-full flex-1 transition-all duration-300",
                            strength >= level ? getColor(strength) : "bg-secondary"
                        )}
                    />
                ))}
            </div>
            <p className={cn("text-xs font-medium text-right",
                strength <= 1 ? "text-red-500" :
                    strength === 2 ? "text-orange-500" :
                        strength === 3 ? "text-yellow-500" :
                            "text-green-500"
            )}>
                {label}
            </p>
        </div>
    );
}
