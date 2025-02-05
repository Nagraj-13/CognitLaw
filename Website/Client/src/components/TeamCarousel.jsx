"use client"

import { useState } from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const teamMembers = [
  {
    name: "Jane Doe",
    role: "CEO & Co-founder",
    image: "/placeholder.svg",
    bio: "Jane has over 15 years of experience in legal tech and AI.",
  },
  {
    name: "John Smith",
    role: "CTO",
    image: "/placeholder.svg",
    bio: "John is an AI expert with a background in computer science and law.",
  },
  {
    name: "Emily Brown",
    role: "Head of Legal Research",
    image: "/placeholder.svg",
    bio: "Emily brings 20 years of legal research experience to the team.",
  },
  {
    name: "Michael Johnson",
    role: "Lead AI Developer",
    image: "/placeholder.svg",
    bio: "Michael specializes in natural language processing and machine learning.",
  },
]

export function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === teamMembers.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? teamMembers.length - 1 : prevIndex - 1))
  }

  return (
    (<div className="relative">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={teamMembers[currentIndex].image || "/placeholder.svg"}
                alt={teamMembers[currentIndex].name}
                width={200}
                height={200}
                className="rounded-full mb-4" />
              <h3 className="text-2xl font-bold">{teamMembers[currentIndex].name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{teamMembers[currentIndex].role}</p>
              <p className="mt-4">{teamMembers[currentIndex].bio}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-4 transform -translate-y-1/2"
        onClick={prevSlide}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-4 transform -translate-y-1/2"
        onClick={nextSlide}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>)
  );
}

