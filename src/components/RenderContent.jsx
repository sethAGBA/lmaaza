import React from 'react';

const isHtml = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /<[^>]+>/.test(str);
};

const RenderContent = ({ content, className = '' }) => {
  if (!content) return <span className="text-gray-600">(sans contenu)</span>;
  return isHtml(content) ? (
    <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <div className={className + ' whitespace-pre-wrap'}>{content}</div>
  );
};

export default RenderContent;
