// Music Book Player - Import and Create AudioMotionAnalyzer
// Matthias Wolff

import AudioMotionAnalyzer from 'https://cdn.skypack.dev/audiomotion-analyzer?min';
     
// Create spectrum analyzer
new AudioMotionAnalyzer(
    document.getElementById('spectrum-analyzer'),
    {
      source: document.getElementById('audio-player'),
      showScaleX: false, showBgColor: false, overlay: true,
      minFreq: 10, maxFreq: 20000,
      mode: 10, lineWidth: 1, fillAlpha: 0.2,
      // reflexRatio: 0.3, reflexAlpha: 0.15, reflexBright: 1,
      // set your preferred options here
    }
  );

// EOF