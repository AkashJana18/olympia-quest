import { useState } from "react";
import { TRIVIA } from "../game/quests";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  done: boolean;
  onComplete: () => void;
  onClose: () => void;
};

export function TriviaPanel({ done, onComplete, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = TRIVIA[index];
  const correct = picked === q?.correct;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (index < TRIVIA.length - 1) {
      setIndex((i) => i + 1);
      setPicked(null);
    } else {
      setFinished(true);
    }
  };

  if (done && !finished) {
    return (
      <Sheet eyebrow="THE ARCHIVE" onClose={onClose} className="trivia-sheet">
        <div className="empty tall">
          <Icon name="check" size={30} />
          <b>Archive already cleared</b>
          <span>You found the terminal and filed the receipt. Nothing left to prove here.</span>
        </div>
        <button className="btn ghost full" onClick={onClose}>
          Back to the floor
        </button>
      </Sheet>
    );
  }

  if (finished) {
    return (
      <Sheet eyebrow="THE ARCHIVE" onClose={onClose} className="trivia-sheet">
        <div className="trivia-result">
          <span className="eyebrow">ARCHIVE CLEARED</span>
          <b>
            {score}/{TRIVIA.length}
          </b>
          <p>
            {score === 3
              ? "Every answer. You were paying attention."
              : "Good enough. The receipt is what matters."}
          </p>
        </div>
        <div className="sheet-actions">
          <button
            className="btn primary"
            onClick={() => {
              onComplete();
              onClose();
            }}
          >
            <Icon name="sign" size={16} />
            File the 25 point receipt
          </button>
          <button className="btn ghost" onClick={onClose}>
            Back to the floor
          </button>
        </div>
        <p className="micro-note">One receipt per run. The questions are about the venue, not your worth.</p>
      </Sheet>
    );
  }

  return (
    <Sheet eyebrow="THE ARCHIVE" onClose={onClose} className="trivia-sheet">
      <div className="trivia-top">
        <div className="trivia-dots">
          {TRIVIA.map((_, i) => (
            <span key={i} className={i <= index ? "on" : ""} />
          ))}
        </div>
        <span className="eyebrow">
          QUESTION {index + 1} / {TRIVIA.length}
        </span>
      </div>

      <h2 className="trivia-q">{q.q}</h2>

      <div className="trivia-answers">
        {q.answers.map((a, i) => {
          let state = "";
          if (picked !== null) {
            if (i === q.correct) state = "correct";
            else if (i === picked) state = "wrong";
            else state = "muted";
          }
          return (
            <button key={a} className={`answer ${state}`} onClick={() => pick(i)}>
              <span>{String.fromCharCode(65 + i)}</span>
              {a}
              {picked !== null && i === q.correct && <Icon name="check" size={16} />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className={correct ? "trivia-feedback ok" : "trivia-feedback bad"}>
          <b>{correct ? "Correct." : "Not quite."}</b>
          <span>{correct ? "On to the next one." : `The answer is ${q.answers[q.correct]}.`}</span>
          <button className="btn primary small" onClick={next}>
            {index === TRIVIA.length - 1 ? "See result" : "Next question"}
            <Icon name="arrow" size={14} />
          </button>
        </div>
      )}

      <p className="micro-note">
        Found at the archive terminal near the ground floor stairs. Three questions, one receipt.
      </p>
    </Sheet>
  );
}
