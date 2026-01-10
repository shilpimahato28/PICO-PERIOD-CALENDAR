import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Flower2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Login Schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register Schema - extend shared one with password confirmation if desired, 
// but keeping it simple for now matching the UI
const registerSchema = insertUserSchema.extend({
  // Can add specific validation overrides here
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { data: user } = useUser();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left Side - Visual */}
      <div className="hidden md:flex flex-col items-center justify-center bg-secondary/30 relative overflow-hidden p-12 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-accent/5 z-0" />
        
        {/* Abstract decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mb-8 text-primary animate-pulse">
            <Flower2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
            Welcome to PiCO
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your personal companion for wellness, cycle tracking, and community support.
            Understanding your body has never been this beautiful.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md">
          <div className="text-center md:hidden mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Flower2 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display font-bold">PiCO</h1>
          </div>

          <div className="bg-card border border-border/50 shadow-xl rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex gap-4 mb-8 border-b border-border/50 pb-1">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-3 text-lg font-medium transition-all relative ${isLogin ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign In
                {isLogin && <motion.div layoutId="tab" className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-primary" />}
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-3 text-lg font-medium transition-all relative ${!isLogin ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Register
                {!isLogin && <motion.div layoutId="tab" className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-primary" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => login(data))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Username</label>
        <input
          {...form.register("username")}
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          placeholder="Enter your username"
        />
        {form.formState.errors.username && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
        <input
          type="password"
          {...form.register("password")}
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          placeholder="••••••••"
        />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

function RegisterForm() {
  const { mutate: register, isPending, error } = useRegister();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      cycleLength: 28,
    }
  });

  return (
    <form onSubmit={form.handleSubmit((data) => register(data))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Full Name</label>
        <input
          {...form.register("name")}
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          placeholder="Jane Doe"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Username</label>
          <input
            {...form.register("username")}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            placeholder="janedoe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground/80">Age</label>
          <input
            type="number"
            {...form.register("age", { valueAsNumber: true })}
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            placeholder="25"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
        <input
          type="password"
          {...form.register("password")}
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          placeholder="Create a password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-foreground/80">Typical Cycle Length (Days)</label>
        <input
          type="number"
          {...form.register("cycleLength", { valueAsNumber: true })}
          className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          defaultValue={28}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPending ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
