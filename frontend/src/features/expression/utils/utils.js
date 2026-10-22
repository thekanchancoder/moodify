import {
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

export const init = async ({ landmarkerRef, videoRef, streamRef }) => {
    // 1. Prevent duplicate initialization
    if (landmarkerRef.current) return;

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        }
    );

    // 2. Prevent duplicate webcam streams
    if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
                await videoRef.current.play();
            } catch (err) {
                console.log("Play interrupted:", err);
            }
        }
    }
};

export const detect = async ({ landmarkerRef, videoRef, setExpression }) => {
    if (!landmarkerRef.current || !videoRef.current) return "Neutral";

    // Ensure video is ready before detecting
    if (videoRef.current.readyState < 2) return "Neutral";

    const sampleFrame = () => {
        try {
            const results = landmarkerRef.current.detectForVideo(
                videoRef.current,
                performance.now()
            );

            if (!results.faceBlendshapes?.length) return null;

            const blendshapes = results.faceBlendshapes[0].categories;
            const getScore = (name) =>
                blendshapes.find((b) => b.categoryName === name)?.score || 0;

            // BlendShape Scores
            const smileLeft = getScore("mouthSmileLeft");
            const smileRight = getScore("mouthSmileRight");
            const jawOpen = getScore("jawOpen");
            const browUp = getScore("browInnerUp");
            const frownLeft = getScore("mouthFrownLeft");
            const frownRight = getScore("mouthFrownRight");
            // 1. HAPPY: Prominent smile
            if (smileLeft > 0.35 && smileRight > 0.35) {
                return "happy";
            }

            // 2. SURPRISED: Open jaw with raised eyebrows
            if (jawOpen > 0.25 && browUp > 0.2) {
                return "surprised";
            }

            // 3. SAD:
            if (frownLeft > 0.0001 && frownRight > 0.0001) {
                return "sad";
            }

            return "Neutral";
        } catch (err) {
            return null;
        }
    };

    // Sample across 4 quick frames (~250ms) to ensure stable and reliable detection
    const counts = { happy: 0, sad: 0, surprised: 0, Neutral: 0 };
    for (let i = 0; i < 4; i++) {
        const exp = sampleFrame();
        if (exp && counts[exp] !== undefined) {
            counts[exp]++;
        }
        await new Promise((r) => setTimeout(r, 65));
    }

    // Determine the winning expression (prioritizing specific emotion if detected >= 2 times)
    let bestExpression = "Neutral";
    if (counts.sad >= 2) {
        bestExpression = "sad";
    } else if (counts.happy >= 2) {
        bestExpression = "happy";
    } else if (counts.surprised >= 2) {
        bestExpression = "surprised";
    } else {
        bestExpression = Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b, "Neutral");
    }

    if (setExpression) {
        setExpression(bestExpression);
    }

    return bestExpression;
};

// Cleanup function to stop camera and close landmarker instance
export const stop = ({ landmarkerRef, streamRef, videoRef }) => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
    }
};