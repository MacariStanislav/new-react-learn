import React from "react";
import { Link } from "react-router-dom";



const Navbar = () => {

  return (
    <>
      <li>
        {/* Pensioneer's code start */}
        <Link to={"/profile"} className="cyberpunkButton" data-text="Digital Vault">Digital Vault</Link> {/* ураа я сделал я тупой */}
        {/* Pensioneer's code end*/}
      </li>
      <li>
        <Link data-text="NeuroLink" className="cyberpunkButton">NeuroLink</Link>
      </li>
      <li>
        <Link data-text="Neon Hub" className="cyberpunkButton">Neon Hub</Link>
      </li>
      <li>
        <Link data-text="Neuro Sync" className="cyberpunkButton">Neuro Sync</Link>
      </li>
    </>
  );
};
export default Navbar;