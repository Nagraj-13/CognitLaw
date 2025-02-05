import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast"; // Import useToast for notifications

export function LoginSignupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize toast

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("userRole", data.data.user.role);
      setIsOpen(false);

      toast({ title: "Login Successful", description: "You have successfully logged in!", variant: "success" });

      navigate(data.data.user.role === "lawyer" ? "/dashboard" : "/chat");
    } catch (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("userRole", data.data.user.role);
      setIsOpen(false);

      toast({ title: "Signup Successful", description: "Your account has been created!", variant: "success" });

      navigate(data.data.user.role === "lawyer" ? "/dashboard" : "/chat");
    } catch (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Get Started</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to CognitLaw</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" type="email" placeholder="john@example.com" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input name="password" type="password" required onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input name="name" placeholder="John Doe" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input name="email" type="email" placeholder="john@example.com" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input name="password" type="password" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a:</Label>
                <select name="role" className="w-full p-2 border rounded" onChange={handleChange}>
                  <option value="user">Client</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
