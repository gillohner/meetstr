// src/utils/formatting/formatTextWithLineBreaks.tsx
const formatTextWithLineBreaks = (text?: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index, arr) => (
      <span key={index}>
        {line}
        {index !== arr.length - 1 && <br />}
      </span>
    ));
};

export { formatTextWithLineBreaks };