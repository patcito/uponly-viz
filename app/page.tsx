"use client";
import TradingCompoundCalculator from "@/components/calculator";
import XFollowButton from "@/components/XFollowButton";

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
