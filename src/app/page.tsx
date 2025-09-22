import React from "react";
import HeroPage from "@/components/HeroPage";
import { SectionGallery } from "@/components/SectionGallery";
// import App from "next/app";
import AppLayout from "@/layout/app";

export default function Home() {
  return (
    <AppLayout>
      {" "}
      <>
        <HeroPage />
        <SectionGallery />
      </>
    </AppLayout>
  );
}
