const fs          = require('fs');
const https       = require('https');
const path        = require('path');
const decompress  = require('decompress');

/**
 * Downloads a file to the target location
 *
 * @param {string} url
 * @param {string} dest
 * @param {function} cb
 */
function download(url, dest, cb) {
  if (fs.existsSync(dest)) {
    return cb(); // Don't download a second time
  }

  var file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      cb();
    });
  }).on('error', (err) => {
    fs.unlinkSync(dest);
    if (cb) cb(err.message);
  });
};

function panic(err) {
  console.error(err);
  process.exit(1);
}

function log(msg) {
  console.log('--------> ' + msg);
}

(function iosDependencies() {
  //
  // Downloads the SDK into src/ios/lib
  //
  const SDK_URL = 'https://media.twiliocdn.com/sdk/ios/voice/releases/3.1.0/twilio-voice-ios-3.1.0.tar.bz2'
  const LOCAL_FILE_NAME = 'twilio-voice-ios.tar.bz2';
  const LOCAL_LIB_FOLDER = path.join(__dirname, '../src/ios/lib');
  const LOCAL_ZIP_FILE = path.join(LOCAL_LIB_FOLDER, LOCAL_FILE_NAME);

  log('Downloading ' + SDK_URL);
  download(SDK_URL, LOCAL_ZIP_FILE, (err) => {
    if (err) {
      log(`Failure: could not download ${SDK_URL}`);
      panic(err);
    }

    log('Unzipping ' + LOCAL_ZIP_FILE);
    decompress(LOCAL_ZIP_FILE, LOCAL_LIB_FOLDER).then(() => log('Done')).catch(panic);
  });
})();

