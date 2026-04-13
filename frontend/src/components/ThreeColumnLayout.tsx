import type { ReactNode } from "react";

type ThreeColumnLayoutProps = {
  left: ReactNode;
  middle: ReactNode;
  right: ReactNode;
};

export function ThreeColumnLayout({ left, middle, right }: ThreeColumnLayoutProps) {
  return (
    <main className="layout">
      <aside className="left-column">{left}</aside>
      <section className="middle-column">{middle}</section>
      <aside className="right-column">{right}</aside>
    </main>
  );
}
