// MiLocation fork: settings live in browser.storage.local, with no proprietary native bridge.
import SafariServices

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: ["pending": NSNull(), "success": true]]
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
