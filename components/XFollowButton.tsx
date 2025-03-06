import React from "react";
import { Button } from "@/components/ui/button";

interface XFollowButtonProps {
  username: string;
  className?: string;
  children?: React.ReactNode;
}

const XFollowButton: React.FC<XFollowButtonProps> = ({
  username,
  className = "",
  children = "Follow on X",
}) => {
  const handleFollow = () => {
    // Open X profile in a new tab
    window.open(`https://x.com/${username}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant="outline"
      onClick={handleFollow}
      className={`flex items-center space-x-2 ${className}`}
    >
      {/* X (Twitter) logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M18.901 1.153h3.68l-8.04 9.557L24 22.846h-7.406l-5.8-7.584-6.638 7.584H1.474l8.659-9.876L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.303 17.649h2.034L6.540 3.233H4.366l13.232 15.569Z" />
      </svg>
      <span>{children}</span>
    </Button>
  );
};

export default XFollowButton;
