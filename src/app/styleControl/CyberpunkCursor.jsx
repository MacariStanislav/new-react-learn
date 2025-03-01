import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import "../../css/Cursor.css"; // Подключаем стили

const CyberpunkCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const cursor = document.querySelector("#cursor");

    gsap.set(cursor, { opacity: 0 });

    const handleMouseMove = (e) => {
      if (!isVisible) {
        setIsVisible(true);
        gsap.to(cursor, { opacity: 1, duration: 0.2 });
      }

      gsap.to(cursor, {
        duration: 0.1,
        x: e.clientX - 15,
        y: e.clientY - 15,
        ease: "power1.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { opacity: 0, duration: 0.2 });
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      if (isVisible) {
        gsap.to(cursor, { opacity: 1, duration: 0.2 });
      }
    };

    const handleHover = () => {
      setIsHovering(true);
    };

    const handleHoverOut = () => {
      setIsHovering(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    document.querySelectorAll("button, a, input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", handleHover);
      el.addEventListener("mouseleave", handleHoverOut);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  return (
    <div className="cursor">
      <div id="cursor" className={isHovering ? "hover" : ""}>
      <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
  <rect width="30" height="30" fill="#000" />  
  <g>
    <rect stroke="#000" id="svg_1" height="30" width="30" y="0" x="0" stroke-width="0" fill="#00AFFF"/> 
    <rect stroke="#000" id="svg_3" height="24" width="24" y="3" x="3" stroke-width="0" fill="#000"/>
  </g>
  <rect stroke="#008CFF" id="svg_5" height="3" width="12" y="13" x="8" stroke-width="0.5" fill="#000" />
</svg>

      </div>
    </div>
  );
};

export default CyberpunkCursor;
