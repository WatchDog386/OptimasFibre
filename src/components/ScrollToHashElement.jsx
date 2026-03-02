import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHashElement = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 20;

    const scrollToElement = () => {
      const element = document.querySelector(hash);
      if (element) {
        const yOffset = -80; // adjust for fixed header height if needed
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(scrollToElement, 100); // retry in 100ms
      }
    };

    scrollToElement();
  }, [hash]);

  return null;
};

export default ScrollToHashElement;
