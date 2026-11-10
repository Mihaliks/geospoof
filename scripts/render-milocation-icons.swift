// MiLocation's own artwork; no upstream trademark/logo assets in the app.
import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
func render(_ size: Int) -> Data {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    let scale = CGFloat(size) / 1024
    NSAffineTransform(transform: AffineTransform(scale: scale)).concat()
    let rect = NSRect(x: 40, y: 40, width: 944, height: 944)
    NSColor(srgbRed: 0.31, green: 0.20, blue: 0.72, alpha: 1).setFill()
    NSBezierPath(roundedRect: rect, xRadius: 210, yRadius: 210).fill()
    let pin = NSBezierPath()
    pin.move(to: NSPoint(x: 512, y: 150))
    pin.curve(to: NSPoint(x: 270, y: 598), controlPoint1: NSPoint(x: 460, y: 240), controlPoint2: NSPoint(x: 270, y: 426))
    pin.curve(to: NSPoint(x: 512, y: 850), controlPoint1: NSPoint(x: 270, y: 742), controlPoint2: NSPoint(x: 375, y: 850))
    pin.curve(to: NSPoint(x: 754, y: 598), controlPoint1: NSPoint(x: 649, y: 850), controlPoint2: NSPoint(x: 754, y: 742))
    pin.curve(to: NSPoint(x: 512, y: 150), controlPoint1: NSPoint(x: 754, y: 426), controlPoint2: NSPoint(x: 564, y: 240))
    pin.close()
    NSColor.white.setFill()
    pin.fill()
    NSColor(srgbRed: 0.31, green: 0.20, blue: 0.72, alpha: 1).setFill()
    NSBezierPath(ovalIn: NSRect(x: 412, y: 505, width: 200, height: 200)).fill()
    NSGraphicsContext.restoreGraphicsState()
    return bitmap.representation(using: .png, properties: [:])!
}
for size in [16, 32, 48, 64, 128, 256, 512, 1024] {
    try render(size).write(to: root.appendingPathComponent("icons/icon-\(size).png"))
}
let native = root.appendingPathComponent("macos/MiLocation/MiLocation")
for base in [16, 32, 128, 256, 512] {
    for density in [1, 2] {
        try render(base * density).write(to: native.appendingPathComponent("Assets.xcassets/AppIcon.appiconset/mac-icon-\(base)@\(density)x.png"))
    }
}
try render(256).write(to: native.appendingPathComponent("Resources/Icon.png"))
