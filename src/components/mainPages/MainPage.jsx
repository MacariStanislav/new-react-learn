import React, { useEffect, useRef, useState } from "react";
import Navbar from "./navbar/Navbar";
import Messages from "./messages/Messages";
import "../../css/MainPage.css";
import Profile from "./profile/Profile";

const MainPage = ({ userSignOut, userName }) => {
  const divRainRef = useRef(null);

  const getRandomBinaryString = (length) => {
    const chars = "01";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  class Drop {
    constructor(x, y) {
      if (divRainRef.current) {
        const elem = document.createElement("div");
        elem.classList.add("drop");
        elem.style.left = `${x}px`;
        elem.style.color = "darkblue";
        elem.style.fontSize = "small";
        elem.style.fontFamily = "Consolas";
        elem.style.opacity = `0.${Math.floor(Math.random() * 10) + 1}`;
        elem.style.top = `${y}px`;
        elem.innerHTML = `<span class="leader">${getRandomBinaryString(
          1
        )}</span>`;
        divRainRef.current.appendChild(elem);
      }
    }
  }

  const cleanup = () => {
    const elements = document.getElementsByClassName("drop");
    Array.from(elements).forEach((el, i) => {
      if (Math.random() > 0.9) {
        el.innerHTML = `<span class="leader">${getRandomBinaryString(
          1
        )}</span>`;
      }
    });

    while (elements.length > 400) {
      elements[0]?.parentNode?.removeChild(elements[0]);
    }
  };

  const loop = () => {
    if (divRainRef.current) {
      const rx = Math.floor(Math.random() * window.innerWidth);
      new Drop(rx, 0);
      cleanup();
    }
    requestAnimationFrame(loop);
  };

  useEffect(() => {
    loop();
    return () => {
      if (divRainRef.current) {
        divRainRef.current.innerHTML = "";
      }
    };
  }, []);
  const [activ, setActiv] = useState(false);
const [activProfile,setActivProfile]=useState(false);
  return (
    <>
      <div id="divRain" ref={divRainRef}></div>
      <div className="allMain">
        {activ &&<Messages userName={userName} />}
        {activProfile&& <Profile/>}
        <div className="MainNav">
        <Navbar activ={activ} setActiv={setActiv} />
        
          <button
            className="cyberpunkButton"
            onClick={userSignOut}
            data-text="Sign Out"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MainPage;
