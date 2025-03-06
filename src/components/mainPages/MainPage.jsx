import React, { useEffect, useRef } from "react";

import Navbar from "./navbar/Navbar";
import Messages from "./messages/Messages";

import "../../css/MainPage.css";

const MainPage = ({ userSignOut, userName }) => {
 
  const divRainRef = useRef(null);

  const GetAString = (len) => {
    const chars = "01";
    let strOut = "";
    for (let i = 0; i < len; i++) {
      strOut += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return strOut;
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
        elem.innerHTML = `<span class="leader">${GetAString(1)}</span>`;
        divRainRef.current.appendChild(elem);
      }
    }
  }

  const cleanup = () => {
    const elements = document.getElementsByClassName("drop");
    for (let i = 0; i < elements.length; i++) {
      if (Math.floor(Math.random() * 10 + 1) > 9) {
        elements[i].innerHTML = `<span class="leader">${GetAString(1)}</span>`;
      }
    }

    while (elements.length > 400) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  };

  const loop = () => {
    if (divRainRef.current) {
      const rx = Math.floor(Math.random() * window.innerWidth + 1);
      new Drop(rx, 0);
      cleanup();
    }
    requestAnimationFrame(loop); //бесконечный цыкл
  };

  useEffect(() => {
    loop();
    return () => {
      if (divRainRef.current) {
        divRainRef.current.innerHTML = "";
      }
    };
  }, []);
  return (
    <>
      <div id="divRain" ref={divRainRef}></div>
      <div className="allMain">
        <Messages userName={userName} />
        <ul>
          <Navbar />
          <li>
            <button
              className="cyberpunkButton"
              onClick={userSignOut}
              data-text={"Sign Out"}
            >
              <span> Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
      {/* import { useNavigate } from "react-router-dom"; */}
      {/* const Profile = () => {  //для того чтобы в будущем переключать страницы в мейне не через состояния а по роутеру 
  const navigate = useNavigate(); // Хук для навигации

  return (
    <div>
      <h1>Профиль</h1>
      <button onClick={() => navigate("/messages")}>Перейти в сообщения</button>
    </div>
  );
}; */}
    </>
  );
};

export default MainPage;
