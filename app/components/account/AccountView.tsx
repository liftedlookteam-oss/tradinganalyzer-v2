"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import DesktopAccount from "./DesktopAccount";
import MobileAccount from "./MobileAccount";

type AccountViewProps = {
  children: ReactNode;
};

export default function AccountView({
  children,
}: AccountViewProps) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setMobile(window.innerWidth < 1024);
    };

    update();

    window.addEventListener("resize", update);

    return () =>
      window.removeEventListener("resize", update);
  }, []);

  if (mobile) {
    return (
      <MobileAccount>
        {children}
      </MobileAccount>
    );
  }

  return (
    <DesktopAccount>
      {children}
    </DesktopAccount>
  );
}