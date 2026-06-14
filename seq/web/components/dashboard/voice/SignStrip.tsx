import { SignLetterCard } from "./SignLetterCard";

type Props = {
  text: string;
  signMap: Map<string, string>;
};

export function SignStrip({ text, signMap }: Props) {
  const letters = text.toUpperCase().split("");

  if (letters.length === 0) return null;

  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-1 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      {letters.map((letter, i) => (
        <SignLetterCard
          key={i}
          letter={letter}
          url={letter === " " ? undefined : signMap.get(letter)}
          size={60}
        />
      ))}
    </div>
  );
}
