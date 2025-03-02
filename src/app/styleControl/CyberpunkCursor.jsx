import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import "../../css/Cursor.css";

const CyberpunkCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cursor = document.querySelector("#cursor");

    const handleMouseMove = (e) => {
      if (!isVisible) {
        setIsVisible(true);
        gsap.to(cursor, { opacity: 1, duration: 0.4, ease: "power2.out" });
      }

      gsap.to(cursor, {
        duration: 0.1,
        x: e.clientX - 12, // Центр курсора (24 / 2)
        y: e.clientY - 12,
        ease: "power1.out",
      });
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      gsap.to(cursor, { scale: 0.85, duration: 0.1 });
    };

    const handleMouseUp = () => {
      setIsClicking(false);
      gsap.to(cursor, { scale: isHovering ? 1.15 : 1, duration: 0.1 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { opacity: 0, duration: 0.4, ease: "power2.out" });
      setTimeout(() => setIsVisible(false), 400);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isHovering, isClicking, isVisible]);

  return (
    <div className="cursor">
      <div
        id="cursor"
        className={`${isHovering ? "hover" : ""} ${isClicking ? "click" : ""}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="#000" />
          <g>
            <rect stroke="#000" height="24" width="24" y="0" x="0" strokeWidth="0" fill="#00AFFF" />
            <rect stroke="#000" height="20" width="20" y="2" x="2" strokeWidth="0" fill="#000" />
          </g>
          <rect stroke="#008CFF" height="3" width="12" y="10.5" x="6" strokeWidth="0.5" fill="#000" />
        </svg>
      </div>
    </div>
  );
};

export default CyberpunkCursor;
