// eslint-disable-line no-console

// window.__DEV_MODE__ = true // disable catching exceptions

import '../src/polyfill'

// tests
import './polyfill.spec'

import './RollingAttributesHelper.spec'
import './ddManager.spec'
import './ConsentManager.spec'
import './DDHelper.spec'
import './DDStorage.spec'
import './EventManager.spec'
import './EventDataEnricher.spec'
import './DigitalDataEnricher.spec'
import './EventValidator.spec'
import './IntegrationBase.spec'

// enrichments & events
import './enrichments/CustomEnrichments.spec'
import './events/CustomEvents.spec'
import './scripts/CustomScripts.spec'

// trackers
import './trackers/trackLink.spec'

// integration utils
import './integrations/utils/transliterate.spec'

// integrations
import './integrations/DDManagerStreaming.spec'
import './integrations/GoogleAnalytics.spec'
import './integrations/GoogleTagManager.spec'
import './integrations/GoogleAdWords.spec'
import './integrations/Driveback.spec'
import './integrations/RetailRocket.spec'
import './integrations/FacebookPixel.spec'
import './integrations/SegmentStream.spec'
import './integrations/SendPulse.spec'
import './integrations/OWOXBIStreaming.spec'
import './integrations/Criteo.spec'
import './integrations/AdvCake/AdvCake.spec'
import './integrations/MyTarget.spec'
import './integrations/YandexMetrica.spec'
import './integrations/Vkontakte/Vkontakte.spec'
import './integrations/Emarsys.spec'
import './integrations/OneSignal.spec'
import './integrations/Sociomantic.spec'
import './integrations/Mindbox/Mindbox.spec'
import './integrations/DoubleClickFloodlight.spec'
import './integrations/RTBHouse.spec'
import './integrations/Soloway.spec'
import './integrations/GdeSlon.spec'
import './integrations/Flocktory.spec'
import './integrations/K50.spec'
import './integrations/Target2Sell.spec'
import './integrations/Calltouch.spec'
import './integrations/DynamicYield.spec'

window.localStorage.clear()
console.error = () => {}
console.warn = () => {}
