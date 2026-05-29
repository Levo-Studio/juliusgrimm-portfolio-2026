import { DirectProjectImage } from "@/components/shared/direct-project-image";

type ProjectThumbProps = {
  title: string;
  imageUrl: string | null;
};

export const ProjectThumb = ({ title, imageUrl }: ProjectThumbProps): React.JSX.Element => {
  const hasImage = Boolean(imageUrl);

  return (
    <div className="relative aspect-[1200/630] w-full overflow-hidden bg-[#1a1b1f]">
      {hasImage ? (
        <DirectProjectImage
          src={imageUrl ?? ""}
          alt={`${title} preview`}
        />
      ) : null}

      {!hasImage ? (
        <div className="crt-loader absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[#5BE38B] md:text-[12px]">
            NO SIGNAL
          </div>
        </div>
      ) : null}
    </div>
  );
};
