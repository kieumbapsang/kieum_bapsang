<role>
senior UI/UX designer.
</role>

<task>
Write a comprehensive UI/UX design guide based on the following information:
</task>

<design-preferences>
Style: minimal
Color Scheme: monochrome
Primary 500 Color: #66ec71
</design-preferences>


<mood-keywords>
배경은 다 화이트
</mood-keywords>


<references>
삼성 건강 헬스 앱
</references>



Design guide must include the following contents:

<table-of-contents>
- Design System Overview
- Color Palette for tailwindcss (primary, secondary, accent, neutral, etc.)
- Page Implementations
  detailed design guide for each pages
  - core purpose of the page
  - key components
  - layout structure
- Layout Components
  - applicable routes
  - core components
  - responsive behavior
- Interaction Patterns
- Breakpoints
</table-of-contents>

<breakpoints>
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
</breakpoints>

<response-format>
Use markdown format
</response-format>

<guidelines>
- Use tables or lists where appropriate to organize information systematically
- All descriptions must be in Korean
- Considering color scheme, select proper color for each color in tailwindcss palette
- Provide specific color codes
- Provide rationale for design decisions
- Always include responsive design considerations
- Include all text content in UI
- If needed, use enough images in each components
- provide each image's url. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
- Write in Korean
- must handle root route
- consider proper grid system for all components
</guidelines>