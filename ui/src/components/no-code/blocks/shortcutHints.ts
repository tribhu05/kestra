import {blockEditorKeymapByGroup, findBlockEditorBinding, type BlockEditorKeyBinding, type BlockEditorKeymapGroup} from "./keymap"

export interface FooterHint {
    id: string
    keys: string[]
    i18nKey: string
}

export function computeIsMac(nav: {platform?: string; userAgent?: string} = navigator): boolean {
    return /Mac|iPhone|iPod|iPad/i.test(nav.platform || nav.userAgent || "")
}

/**
 * `Meta` (Mac) and `Control` (Windows/Linux) are never two distinct bindings in this keymap —
 * the same shortcut written once per OS convention — so both resolve to the platform's own glyph
 * rather than always to `⌘`, which read wrong on Windows and Linux.
 */
export function buildKeyDisplay(isMac: boolean): Record<string, string> {
    const cmd = isMac ? "⌘" : "Ctrl+"
    const shift = isMac ? "⇧" : "Shift+"
    const alt = isMac ? "⌥" : "Alt+"
    return {
        ArrowUp: "↑",
        ArrowDown: "↓",
        ArrowLeft: "←",
        ArrowRight: "→",
        Enter: "↵",
        "Meta+Enter": `${cmd}↵`,
        "Control+Enter": `${cmd}↵`,
        " ": "Space",
        Backspace: "⌫",
        Delete: "⌦",
        "Meta+Shift+p": `${cmd}${shift}P`,
        "Control+Shift+p": `${cmd}${shift}P`,
        "Meta+s": `${cmd}S`,
        "Control+s": `${cmd}S`,
        "Meta+z": `${cmd}Z`,
        "Control+z": `${cmd}Z`,
        "Alt+ArrowUp": `${alt}↑`,
        "Alt+ArrowDown": `${alt}↓`,
    }
}

const KEY_DISPLAY = buildKeyDisplay(computeIsMac())

const SHORTCUT_GROUP_ORDER: BlockEditorKeymapGroup[] = ["navigate", "insert", "edit", "global"]

const HIDDEN_SHORTCUT_IDS = new Set(["clear"])

export function displayKeys(keys: string[]): string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const key of keys) {
        const display = KEY_DISPLAY[key] ?? key
        if (seen.has(display)) continue
        seen.add(display)
        result.push(display)
    }
    return result
}

export function buildShortcutGroups(): {group: BlockEditorKeymapGroup; bindings: BlockEditorKeyBinding[]}[] {
    return SHORTCUT_GROUP_ORDER.map(group => ({
        group,
        bindings: blockEditorKeymapByGroup(group).filter(binding => !HIDDEN_SHORTCUT_IDS.has(binding.id)),
    }))
}

function keysFor(id: string): string[] {
    return findBlockEditorBinding(id)?.keys ?? []
}

export function buildFooterHints(state: {overlayOpen: boolean; realBlockFocused: boolean}): FooterHint[] {
    if (state.overlayOpen) {
        return [
            {id: "move", keys: ["ArrowUp", "ArrowDown"], i18nKey: "block_editor.kbd_navigate"},
            {id: "run", keys: ["Enter"], i18nKey: "block_editor.kbd_add"},
            {id: "close", keys: ["Escape"], i18nKey: "block_editor.kbd_close"},
        ]
    }

    return [
        {id: "help", keys: keysFor("help"), i18nKey: "block_editor.shortcuts.toggle"},
        {id: "move", keys: keysFor("move"), i18nKey: "block_editor.shortcuts.move_between"},
        {id: "open", keys: keysFor("open"), i18nKey: "block_editor.shortcuts.open"},
        {id: "insert", keys: keysFor("insert-after"), i18nKey: "block_editor.shortcuts.add_after"},
        ...(state.realBlockFocused
            ? [
                {id: "insert-before", keys: keysFor("insert-before"), i18nKey: "block_editor.shortcuts.add_before"},
                {id: "reorder", keys: keysFor("reorder"), i18nKey: "block_editor.shortcuts.reorder"},
            ]
            : []),
        {id: "command-menu", keys: keysFor("command-menu"), i18nKey: "block_editor.shortcuts.command_palette"},
    ]
}
