"use strict";

let player;
let loadTimeout;
let loadRequested = false;
const videoId = "ruOoPMOsTZ4";
const startButton = document.getElementById("start-stream");
const consent = document.getElementById("consent");
const statusMessage = document.getElementById("status-message");

function showLoadError() {
    loadRequested = false;
    clearTimeout(loadTimeout);
    if (player?.destroy) {
        player.destroy();
        player = undefined;
    }
    document.getElementById("youtube-api")?.remove();
    consent.hidden = false;
    consent.classList.remove("is-loading");
    consent.classList.add("is-error");
    consent.setAttribute("aria-busy", "false");
    statusMessage.textContent = "Der Stream konnte nicht geladen werden. Prüfe deine Verbindung oder Inhaltsblocker und versuche es erneut.";
    startButton.disabled = false;
    startButton.textContent = "Erneut versuchen";
}

function loadYouTubeApi() {
    if (window.YT?.Player) {
        onYouTubeIframeAPIReady();
        return;
    }
    const tag = document.createElement("script");
    tag.id = "youtube-api";
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = showLoadError;
    document.head.appendChild(tag);
    loadTimeout = setTimeout(showLoadError, 15000);
}

function onYouTubeIframeAPIReady() {
    if (!loadRequested) {
        return;
    }
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
            onReady: onPlayerReady,
            onError: showLoadError
        }
    });
}

function onPlayerReady(event) {
    clearTimeout(loadTimeout);
    consent.setAttribute("aria-busy", "false");
    event.target.playVideo();
    event.target.unMute();
    event.target.setVolume(80);
    consent.hidden = true;
    event.target.getIframe().focus();
}

startButton.addEventListener("click", function () {
    loadRequested = true;
    consent.classList.remove("is-error");
    consent.setAttribute("aria-busy", "true");
    startButton.disabled = true;
    startButton.textContent = "Stream wird geladen …";
    statusMessage.textContent = "Der Stream wird geladen.";
    consent.classList.add("is-loading");
    loadYouTubeApi();
});
