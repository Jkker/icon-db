import React from 'react';

export default function TransparentGrid({
  size = 15,
  opacity = 0.1,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="100%"
      height="100%"
      opacity={opacity}
      {...props}
    >
      <defs>
        <pattern
          id="grid"
          width={size * 2}
          height={size * 2}
          patternUnits="userSpaceOnUse"
        >
          <rect fill="black" x="0" y="0" width={size} height={size} />
          <rect fill="white" x={size} y="0" width={size} height={size} />
          <rect fill="black" x={size} y={size} width={size} height={size} />
          <rect fill="white" x="0" y={size} width={size} height={size} />
        </pattern>
      </defs>
      <rect fill="url(#grid)" x="0" y="0" width="100%" height="100%" />
    </svg>
  );
}
