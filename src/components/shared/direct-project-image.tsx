"use client";

import { useState } from "react";

type DirectProjectImageProps = {
  src: string;
  alt: string;
  loadingLabel?: string;
  errorLabel?: string;
};

export const DirectProjectImage = ({
  src,
  alt,
  loadingLabel = "TUNING SIGNAL...",
  errorLabel = "IMAGE OFFLINE"
}: DirectProjectImageProps): React.JSX.Element => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <>
      {status !== "error" ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      ) : null}

      {status !== "loaded" ? (
        <div className="crt-loader absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#5BE38B] md:text-[12px]">
            {status === "error" ? errorLabel : loadingLabel}
          </div>
        </div>
      ) : null}
    </>
  );
};
