/* ==========================================================================
   JhonJhon & Juliet — invitation behaviour
   Countdown · theme · background music · opening gate · RSVP
   ========================================================================== */

var CONFIG = {
  // Ceremony start, Philippine time. Drives the countdown.
  weddingDate: '2026-11-28T13:00:00+08:00',

  // YouTube video used as the background track.
  videoId: '4B_TY200nOg',
  volume: 70,

  // Where RSVPs are delivered. Replace with your own Formspree form id.
  formEndpoint: 'https://formspree.io/f/xzepjjwo',

  timeline: [
    { time: '12:00 PM', label: 'CEREMONY' },
    { time: '2:00 PM', label: 'PICTORIAL' },
    { time: '3:30 PM', label: 'RECEPTION' },
    { time: '5:00 PM', label: 'DINNER' },
    { time: '6:00 PM', label: 'WEDDING PROGRAM' }
  ]
};

var $ = function (id) { return document.getElementById(id); };

/* --- Always open at the top ---------------------------------------------- */

// One page, one entrance. Browsers restore the previous scroll offset on
// refresh, which would drop a returning guest halfway down the invitation
// instead of on the gate and hero. Opt out and reset explicitly.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Arriving via back/forward serves the page from the bfcache, which restores
// scroll on its own, so reset again there.
window.addEventListener('pageshow', function (e) {
  if (e.persisted) window.scrollTo(0, 0);
});

/* --- Timeline ------------------------------------------------------------ */

(function renderTimeline() {
  var list = $('timeline');
  if (!list) return;

  CONFIG.timeline.forEach(function (row) {
    var li = document.createElement('li');

    var dot = document.createElement('span');
    dot.className = 'timeline__dot';

    var body = document.createElement('div');

    var time = document.createElement('div');
    time.className = 'timeline__time';
    time.textContent = row.time;

    var label = document.createElement('div');
    label.className = 'timeline__label';
    label.textContent = row.label;

    body.appendChild(time);
    body.appendChild(label);
    li.appendChild(dot);
    li.appendChild(body);
    list.appendChild(li);
  });
})();

/* --- Countdown ----------------------------------------------------------- */

(function countdown() {
  var target = new Date(CONFIG.weddingDate).getTime();
  var fields = {
    days: $('cdDays'), hours: $('cdHours'),
    minutes: $('cdMinutes'), seconds: $('cdSeconds')
  };

  var pad = function (n) { return String(n).padStart(2, '0'); };

  function tick() {
    var left = Math.max(0, target - Date.now());
    fields.days.textContent = pad(Math.floor(left / 86400000));
    fields.hours.textContent = pad(Math.floor(left / 3600000) % 24);
    fields.minutes.textContent = pad(Math.floor(left / 60000) % 60);
    fields.seconds.textContent = pad(Math.floor(left / 1000) % 60);
  }

  tick();
  setInterval(tick, 1000);
})();

/* --- Theme --------------------------------------------------------------- */

(function theme() {
  var root = document.documentElement;
  var icon = $('themeIcon');

  var apply = function (mode) {
    root.setAttribute('data-theme', mode);
    icon.textContent = mode === 'dark' ? '☾' : '☀';
  };

  try {
    var saved = localStorage.getItem('jj-theme');
    if (saved === 'light' || saved === 'dark') apply(saved);
  } catch (e) { /* private mode — stay on the default */ }

  $('themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('jj-theme', next); } catch (e) {}
  });
})();

/* --- Music --------------------------------------------------------------- */

