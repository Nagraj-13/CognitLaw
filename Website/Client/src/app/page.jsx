import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, MessageSquare, Upload, Headphones, CheckCircle } from "lucide-react";
import { LoginSignupModal } from "@/components/LoginSignupModal";
import { TeamCarousel } from "@/components/TeamCarousel";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center bg-white shadow-md">
        <Link className="flex items-center" to="/">
          <Book className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-blue-600">CognitLaw</span>
        </Link>
        <nav className="ml-auto flex gap-6 text-gray-700">
          {['Features', 'How It Works', 'About', 'Team', 'Contact'].map((item) => (
            <Link
              key={item}
              className="text-md font-medium hover:text-blue-600 transition duration-200"
              to={`#${item.toLowerCase().replace(/ /g, '-')}`}
            >
              {item}
            </Link>
          ))}
        </nav>
      </header>
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full p-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Revolutionize Your Legal Practice with AI
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-gray-200">
            CognitLaw combines AI technology with legal expertise to streamline research, enhance case management, and provide instant legal insights.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <LoginSignupModal />
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-100 transition">
              <Link to="#learn-more">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-gray-100">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-800">Key Features</h2>
            <div className="grid gap-8 mt-12 md:grid-cols-3">
              {[{ icon: MessageSquare, title: "LawBot", description: "Instant AI-powered legal responses." },
                { icon: Upload, title: "Conversation Upload", description: "Upload client conversations for AI-assisted legal research." },
                { icon: Headphones, title: "Audio Processing", description: "Upload audio files for transcription & analysis." }
              ].map((feature, index) => (
                <Card key={index} className="p-6 shadow-lg rounded-lg">
                  <CardHeader className="flex justify-center items-center">
                    <feature.icon className="w-10 h-10 text-blue-600" />
                  </CardHeader>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  <CardContent className="mt-2 text-gray-600">{feature.description}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-blue-600 text-white text-center">
          <h2 className="text-4xl font-bold">Ready to Transform Your Legal Practice?</h2>
          <p className="mt-4 text-lg max-w-xl mx-auto">
            Join CognitLaw today and experience the future of AI-powered legal assistance.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <LoginSignupModal />
            <Button variant="outline" className="border-white text-white hover:bg-blue-700 transition">
              <Link to="#contact">Contact Sales</Link>
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 border-t bg-white">
        <p>© 2024 CognitLaw. All rights reserved.</p>
        <nav className="flex justify-center gap-6 mt-2">
          <Link className="hover:underline" to="#terms">Terms of Service</Link>
          <Link className="hover:underline" to="#privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
