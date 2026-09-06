/**
 * Installs happy-dom globals (window, document, localStorage, ...) before any
 * test or the rest of the preload chain imports React DOM.
 *
 * Kept in its own preload file so that the registration runs before the
 * hoisted imports of ./setup.ts are evaluated.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator"

GlobalRegistrator.register()
