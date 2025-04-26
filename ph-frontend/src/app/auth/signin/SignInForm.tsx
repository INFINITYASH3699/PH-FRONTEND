import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { CardContent, CardFooter } from "@/components/ui/card";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/components/providers/AuthContext";

// Define form schema with zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
});

export default function SignInForm() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get redirectTo path from URL if present
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  // Check if we need to clear token (passed by middleware when token is invalid)
  const clearToken = searchParams.get("clearToken");

  // Clear invalid tokens when directed by middleware
  useEffect(() => {
    if (clearToken === "true") {
      console.log("Clearing invalid auth token");
      if (typeof apiClient.logout === "function") {
        apiClient.logout();
      } else if (
        apiClient.auth &&
        typeof apiClient.auth.logout === "function"
      ) {
        apiClient.auth.logout();
      }
      toast.info("Your session has expired. Please sign in again.");
    }
  }, [clearToken]);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Call the login API
      console.log("Attempting to login with:", values.email);

      // Use the AuthContext login function
      await login(values.email, values.password);

      // Re-check authentication state to ensure user is logged in
      await checkAuth();

      toast.success("Logged in successfully");

      // Redirect to the specified path or dashboard
      console.log(`Redirecting to: ${redirectTo}`);

      if (redirectTo && redirectTo.startsWith("/templates/use/")) {
        // For template editor paths, reload the page to ensure fresh template data
        window.location.href = redirectTo;
      } else {
        // For other paths, use the router with replace to avoid back navigation issues
        router.push(redirectTo);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        "Failed to sign in. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login is not available yet`);
  };

  return (
    <>
      <CardContent className="space-y-6 p-6">
        {redirectTo && redirectTo !== "/dashboard" && (
          <div className="text-sm text-muted-foreground mb-4">
            <p>
              Sign in to continue to:{" "}
              <span className="font-medium">{redirectTo}</span>
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      disabled={isLoading}
                      autoComplete="email"
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Remember me for 30 days
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="h-10"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                fill="#4285F4"
              />
              <path
                d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                fill="#34A853"
              />
              <path
                d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                fill="#FBBC04"
              />
              <path
                d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => handleSocialLogin("GitHub")}
            className="h-10"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href={`/auth/signup${redirectTo !== "/dashboard" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-primary font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
