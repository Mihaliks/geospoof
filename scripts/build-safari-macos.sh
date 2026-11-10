#!/bin/bash
# MiLocation: reproduce the local signed Safari build. No upstream CDN is used.
set -euo pipefail
cd "$(dirname "$0")/.."
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
npm run build:safari
node scripts/check-standalone.mjs
xcodebuild -project macos/MiLocation/MiLocation.xcodeproj -scheme MiLocation \
  -configuration Release -derivedDataPath build/macos -allowProvisioningUpdates build
codesign --verify --deep --strict build/macos/Build/Products/Release/MiLocation.app
echo "Готово: $PWD/build/macos/Build/Products/Release/MiLocation.app"

# Keep the installed copy canonical; do not leave the build directory registered as another extension.
pluginkit -r "$PWD/build/macos/Build/Products/Release/MiLocation.app/Contents/PlugIns/MiLocation Extension.appex" || true
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -u "$PWD/build/macos/Build/Products/Release/MiLocation.app"
