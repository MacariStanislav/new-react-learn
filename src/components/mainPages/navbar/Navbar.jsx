import React from "react";
import { Link } from "react-router-dom";



const Navbar = () => {

  return (
    <>

      <li className="cyberpunkButton" data-text="Digital Vault">
        {/* Pensioneer's code start */}
        <Link to={"/profile"}>Digital Vault</Link> {/* подключил роут страницы profile но из за link,м помощью которого и работает навигация он сбивает стили, проверь короче сам мб стили менять нада */}
        {/* Pensioneer's code end*/}
      </li >
      <li className="cyberpunkButton" data-text="NeuroLink">
        <span>NeuroLink</span>
      </li>
      <li className="cyberpunkButton" data-text="Neon Hub">
        <span>Neon Hub</span>
      </li>
      <li className="cyberpunkButton" data-text="Neuro Sync">
        <span>Neuro Sync</span>
      </li>
    </>
  );
};
export default Navbar;