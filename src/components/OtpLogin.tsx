'use client'; // This is a client component because it uses React

import React, { useReducer } from 'react'
import {
    ConfirmationResult,
    signInWithPhoneNumber,
    RecaptchaVerifier,
} from 'firebase/auth';

import {useRouter} from 'next/navigation'

import { signIn } from 'next-auth/react';

import { auth } from '@/lib/firebase';

type OtpLoginProps = {
    email: String,
    password: String,
}

import { useState, useEffect, useTransition, FormEvent } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpLogin({ email, password }: OtpLoginProps) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(
        null
    );

    const router = useRouter();
    const [success, setSuccess] = useState('');
    const [isPending, startTransition] = useTransition();
    const [resendCountdown, setResendCountdown] = useState(0);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown])


    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
                size: 'invisible',
            }
        );
        setRecaptchaVerifier(recaptchaVerifier);
        return () => {
            recaptchaVerifier.clear();
        };
    }, [auth]);

    useEffect(() => {
        const hasEnded = (otp.length === 6) && confirmationResult;
        if (hasEnded) {
            verifyOtp();
        }
    }, [otp]);

    const verifyOtp = async () => {
        startTransition(async () => {
            setError('');
            if (!confirmationResult) {
                setError('Pls Request OTP first');
                return;
            }

            try {
                await confirmationResult?.confirm(otp);


                await signIn("credentials", {
                    redirect: false,
                    email: email,
                    password: password,
                })
                const response = await fetch('/api/update-phone', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: `+91${phone}`,
                    }),
                    credentials: 'include'
                });

                router.replace('/restaurants');
                if (!response.ok) {
                    setError("Unable to SignIn, Pls try again later")
                }
            } catch (error: any) {
                console.error('Error verifying OTP:', error);
                setError('Failed to verify OTP, please try again');
                return;
            }
        });
    }

    const requestOtp = async (e?: FormEvent) => {
        e?.preventDefault();

        setResendCountdown(60);

        startTransition(async () => {

            setError('');

            if (!recaptchaVerifier) {
                setError('Recaptcha not initialized');
                return;
            }

            try {

                const formattedPhone = `+91${phone}`
                const confirmationResult = await signInWithPhoneNumber(
                    auth,
                    formattedPhone,
                    recaptchaVerifier
                );

                setConfirmationResult(confirmationResult);
                setSuccess('OTP sent successfully!');
            } catch (error: any) {
                console.error('Error requesting OTP:', error);
                setResendCountdown(0);

                if (error.code === 'auth/invalid-phone-number') {
                    setError('Invalid phone number format');
                } else if (error.code === 'auth/too-many-requests') {
                    setError('Too many requests, please try again later');
                } else {
                    setError('Failed to send OTP, please try again');
                }
                return;
            }

        });

    }

    return (
        <div className='flex flex-col items-center justify-center'>
            {!confirmationResult && (
                <form onSubmit={requestOtp}>

                    <Input
                        className='text-black'
                        type='tel'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className='text-gray-500 text-sm mt-2'>
                        Enter your phone number with country code
                    </p>

                </form>
            )}
            {confirmationResult && (
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} className='text-black'>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            )}
            <Button
                disabled={!phone || isPending || resendCountdown > 0}
                onClick={() => { requestOtp() }}
                className='mt-5'
            >
                {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : isPending ? 'Sending OTP' : 'Send OTP'}
            </Button>
            <div className='p-10 text-center'>
                {error && (
                    <p className='text-red-500 text-sm mt-2'>{error}</p>
                )}
                {success && (
                    <p className='text-green-500 text-sm mt-2'>OTP sent successfully!</p>
                )}
            </div>
            <div id='recaptcha-container' />

            {isPending && (
                <div className='flex flex-col justify-center items-center mt-5'>
                    <svg
                        className="w-6 h-6 text-gray-500 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                    <p className='text-gray-500 mt-2'>Sending OTP...</p>
                </div>
            )}
        </div>
    )
}
