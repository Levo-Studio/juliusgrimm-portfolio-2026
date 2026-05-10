"use client";

import { useState } from "react";
import Image from "next/image";

type ProjectThumbProps = {
  title: string;
  imageUrl: string | null;
};

export const ProjectThumb = ({ title, imageUrl }: ProjectThumbProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(imageUrl));

  return (
    <div className="relative h-[118px] overflow-hidden bg-[#1a1b1f] sm:h-[138px] md:h-[168px]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${title} preview`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoad={() => setIsLoading(false)}
        />
      ) : null}

      {isLoading ? (
        <div className="crt-loader absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#5BE38B] md:text-[12px]">TUNING SIGNAL...</div>
        </div>
      ) : null}

      {!imageUrl ? <div className="absolute inset-0 bg-[#1a1b1f]" /> : null}
    </div>
  );
};
