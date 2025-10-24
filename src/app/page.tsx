import React from "react";
import HeroPage from "@/components/HeroPage";
import { ImageCollage} from "@/components/ImageCollage";
import RegisterSteps from "@/components/RegisterSteps"
// import App from "next/app";
import AppLayout from "@/layout/app";

export default function Home() {
  return (
    <AppLayout>
      {" "}
      <>
        <HeroPage />
        <ImageCollage />
        <RegisterSteps />
      </>
    </AppLayout>
  );
}
