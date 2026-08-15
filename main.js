"use strict";

let player;
const videoId = "ruOoPMOsTZ4";
const startButton = document.getElementById("start-stream");
const consent = document.getElementById("consent");

function loadYouTubeApi() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
}

function onYouTubeIframeAPIReady() {
    const playerVars = {
        autoplay: 1,
        controls: 1,
        mute: 0,
        rel: 0,
        iv_load_policy: 3
    };
    if (window.location.origin.startsWith("http")) {
        playerVars.origin = window.location.origin;
    }

    player = new YT.Player("player", {
        host: "https://www.youtube-nocookie.com",
        videoId: videoId,
        playerVars: playerVars,
        events: {
            onReady: onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    event.target.unMute();
    event.target.setVolume(80);
    consent.hidden = true;
    event.target.getIframe().focus();
}

startButton.addEventListener("click", function () {
    startButton.disabled = true;
    startButton.textContent = "Stream wird geladen …";
    consent.classList.add("is-loading");
    loadYouTubeApi();
});
