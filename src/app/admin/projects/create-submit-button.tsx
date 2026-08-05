"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export const CreateSubmitButton = ({ className, children }: Props): React.JSX.Element => {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const handler = (event: Event): void => {
      setComplete(Boolean((event as CustomEvent<{ complete: boolean }>).detail?.complete));
    };
    window.addEventListener("case-study-validity", handler);
    return () => window.removeEventListener("case-study-validity", handler);
  }, []);

  return (
    <Button
      type="submit"
      form="project-create-form"
      disabled={!complete}
      className={`${className ?? ""} transition disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </Button>
  );
};
