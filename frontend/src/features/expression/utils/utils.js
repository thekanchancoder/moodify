import {
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

export const init = async ({ landmarkerRef, videoRef, streamRef }) => {
    // 1. Prevent duplicate initialization if landmarker already exists
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

    // 2. Prevent creating duplicate webcam streams
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

export const detect = ({ landmarkerRef, videoRef, setExpression }) => {
    if (!landmarkerRef.current || !videoRef.current) return "Neutral";

    // Ensure video is ready before detecting
    if (videoRef.current.readyState < 2) return "Neutral";

    const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
    );

    if (results.faceBlendshapes?.length > 0) {
        const blendshapes = results.faceBlendshapes[0].categories;

        const getScore = (name) =>
            blendshapes.find((b) => b.categoryName === name)?.score || 0;

        const smileLeft = getScore("mouthSmileLeft");
        const smileRight = getScore("mouthSmileRight");
        const jawOpen = getScore("jawOpen");
        const browUp = getScore("browInnerUp");
        const frownLeft = getScore("mouthFrownLeft");
        const frownRight = getScore("mouthFrownRight");

        let currentExpression = "Neutral";

        if (smileLeft > 0.4 && smileRight > 0.4) {
            currentExpression = "happy";
        } else if (jawOpen > 0.25 && browUp > 0.2) {
            currentExpression = "surprised";
        } else if (frownLeft > 0.15 && frownRight > 0.15) {
            currentExpression = "sad";
        }

        if (setExpression) {
            setExpression(currentExpression);
        }

        return currentExpression;
    }

    return "Neutral";
};