var Music = (function () {
  var player = null;
  var on = true;
  var entered = false;

  var musicIcon = $('musicIcon');
  var playIcon = $('playIcon');
  var status = $('musicStatus');

  function paint() {
    document.body.classList.toggle('is-muted', !on);
    musicIcon.textContent = on ? '♪' : '✕';
    playIcon.textContent = on ? '❙❙' : '▶';
    status.textContent = on ? 'NOW PLAYING' : 'TAP TO PLAY MUSIC';
  }

  // Browsers only allow audible autoplay after a gesture, so the player starts
  // muted and is unmuted the moment the guest opens the invitation.
  function start() {
    var go = function () {
      if (!player || !player.playVideo) return;
      player.unMute();
      if (player.setVolume) player.setVolume(CONFIG.volume);
      player.playVideo();
    };
    go();
    setTimeout(go, 400);
    setTimeout(go, 1200);
  }

  function build() {
    if (player || !window.YT || !window.YT.Player) return;

    player = new window.YT.Player('yt-player', {
      videoId: CONFIG.videoId,
      width: 240,
      height: 135,
      playerVars: {
        autoplay: 1, mute: 1, controls: 0, playsinline: 1,
        loop: 1, playlist: CONFIG.videoId, modestbranding: 1, rel: 0
      },
      events: {
        onReady: function (e) {
          e.target.playVideo();
          if (entered && on) start();
        },
        onStateChange: function (e) {
          if (e.data === window.YT.PlayerState.ENDED) e.target.playVideo();
        }
      }
    });
  }

  function load() {
    if (window.YT && window.YT.Player) { build(); return; }

    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') prev();
      build();
    };

    if (!$('yt-api')) {
      var s = document.createElement('script');
      s.id = 'yt-api';
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }

  function toggle() {
    if (on) {
      if (player && player.pauseVideo) { player.mute(); player.pauseVideo(); }
      on = false;
    } else {
      on = true;
      start();
    }
    paint();
  }

  $('musicBtn').addEventListener('click', toggle);
  $('musicCard').addEventListener('click', toggle);

  paint();
  load();

  return {
    enter: function () {
      entered = true;
      on = true;
      paint();
      start();
    }
  };
})();

/* --- Films in the gallery ------------------------------------------------ */

// Kept muted and looping on purpose: a film should never fight the song playing
// over it. Each tile toggles independently, and starting one stops the others.
(function films() {
  var tiles = [].slice.call(document.querySelectorAll('.film'));
  if (!tiles.length) return;

  tiles.forEach(function (tile) {
    var video = tile.querySelector('.film__el');
    var btn = tile.querySelector('.film__btn');
    var icon = tile.querySelector('.film__icon');

    btn.addEventListener('click', function () {
      if (video.paused) {
        tiles.forEach(function (other) {
          var v = other.querySelector('.film__el');
          if (other !== tile && !v.paused) v.pause();
        });
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* refused — leave the still up */ });
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      tile.classList.add('is-playing');
      icon.innerHTML = '&#10073;&#10073;';
      btn.setAttribute('aria-label', 'Pause this film');
    });

    video.addEventListener('pause', function () {
      tile.classList.remove('is-playing');
      icon.innerHTML = '&#9654;';
      btn.setAttribute('aria-label', 'Play this film');
    });
  });
})();

/* --- Opening gate -------------------------------------------------------- */

(function gate() {
  var el = $('gate');

  var video = $('gateVideo');

  function open() {
    if (el.classList.contains('is-closing')) return;
    el.classList.add('is-closing');
    Music.enter();
    setTimeout(function () {
      el.classList.add('is-open');
      // The gate is display:none from here on, so stop decoding frames nobody
      // is looking at.
      if (video && video.pause) video.pause();
    }, 500);
  }

  el.addEventListener('click', open);
  $('gateBtn').addEventListener('click', function (e) { e.stopPropagation(); open(); });
})();

/* --- RSVP ---------------------------------------------------------------- */

(function rsvp() {
  var form = $('rsvpForm');
  var btn = $('rsvpBtn');
  var error = $('rsvpError');
  var note = $('rsvpNote');

  var sending = false;
  var done = false;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending || done) return;

    var name = $('guestName').value.trim();
    var count = $('guestCount').value.toString().trim();

    if (!name) {
      error.textContent = 'Please enter your name.';
      $('guestName').focus();
      return;
    }

    sending = true;
    error.textContent = '';
    btn.textContent = 'SENDING…';
    btn.disabled = true;

    try {
      var res = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name,
          guests: count || '1',
          attending: "Yes, I'll be there",
          wedding: 'JhonJhon & Juliet — November 28, 2026',
          hashtag: '#JhonJhonfoundhisJuliet',
          _subject: 'Wedding RSVP — ' + name
        })
      });

      if (!res.ok) throw new Error('send failed');

      done = true;
      sending = false;
      btn.textContent = "YOU'RE ON THE LIST";
      btn.classList.add('is-done');
      note.textContent = 'See you soon!';
    } catch (err) {
      sending = false;
      btn.textContent = "YES, I'LL BE THERE!";
      btn.disabled = false;
      error.textContent = "Couldn't send — please check your connection and try again.";
    }
  });
})();
