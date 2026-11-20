"use client";

import React from "react";

const formatAiResponseText = (raw: string): string => {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])(###\s+)/g, "$1\n\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const renderInlineBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

export default function FormattedMessageContent({
  text,
  isUser,
}: {
  text: string;
  isUser: boolean;
}) {
  if (isUser) {
    return (
      <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
        {text}
      </p>
    );
  }

  const cleaned = formatAiResponseText(text);
  const lines = cleaned.split("\n");

  return (
    <div className="space-y-1.5 wrap-break-word leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={index} className="h-1" />;
        }

        if (trimmed === "---") {
          return <hr key={index} className="border-slate-200 my-2" />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={index}
              className="font-bold text-emerald-700 text-[13px] pt-1"
            >
              {renderInlineBold(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={index} className="font-bold text-slate-900 text-sm pt-1">
              {renderInlineBold(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        if (/^[-*•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={index} className="flex items-start gap-1.5 pl-1">
              <span className="text-emerald-600 font-bold mt-0.5 shrink-0">
                •
              </span>
              <span className="flex-1 min-w-0">
                {renderInlineBold(content)}
              </span>
            </div>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {renderInlineBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
