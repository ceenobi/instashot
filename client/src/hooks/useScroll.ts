import { useRef, useState } from "react";

export default function useScroll() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const storiesContainerRef = useRef<HTMLDivElement | null>(null);
  
    const handleScroll = (direction: "left" | "right") => {
      const container = storiesContainerRef.current;
      if (!container) return;
  
      const scrollAmount = 200;
      const newPosition =
        direction === "right"
          ? scrollPosition + scrollAmount
          : scrollPosition - scrollAmount;
  
      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
      setScrollPosition(newPosition);
    };
  
    return {
      storiesContainerRef,
      scrollPosition,
      handleScroll,
    };
  }
