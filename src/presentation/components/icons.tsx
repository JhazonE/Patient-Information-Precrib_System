import React from "react";

export const PlusIcon = ({size = 24, width, height, ...props}: any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    >
      <path d="M12 18V6" />
      <path d="M6 12h12" />
    </g>
  </svg>
);

export const SearchIcon = (props: any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const HomeIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M9 22V12h6v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const UsersIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const SettingsIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M12.22 2a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v2.16a1 1 0 0 1-.58.9l-2 1a1 1 0 0 1-1.22-.3l-.7-.9a1 1 0 0 0-1.4-.2l-1.06.74a1 1 0 0 0-.2 1.4l.71 1a1 1 0 0 1 0 1.25l-.71 1a1 1 0 0 0 .2 1.4l1.06.74a1 1 0 0 0 1.4-.2l.7-.9a1 1 0 0 1 1.22-.3l2 1a1 1 0 0 1 .58.9V22a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.16a1 1 0 0 1 .58-.9l2-1a1 1 0 0 1 1.22.3l.7.9a1 1 0 0 0 1.4.2l1.06-.74a1 1 0 0 0 .2-1.4l-.71-1a1 1 0 0 1 0-1.25l.71-1a1 1 0 0 0-.2-1.4l-1.06-.74a1 1 0 0 0-1.4.2l-.7.9a1 1 0 0 1-1.22.3l-2-1a1 1 0 0 1-.58-.9V2a1 1 0 0 0-1-1h-1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const ShieldIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const ChartIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M3 3v18h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M18 9l-5 5-2-2-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const ClipboardIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const CalendarIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </svg>
);

export const TrashIcon = (props: any) => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" {...props}>
    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M10 11v6m4-6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);
