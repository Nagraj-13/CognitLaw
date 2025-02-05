import {Link} from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, MessageSquare, Upload, Headphones, CheckCircle } from "lucide-react"
import { LoginSignupModal } from "@/components/LoginSignupModal"
import { TeamCarousel } from "@/components/TeamCarousel"

export default function LandingPage() {
  return (
    (<div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <span className="sr-only">CognitLaw</span>
          <Book className="h-6 w-6 text-primary" />
          <span className="ml-2 text-2xl font-bold text-primary">CognitLaw</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-md font-medium hover:underline underline-offset-4"
            href="#features">
            Features
          </Link>
          <Link
            className="text-md font-medium hover:underline underline-offset-4"
            href="#how-it-works">
            How It Works
          </Link>
          <Link
            className="text-md font-medium hover:underline underline-offset-4"
            href="#about">
            About
          </Link>
          <Link
            className="text-md font-medium hover:underline underline-offset-4"
            href="#team">
            Team
          </Link>
          <Link
            className="text-md font-medium hover:underline underline-offset-4"
            href="#contact">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section
          className="w-full  p-10 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="px-4 md:px-6">
            <div
              className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-white">
                <div className="space-y-2">
                  <h1
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Revolutionize Your Legal Practice with AI
                  </h1>
                  <p className="max-w-[600px] text-gray-200 md:text-xl dark:text-gray-400">
                    CognitLaw combines cutting-edge AI technology with legal expertise to streamline research, enhance
                    case management, and provide instant answers to complex legal queries.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <LoginSignupModal />
                  <Button
                    variant="outline"
                    asChild
                    className="bg-white text-blue-600 hover:bg-blue-50">
                    <Link href="#learn-more">Learn More</Link>
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="text-green-500" />
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="text-green-500" />
                    <span>24/7 Assistance</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="text-green-500" />
                    <span>Secure & Confidential</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="../../public/WhatsApp Image 2025-02-02 at 16.55.56_0981492d.jpg"
                  alt="AI Legal Assistant"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2
              className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-6 h-6 mr-2" />
                    LawBot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Ask legal queries and get instant, AI-powered responses from our advanced LawBot.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-6 h-6 mr-2" />
                    Conversation Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Lawyers can upload client conversations for AI-assisted legal research and case studies.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Headphones className="w-6 h-6 mr-2" />
                    Audio Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Upload audio files for transcription and analysis, streamlining your legal workflow.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <h2
              className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="flex justify-evenly">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">For Users</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Sign up for a CognitLaw account</li>
                  <li>Ask legal questions to our AI-powered LawBot</li>
                  <li>Receive instant, accurate responses</li>
                  <li>Connect with registered lawyers if needed</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">For Lawyers</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Register as a lawyer on CognitLaw</li>
                  <li>Upload client conversations or audio files</li>
                  <li>Receive AI-generated legal research and case studies</li>
                  <li>Manage client cases efficiently through our platform</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="px-4 md:px-6">
            <h2
              className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">About CognitLaw</h2>
            <div className="flex justify-evenly items-center text-2xl">
              <div className="space-y-4 w-1/2">
                <p className="text-gray-500 dark:text-gray-400">
                  CognitLaw was founded in 2023 by a team of legal professionals and AI experts with a vision to
                  revolutionize the legal industry. Our mission is to make legal assistance more accessible, efficient,
                  and accurate through the power of artificial intelligence.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  We believe that by combining human expertise with cutting-edge AI technology, we can help lawyers work
                  smarter, not harder. Our platform is designed to streamline legal research, enhance case management,
                  and provide instant answers to complex legal queries.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="../../public/WhatsApp Image 2025-02-02 at 16.56.38_c2dc978e.jpg"
                  alt="CognitLaw Team"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-lg" />
              </div>
            </div>
          </div>
        </section>
        <section
          id="team"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          {/* <div className="container px-4 md:px-6">
            <h2
              className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Our Team</h2>
            <TeamCarousel />
          </div> */}
        </section>
        <section
          id="get-started"
          className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Legal Practice?
                </h2>
                <p className="mx-auto max-w-[700px] text-primary-foreground/90 md:text-xl">
                  Join CognitLaw today and experience the future of AI-powered legal assistance.
                </p>
              </div>
              <div className="space-x-4">
                <LoginSignupModal />
                <Button variant="outline" asChild>
                  <Link
                    href="#contact"
                    className="text-white border-white hover:bg-primary-foreground/10">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer
        className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 CognitLaw. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>)
  );
}

