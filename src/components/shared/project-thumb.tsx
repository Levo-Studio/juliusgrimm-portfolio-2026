"use client";

import { useState } from "react";
import Image from "next/image";

type ProjectThumbProps = {
  title: string;
  imageUrl: string | null;
};

export const ProjectThumb = ({ title, imageUrl }: ProjectThumbProps): React.JSX.Element => {
  const hasImage = Boolean(imageUrl);
  const [isLoading, setIsLoading] = useState<boolean>(hasImage);

  return (
    <div className="relative aspect-[1200/630] w-full overflow-hidden bg-[#1a1b1f]">
      {hasImage ? (
        <Image
          src={imageUrl ?? ""}
          alt={`${title} preview`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoad={() => setIsLoading(false)}
        />
      ) : null}

      {!hasImage || isLoading ? (
        <div className="crt-loader absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#5BE38B] md:text-[12px]">
            {hasImage ? "TUNING SIGNAL..." : "NO SIGNAL"}
          </div>
        </div>
      ) : null}
    </div>
  );
};
