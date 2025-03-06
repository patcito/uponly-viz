"use client";
import TradingCompoundCalculator from "@/components/calculator";
import XFollowButton from "@/components/XFollowButton";
import { X } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <TradingCompoundCalculator />
      <div className="flex justify-center items-center mb-10">
        <XFollowButton username="patcito" />
      </div>
    </div>
  );
}
