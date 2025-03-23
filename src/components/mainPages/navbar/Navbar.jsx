import React from "react";


const Navbar = ({ activ, setActiv}) => {
  return (
    <>
      <li className="cyberpunkButton" data-text="Digital Vault" onClick={() => setActiv(!activ)}>
       <span >Digital Vault</span>
      </li>
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
