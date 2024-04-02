      // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      
      var player;
      function onYouTubeIframeAPIReady() {
          
      player = new YT.Player('main-container-1x', {
          height: '100%',
          width: '100%',
          videoId: 'UA-md1VxaRc',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          },
          
       playerVars: {
       //  'playsinline': 1
       'origin': 'https://aideatext.github.io' 
       }
    });
    }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = true;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          setTimeout(stopVideo, 6000);
          done = false;
        }
      }
      function stopVideo() {
        player.stopVideo();
      }
