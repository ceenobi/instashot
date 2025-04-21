import { useInView } from "react-intersection-observer";
import React, { useRef } from "react";

export function ImageContainer({
  media,
}: {
  media: {
    alt: string;
    height: number;
    src: string;
    width: number;
    className: string;
  };
}) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <>
      <img
        ref={ref}
        alt={media.alt}
        height={media.height}
        width={media.width}
        src={inView ? media.src : undefined}
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        className={media.className}
      />
    </>
  );
}

export interface VideoProps {
  src: string;
  width: number;
  height: number;
  className: string;
}

export const VideoContainer = React.forwardRef<
  HTMLVideoElement,
  { video: VideoProps }
>((props, ref) => {
  const [intersectionRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  React.useImperativeHandle(ref, () => {
    return videoRef.current as HTMLVideoElement;
  });

  return (
    <>
      <video
        ref={(node) => {
          videoRef.current = node;
          intersectionRef(node);
        }}
        width={props.video.width}
        height={props.video.height}
        src={inView ? props.video.src : undefined}
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        className={props.video.className}
        controls={false}
        playsInline
        loop
        autoPlay
      />
    </>
  );
});
