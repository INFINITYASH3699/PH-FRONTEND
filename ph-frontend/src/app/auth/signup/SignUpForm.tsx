import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthContext";

// Define validation schema with Zod
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username must be at most 30 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username can only contain letters, numbers, underscores, and hyphens",
    }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function SignUpForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      await register({
        fullName: `${values.firstName} ${values.lastName}`,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      toast.success("Account created successfully!");

      // Wait a moment to ensure cookies are set before redirecting
      setTimeout(() => {
        // Go to home page and let middleware handle redirection based on auth state
        window.location.href = "/";
      }, 100);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Username availability check (simulated)
  const checkUsernameAvailability = async (username: string) => {
    // Here you would typically make an API call to check availability
    // For now, we'll simulate a response based on the username length
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(username.length > 3); // Pretend username is available if length > 3
      }, 500);
    });
  };

  return (
    <>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isLoading}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isLoading}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    This will be your portfolio URL: <span className="font-medium">portfolio-hubspot.vercel.app/portfolio/{field.value || "username"}</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </FormControl>
                  <div className="text-xs space-y-1 mt-1">
                    <div className="text-muted-foreground">Password must:</div>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 ml-4 list-disc text-muted-foreground">
                      <li className={field.value.length >= 8 ? "text-green-600" : ""}>
                        Be at least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(field.value) ? "text-green-600" : ""}>
                        Have an uppercase letter
                      </li>
                      <li className={/[a-z]/.test(field.value) ? "text-green-600" : ""}>
                        Have a lowercase letter
                      </li>
                      <li className={/[0-9]/.test(field.value) ? "text-green-600" : ""}>
                        Include a number
                      </li>
                    </ul>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-primary underline hover:text-primary/90"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-primary underline hover:text-primary/90"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
