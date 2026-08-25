import { highlightWords } from "@/lib/text-highlight";

type HighlightedParagraphProps = { children: string; className?: string };

export const HighlightedParagraph = ({ children, className }: HighlightedParagraphProps): React.JSX.Element => {
  const words = children.split(" ");
  const highlighted = highlightWords(words);

  return (
    <p className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className={highlighted[index] ? "text-accent" : undefined}>{word}</span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
};
