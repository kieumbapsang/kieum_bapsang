/**
 * ImageWithFallback 컴포넌트 (시안 기반)
 *
 * 이미지 로딩 실패 시 폴백 이미지를 표시하는 컴포넌트
 *
 * **시안 디자인 스펙:**
 * - 이미지 로딩 실패 시 회색 배경 + 기본 이미지 아이콘 표시
 * - 원본 이미지 URL을 data-original-url 속성에 저장
 */

import React, { useState } from 'react';

/**
 * 폴백 이미지 (SVG base64 인코딩)
 * 회색 톤의 간단한 이미지 플레이스홀더
 */
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

/**
 * ImageWithFallback 컴포넌트
 *
 * 이미지 로딩 실패 시 자동으로 폴백 이미지를 표시합니다.
 *
 * @param {React.ImgHTMLAttributes<HTMLImageElement>} props - 이미지 속성
 * @returns {React.ReactElement} ImageWithFallback UI
 *
 * @example
 * ```tsx
 * <ImageWithFallback
 *   src="https://example.com/image.jpg"
 *   alt="설명"
 *   className="w-16 h-16 rounded-lg"
 * />
 * ```
 */
export const ImageWithFallback: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const [didError, setDidError] = useState(false);

  /**
   * 이미지 로딩 실패 핸들러
   */
  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
};
