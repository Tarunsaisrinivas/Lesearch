"use client";

import React from "react";
import { Settings2, X } from "lucide-react";
import { Button } from "./ui/button";

const DockToggle = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        {!isOpen ? (
          <Settings2
            className={`absolute h-5 w-5 transition-all duration-200 ${
              isOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"
            }`}
          />
        ) : (
          <X
            className={`absolute h-5 w-5 transition-all duration-200 ${
              isOpen ? "rotate-0 scale-100" : "rotate-90 scale-0"
            }`}
          />
        )}
        <span className="sr-only">Toggle Dock</span>
      </Button>
    </>
  );
};

export default DockToggle;
