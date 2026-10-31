import {Config} from '@remotion/cli/config';

// Use the pre-installed headless Chromium (no download needed).
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
Config.setVideoImageFormat('jpeg');
