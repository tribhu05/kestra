import {describe, it, expect} from "vitest"

import {buildKeyDisplay, computeIsMac} from "../../../../../src/components/no-code/blocks/shortcutHints"

describe("computeIsMac", () => {
    it("identifies macOS from the platform string", () => {
        expect(computeIsMac({platform: "MacIntel", userAgent: ""})).toBe(true)
    })

    it("identifies iOS devices from the platform string", () => {
        expect(computeIsMac({platform: "iPhone", userAgent: ""})).toBe(true)
    })

    it("falls back to the user agent when platform is empty", () => {
        expect(computeIsMac({platform: "", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})).toBe(true)
    })

    it("does not identify Windows as macOS", () => {
        expect(computeIsMac({platform: "Win32", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})).toBe(false)
    })

    it("does not identify Linux as macOS", () => {
        expect(computeIsMac({platform: "Linux x86_64", userAgent: "Mozilla/5.0 (X11; Linux x86_64)"})).toBe(false)
    })
})

describe("buildKeyDisplay", () => {
    it("renders modifiers as Mac glyphs when isMac is true", () => {
        // Given
        const display = buildKeyDisplay(true)

        // Then
        expect(display["Meta+Shift+p"]).toBe("⌘⇧P")
        expect(display["Control+Shift+p"]).toBe("⌘⇧P")
        expect(display["Control+z"]).toBe("⌘Z")
        expect(display["Alt+ArrowUp"]).toBe("⌥↑")
    })

    it("renders modifiers as Windows/Linux labels when isMac is false", () => {
        // Given — regression: KEY_DISPLAY used to render every Control+ binding as a Mac
        // glyph regardless of platform
        const display = buildKeyDisplay(false)

        // Then
        expect(display["Meta+Shift+p"]).toBe("Ctrl+Shift+P")
        expect(display["Control+Shift+p"]).toBe("Ctrl+Shift+P")
        expect(display["Control+z"]).toBe("Ctrl+Z")
        expect(display["Alt+ArrowUp"]).toBe("Alt+↑")
    })
})
