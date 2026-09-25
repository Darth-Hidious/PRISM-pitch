import { useEffect, useRef } from 'react';
import type Hls from 'hls.js';

interface VideoBackgroundProps {
    src: string;
    className?: string;
}

/**
 * Muted, looping HLS background video. Under reduced motion it loads but does
 * not play, so the first frame stands still.
 */
export default function VideoBackground({ src, className }: VideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const play = () => {
            if (!still) video.play().catch(() => {});
        };

        let hls: Hls | null = null;
        let cancelled = false;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari plays HLS natively.
            video.src = src;
            video.addEventListener('loadedmetadata', play);
        } else {
            // hls.js is large; load it only when a video actually mounts.
            import('hls.js').then(({ default: HlsLib }) => {
                if (cancelled || !HlsLib.isSupported()) return;
                hls = new HlsLib({ enableWorker: true, capLevelToPlayerSize: true, maxBufferLength: 30 });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(HlsLib.Events.MANIFEST_PARSED, play);
            });
        }

        return () => {
            cancelled = true;
            hls?.destroy();
            video.removeEventListener('loadedmetadata', play);
        };
    }, [src]);

    return (
        <video
            ref={videoRef}
            className={className}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
        />
    );
}
