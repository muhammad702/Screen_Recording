
    let recorder;
    let isRecording = false;
    let startTime;
    let timerInterval;
    let elapsedTimeInSeconds = 0;
    let pauseStartTime;
let puse_Resume_Video = document.getElementById("puse_Resume")
    function startRecording() {
        const videoOptions = {
            video: {
                mediaSource: 'screen', // Use screen as the media source
            },
            audio: true, // Enable audio recording
        };

        navigator.mediaDevices.getDisplayMedia(videoOptions).then(userStream => {
            const audioOptions = {
                audio: true,
            };

            navigator.mediaDevices.getUserMedia(audioOptions).then(audioStream => {
                // Combine the screen and audio streams
                const combinedStream = new MediaStream([...userStream.getTracks(), ...audioStream.getTracks()]);

                // Start recording
                recorder = RecordRTC(combinedStream, {
                    type: 'video',
                    mimeType: 'video/mp4', // Use WebM for video format
                    audioBitsPerSecond: 128000, // Adjust audio bitrate as needed
                    videoBitsPerSecond: 2500000, // Adjust video bitrate as needed
                });

                recorder.startRecording();
                if (pauseStartTime) {
                    // Calculate elapsed time since pause
                    const elapsedPausedTime = Date.now() - pauseStartTime;
                    startTime += elapsedPausedTime;
                } else {
                    startTime = Date.now();
                }
                updateTimer();
                // Start updating the timer every second
                timerInterval = setInterval(updateTimer, 1000);
                isRecording = true;
            }).catch(error => {
                console.error('Error accessing audio stream:', error);
            });
        }).catch(error => {
            console.error('Error accessing screen:', error);
        });
    }

    function stopRecording() {
        if (isRecording) {
            recorder.stopRecording(() => {
                clearInterval(timerInterval);
                const blob = recorder.getBlob();
                // Prompt the user for the video file name
                const fileName = prompt("Enter Name The Video");
                if (!fileName) return; // User canceled
                const videoExtension = '.mp4'; // Use mp4 for video format
                const fullFileName = fileName + videoExtension;
                // Display the video duration
                const durationInSeconds = Math.floor((Date.now() - startTime) / 1000);
                

                // Save the video to a specific location on your device.
                const savePath = `${fullFileName}`;
                saveVideo(blob, savePath);
            });
        }
    }

    function pauseResumeRecording() {
        if (recorder) {
            if (recorder.state === 'paused') {
              puse_Resume_Video.innerHTML="Pause"
                recorder.resumeRecording();
                if (pauseStartTime) {
                    // Calculate elapsed time since pause
                    const elapsedPausedTime = Date.now() - pauseStartTime;
                    startTime += elapsedPausedTime;
                }
                updateTimer();
            } else if (recorder.state === 'recording') {
              puse_Resume_Video.innerHTML="Resume"
                recorder.pauseRecording();
                // Record pause time
                pauseStartTime = Date.now();
            }
        }
    }

    function updateTimer() {
        if (recorder && recorder.state === 'recording') {
            const currentTime = Date.now();
            elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
            document.getElementById('timer').innerText = formatTime(elapsedTimeInSeconds);
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function saveVideo(blob, path) {
        saveAs(blob, path);
    }
