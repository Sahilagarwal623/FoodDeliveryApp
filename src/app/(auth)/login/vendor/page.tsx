"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignInForm() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = { email: "", password: "" }
    let isValid = true

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setErrorMessage("Incorrect email or password")
        } else {
          setErrorMessage(result.error)
        }
      }

      if (result?.url) {
        router.replace("/vendor/dashboard")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-orange-100">
        <div className="text-center">
          <div className="mb-4">
            <div className="text-6xl mb-2">🍕</div>
            <h1 className="text-3xl font-bold text-orange-600 mb-2">QuickBite</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Sign in to order your favorite meals</p>
        </div>
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`${errors.email ? "border-red-500" : "border-gray-200"} focus:border-orange-400 focus:ring-orange-400`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`${errors.password ? "border-red-500" : "border-gray-200"} focus:border-orange-400 focus:ring-orange-400`}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In & Start Ordering"}
          </Button>
        </form>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            New to QuickBite?{" "}
            <Link href="/sign-up" className="text-orange-600 hover:text-orange-700 font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
