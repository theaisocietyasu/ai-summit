"use client";

import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}

export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
  filter = true,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const [hasAnimated, setHasAnimated] = useState(false);
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (hasAnimated) return;

    const runAnimation = async () => {
      await animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration,
          delay: stagger(0.1),
        }
      );
      setHasAnimated(true);
    };

    runAnimation();
  }, [animate, duration, filter, hasAnimated]);

  return (
    <div ref={scope} className={cn("font-bold", className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="inline-block opacity-0"
          style={{
            filter: filter ? "blur(10px)" : "none",
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </div>
  );
}
