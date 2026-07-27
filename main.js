var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
const videoId = 'ruOoPMOsTZ4'; // Die Video-ID

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'mute': 1,         // Muss für Autoplay stumm starten
            'rel': 0,
            'iv_load_policy': 3,
            'origin': 'https://www.youtube.com' // <-- DER FIX FÜR DEN LOKALEN ERROR
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

// Entstummt das Video beim ersten Klick
window.addEventListener('click', function() {
    if (player && typeof player.unMute === 'function') {
        player.unMute();
        player.setVolume(80);
        document.getElementById('hint').style.opacity = '0';
    }
});
