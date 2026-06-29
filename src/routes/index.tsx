import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Services from "@/components/site/Services";
import Work from "@/components/site/Work";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import ChatBot from "@/components/site/ChatBot";
import Preloader from "@/components/site/Preloader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daniel Korsa — Graphics & Brand Designer | Danny Graphics" },
      {
        name: "description",
        content:
          "Premium graphics design portfolio of Daniel Korsa (Danny Graphics) in Bale Robe, Ethiopia. Branding, logos, posters, event design, social media graphics and printing.",
      },
      { property: "og:title", content: "Daniel Korsa — Graphics & Brand Designer" },
      {
        property: "og:description",
        content:
          "Branding, logos, posters and social media design by Daniel Korsa, Bale Robe, Ethiopia. Book a design project today.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Daniel Korsa",
          jobTitle: "Graphics & Brand Designer",
          worksFor: { "@type": "Organization", name: "Danny Graphics" },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bale Robe",
            addressCountry: "Ethiopia",
          },
          email: "danikorsa47@gmail.com",
          telephone: "+251910287951",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen bg-background">
      {mounted && <Preloader />}

      {/* scroll progress bar */}
      <motion.div
        style={{ scaleX: progress, background: "var(--gradient-brand)" }}
        className="fixed inset-x-0 top-0 z-[55] h-1 origin-left"
      />

      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Work />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
