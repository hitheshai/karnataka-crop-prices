import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 p-0 shadow-xl bg-primary hover:bg-primary/90"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-8 h-8" />
    </Button>
  );
};

export default ScrollToTop;
