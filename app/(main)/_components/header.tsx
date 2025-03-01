"use client";

import ToggleSidebarButton from "./toggle-sidebar-button";
import SettingsHeader from "../settings/_components/header";
import DocHeader from "../(routes)/documents/_components/header";
import DocDetailHeader from "../(routes)/documents/[...pages]/_components/header";
import ExploreBtn from "../(routes)/documents/[...pages]/_components/ExploreBtn";

const Header = function Header({
  maximizeHandler,
}: {
  maximizeHandler: () => void;
}) {
  return (
    <header className="flex h-12 items-center justify-start px-3">
      <ToggleSidebarButton onClick={maximizeHandler} />
      <SettingsHeader />
      <DocHeader />
      <DocDetailHeader />
      <ExploreBtn />
    </header>
  );
};

export default Header;
