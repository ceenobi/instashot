import React, { useState } from "react";

export default function useTag() {
  const [tags, setTags] = useState<string[]>([]);

  const handleTags = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const tag = target.value.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        target.value = "";
      }
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  return { tags, setTags, handleTags, removeTag };
}
