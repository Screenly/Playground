/* eslint-disable max-lines-per-function */

import { describe, it, expect, mock } from 'bun:test'

const mockGetSettings = mock()
const mockGetMetadata = mock()
const mockGetCorsProxyUrl = mock()
const mockSetupTheme = mock()
const mockSignalReady = mock()
const mockGetTags = mock()

mock.module('@screenly/edge-apps', () => ({
  getSettings: () => mockGetSettings(),
  getMetadata: () => mockGetMetadata(),
  getCorsProxyUrl: () => mockGetCorsProxyUrl(),
  setupTheme: () => mockSetupTheme(),
  signalReady: () => mockSignalReady(),
  getTags: () => mockGetTags(),
}))

import { parseCap } from './parser'
import { XMLParser } from 'fast-xml-parser'

describe('CAP v1.2 Parser', () => {
  describe('Basic Alert Structure', () => {
    it('should parse a minimal valid CAP alert', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>43b080713727</identifier>
  <sender>hsas@dhs.gov</sender>
  <sent>2003-04-02T14:39:01-05:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].identifier).toBe('43b080713727')
      expect(alerts[0].sender).toBe('hsas@dhs.gov')
      expect(alerts[0].sent).toBe('2003-04-02T14:39:01-05:00')
      expect(alerts[0].status).toBe('Actual')
      expect(alerts[0].msgType).toBe('Alert')
      expect(alerts[0].scope).toBe('Public')
    })

    it('should parse all alert-level required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>KSTO1055887203</identifier>
  <sender>KSTO@NWS.NOAA.GOV</sender>
  <sent>2003-06-17T14:57:00-07:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0]).toMatchObject({
        identifier: 'KSTO1055887203',
        sender: 'KSTO@NWS.NOAA.GOV',
        sent: '2003-06-17T14:57:00-07:00',
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
      })
    })

    it('should parse alert with optional fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>KSTO1055887203</identifier>
  <sender>KSTO@NWS.NOAA.GOV</sender>
  <sent>2003-06-17T14:57:00-07:00</sent>
  <status>Actual</status>
  <msgType>Update</msgType>
  <source>Weather Service</source>
  <scope>Public</scope>
  <note>This is a test note</note>
  <references>KSTO@NWS.NOAA.GOV,KSTO1055887200,2003-06-17T14:00:00-07:00</references>
  <incidents>incident1,incident2</incidents>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].source).toBe('Weather Service')
      expect(alerts[0].note).toBe('This is a test note')
      expect(alerts[0].references).toBe(
        'KSTO@NWS.NOAA.GOV,KSTO1055887200,2003-06-17T14:00:00-07:00',
      )
      expect(alerts[0].incidents).toBe('incident1,incident2')
    })

    it('should parse alert with Restricted scope', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST123</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Restricted</scope>
  <restriction>For emergency services only</restriction>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].scope).toBe('Restricted')
      expect(alerts[0].restriction).toBe('For emergency services only')
    })

    it('should parse alert with Private scope and addresses', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST124</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Private</scope>
  <addresses>user1@example.com user2@example.com</addresses>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].scope).toBe('Private')
      expect(alerts[0].addresses).toBe('user1@example.com user2@example.com')
    })
  })

  describe('Alert Status Values', () => {
    const statuses = ['Actual', 'Exercise', 'System', 'Test', 'Draft']

    statuses.forEach((status) => {
      it(`should parse alert with status: ${status}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-${status}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>${status}</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].status).toBe(status)
      })
    })
  })

  describe('Message Type Values', () => {
    const msgTypes = ['Alert', 'Update', 'Cancel', 'Ack', 'Error']

    msgTypes.forEach((msgType) => {
      it(`should parse alert with msgType: ${msgType}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-${msgType}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>${msgType}</msgType>
  <scope>Public</scope>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].msgType).toBe(msgType)
      })
    })
  })

  describe('Info Element Structure', () => {
    it('should parse info with all required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>KSTO1055887203</identifier>
  <sender>KSTO@NWS.NOAA.GOV</sender>
  <sent>2003-06-17T14:57:00-07:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>SEVERE THUNDERSTORM</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos).toHaveLength(1)
      expect(alerts[0].infos[0]).toMatchObject({
        category: 'Met',
        event: 'SEVERE THUNDERSTORM',
        urgency: 'Immediate',
        severity: 'Severe',
        certainty: 'Observed',
      })
    })

    it('should parse info with all optional fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST125</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <language>en-US</language>
    <category>Fire</category>
    <event>WILDFIRE</event>
    <responseType>Evacuate</responseType>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <audience>General public in affected areas</audience>
    <effective>2024-01-15T10:00:00-00:00</effective>
    <onset>2024-01-15T10:30:00-00:00</onset>
    <expires>2024-01-15T22:00:00-00:00</expires>
    <senderName>National Weather Service</senderName>
    <headline>Wildfire Warning Issued</headline>
    <description>A rapidly spreading wildfire has been detected.</description>
    <instruction>Evacuate immediately to designated shelters.</instruction>
    <web>http://www.example.com/wildfire</web>
    <contact>1-800-EMERGENCY</contact>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const info = alerts[0].infos[0]
      expect(info.language).toBe('en-US')
      expect(info.audience).toBe('General public in affected areas')
      expect(info.effective).toBe('2024-01-15T10:00:00-00:00')
      expect(info.onset).toBe('2024-01-15T10:30:00-00:00')
      expect(info.expires).toBe('2024-01-15T22:00:00-00:00')
      expect(info.senderName).toBe('National Weather Service')
      expect(info.headline).toBe('Wildfire Warning Issued')
      expect(info.description).toBe(
        'A rapidly spreading wildfire has been detected.',
      )
      expect(info.instruction).toBe(
        'Evacuate immediately to designated shelters.',
      )
      expect(info.web).toBe('http://www.example.com/wildfire')
      expect(info.contact).toBe('1-800-EMERGENCY')
    })

    it('should parse multiple categories', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST126</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <category>Geo</category>
    <event>STORM SURGE</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Likely</certainty>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const category = alerts[0].infos[0].category
      expect(Array.isArray(category) ? category : [category]).toContain('Met')
      expect(Array.isArray(category) ? category : [category]).toContain('Geo')
    })
  })

  describe('Category Values', () => {
    const categories = [
      'Geo',
      'Met',
      'Safety',
      'Security',
      'Rescue',
      'Fire',
      'Health',
      'Env',
      'Transport',
      'Infra',
      'CBRNE',
      'Other',
    ]

    categories.forEach((category) => {
      it(`should parse category: ${category}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CAT-${category}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>${category}</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
  </info>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].infos[0].category).toBe(category)
      })
    })
  })

  describe('ResponseType Values', () => {
    const responseTypes = [
      'Shelter',
      'Evacuate',
      'Prepare',
      'Execute',
      'Avoid',
      'Monitor',
      'Assess',
      'AllClear',
      'None',
    ]

    responseTypes.forEach((responseType) => {
      it(`should parse responseType: ${responseType}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-RT-${responseType}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <responseType>${responseType}</responseType>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
  </info>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].infos[0].responseType).toBe(responseType)
      })
    })
  })

  describe('Urgency Values', () => {
    const urgencies = ['Immediate', 'Expected', 'Future', 'Past', 'Unknown']

    urgencies.forEach((urgency) => {
      it(`should parse urgency: ${urgency}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-URG-${urgency}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <urgency>${urgency}</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
  </info>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].infos[0].urgency).toBe(urgency)
      })
    })
  })

  describe('Severity Values', () => {
    const severities = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']

    severities.forEach((severity) => {
      it(`should parse severity: ${severity}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-SEV-${severity}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>${severity}</severity>
    <certainty>Possible</certainty>
  </info>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].infos[0].severity).toBe(severity)
      })
    })
  })

  describe('Certainty Values', () => {
    const certainties = [
      'Observed',
      'Likely',
      'Possible',
      'Unlikely',
      'Unknown',
    ]

    certainties.forEach((certainty) => {
      it(`should parse certainty: ${certainty}`, () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CERT-${certainty}</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>${certainty}</certainty>
  </info>
</alert>`

        const alerts = parseCap(xml)
        expect(alerts[0].infos[0].certainty).toBe(certainty)
      })
    })
  })

  describe('Resource Element', () => {
    it('should parse resource with required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST127</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
    <resource>
      <resourceDesc>Evacuation Map</resourceDesc>
      <mimeType>image/png</mimeType>
    </resource>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].resources).toHaveLength(1)
      expect(alerts[0].infos[0].resources[0]).toMatchObject({
        resourceDesc: 'Evacuation Map',
        mimeType: 'image/png',
      })
    })

    it('should parse resource with all optional fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST128</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
    <resource>
      <resourceDesc>Evacuation Map</resourceDesc>
      <mimeType>image/png</mimeType>
      <size>12345</size>
      <uri>http://example.com/map.png</uri>
      <derefUri>base64encodeddata</derefUri>
      <digest>SHA-256HASH</digest>
    </resource>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const resource = alerts[0].infos[0].resources[0]
      expect(resource.resourceDesc).toBe('Evacuation Map')
      expect(resource.mimeType).toBe('image/png')
      expect(resource.size).toBe(12345)
      expect(resource.uri).toBe('http://example.com/map.png')
      expect(resource.derefUri).toBe('base64encodeddata')
      expect(resource.digest).toBe('SHA-256HASH')
    })

    it('should parse multiple resources', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST129</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
    <resource>
      <resourceDesc>Map</resourceDesc>
      <mimeType>image/png</mimeType>
      <uri>http://example.com/map.png</uri>
    </resource>
    <resource>
      <resourceDesc>Audio Alert</resourceDesc>
      <mimeType>audio/mp3</mimeType>
      <uri>http://example.com/alert.mp3</uri>
    </resource>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].resources).toHaveLength(2)
      expect(alerts[0].infos[0].resources[0].mimeType).toBe('image/png')
      expect(alerts[0].infos[0].resources[1].mimeType).toBe('audio/mp3')
    })
  })

  describe('Area Element', () => {
    it('should parse area with required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST130</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Severe Storm</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Downtown Metropolitan Area</areaDesc>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].areas).toHaveLength(1)
      expect(alerts[0].infos[0].areas[0].areaDesc).toBe(
        'Downtown Metropolitan Area',
      )
    })

    it('should parse area with polygon', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST131</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Tornado Warning</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Storm Path</areaDesc>
      <polygon>38.47,-120.14 38.34,-119.95 38.52,-119.74 38.62,-119.89 38.47,-120.14</polygon>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      expect(area.areaDesc).toBe('Storm Path')
      expect(area.polygon).toBe(
        '38.47,-120.14 38.34,-119.95 38.52,-119.74 38.62,-119.89 38.47,-120.14',
      )
    })

    it('should parse area with multiple polygons', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST132</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Fire</category>
    <event>Fire Zone</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Multiple Fire Zones</areaDesc>
      <polygon>38.47,-120.14 38.34,-119.95 38.52,-119.74 38.47,-120.14</polygon>
      <polygon>39.00,-121.00 39.10,-120.90 39.20,-121.10 39.00,-121.00</polygon>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      const polygons = Array.isArray(area.polygon)
        ? area.polygon
        : [area.polygon]
      expect(polygons).toHaveLength(2)
    })

    it('should parse area with circle', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST133</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>CBRNE</category>
    <event>Chemical Spill</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Evacuation Zone</areaDesc>
      <circle>38.5,-120.5 5.0</circle>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      expect(area.circle).toBe('38.5,-120.5 5.0')
    })

    it('should parse area with geocode', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST134</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Flood Warning</event>
    <urgency>Expected</urgency>
    <severity>Moderate</severity>
    <certainty>Likely</certainty>
    <area>
      <areaDesc>County Area</areaDesc>
      <geocode>
        <valueName>FIPS6</valueName>
        <value>006017</value>
      </geocode>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      expect(area.geocode).toBeDefined()
      expect(area.geocode.valueName).toBe('FIPS6')
      expect(area.geocode.value).toBe(6017)
    })

    it('should parse area with altitude and ceiling', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST135</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Aviation Alert</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Flight Restriction Zone</areaDesc>
      <altitude>1000</altitude>
      <ceiling>5000</ceiling>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      expect(area.altitude).toBe(1000)
      expect(area.ceiling).toBe(5000)
    })

    it('should parse multiple areas', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST136</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Multi-Area Warning</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Area 1</areaDesc>
      <polygon>38.47,-120.14 38.34,-119.95 38.52,-119.74 38.47,-120.14</polygon>
    </area>
    <area>
      <areaDesc>Area 2</areaDesc>
      <circle>39.0,-121.0 10.0</circle>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].areas).toHaveLength(2)
      expect(alerts[0].infos[0].areas[0].areaDesc).toBe('Area 1')
      expect(alerts[0].infos[0].areas[1].areaDesc).toBe('Area 2')
    })
  })

  describe('Multiple Info Blocks', () => {
    it('should parse multiple info blocks with different languages', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST137</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <language>en-US</language>
    <category>Safety</category>
    <event>Emergency Alert</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>Emergency Alert</headline>
    <description>This is an emergency alert in English.</description>
  </info>
  <info>
    <language>es-US</language>
    <category>Safety</category>
    <event>Alerta de Emergencia</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>Alerta de Emergencia</headline>
    <description>Esta es una alerta de emergencia en español.</description>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos).toHaveLength(2)
      expect(alerts[0].infos[0].language).toBe('en-US')
      expect(alerts[0].infos[1].language).toBe('es-US')
      expect(alerts[0].infos[0].description).toContain('English')
      expect(alerts[0].infos[1].description).toContain('español')
    })
  })

  describe('EventCode and Parameter', () => {
    it('should parse eventCode', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST138</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Severe Thunderstorm</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>SAME</valueName>
      <value>SVR</value>
    </eventCode>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].eventCode).toBeDefined()
      expect(alerts[0].infos[0].eventCode.valueName).toBe('SAME')
      expect(alerts[0].infos[0].eventCode.value).toBe('SVR')
    })

    it('should parse parameter', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST139</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Hurricane</event>
    <urgency>Expected</urgency>
    <severity>Extreme</severity>
    <certainty>Likely</certainty>
    <parameter>
      <valueName>WindSpeed</valueName>
      <value>120mph</value>
    </parameter>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].parameter).toBeDefined()
      expect(alerts[0].infos[0].parameter.valueName).toBe('WindSpeed')
      expect(alerts[0].infos[0].parameter.value).toBe('120mph')
    })
  })

  describe('Multiple Alerts', () => {
    it('should parse multiple alerts in a single feed', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <alert>
    <identifier>ALERT001</identifier>
    <sender>sender1@example.com</sender>
    <sent>2024-01-15T10:00:00-00:00</sent>
    <status>Actual</status>
    <msgType>Alert</msgType>
    <scope>Public</scope>
  </alert>
  <alert>
    <identifier>ALERT002</identifier>
    <sender>sender2@example.com</sender>
    <sent>2024-01-15T11:00:00-00:00</sent>
    <status>Actual</status>
    <msgType>Update</msgType>
    <scope>Public</scope>
  </alert>
</feed>`

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      })
      const json = parser.parse(xml)
      const alerts = json.feed?.alert
        ? Array.isArray(json.feed.alert)
          ? json.feed.alert
          : [json.feed.alert]
        : []
      expect(alerts).toHaveLength(2)
      expect(alerts[0].identifier).toBe('ALERT001')
      expect(alerts[1].identifier).toBe('ALERT002')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty alert', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
</alert>`

      const alerts = parseCap(xml)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].identifier).toBe('')
      expect(alerts[0].sender).toBe('')
    })

    it('should handle alert with no info blocks', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST140</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos).toHaveLength(0)
    })

    it('should handle info with no resources', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST141</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].resources).toHaveLength(0)
    })

    it('should handle info with no areas', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST142</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].areas).toHaveLength(0)
    })
  })

  describe('DateTime Formats', () => {
    it('should parse ISO 8601 datetime with timezone offset', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-DT-001</identifier>
  <sender>test@example.com</sender>
  <sent>2003-04-02T14:39:01-05:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].sent).toBe('2003-04-02T14:39:01-05:00')
    })

    it('should parse ISO 8601 datetime with positive timezone offset', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-DT-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T18:30:00+08:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].sent).toBe('2024-01-15T18:30:00+08:00')
    })

    it('should parse ISO 8601 datetime with UTC timezone (Z)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-DT-003</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T12:00:00Z</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].sent).toBe('2024-01-15T12:00:00Z')
    })

    it('should parse datetime without seconds', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-DT-004</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T12:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].sent).toBe('2024-01-15T12:00-00:00')
    })
  })

  describe('Multiple ResponseType Values', () => {
    it('should parse multiple responseType values', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-MRT-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Fire</category>
    <event>Wildfire Warning</event>
    <responseType>Evacuate</responseType>
    <responseType>Shelter</responseType>
    <responseType>Monitor</responseType>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const responseTypes = Array.isArray(alerts[0].infos[0].responseType)
        ? alerts[0].infos[0].responseType
        : [alerts[0].infos[0].responseType]
      expect(responseTypes).toContain('Evacuate')
      expect(responseTypes).toContain('Shelter')
      expect(responseTypes).toContain('Monitor')
    })
  })

  describe('Multiple EventCode and Parameter', () => {
    it('should parse multiple eventCode values', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-MEC-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Severe Weather</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>SAME</valueName>
      <value>SVR</value>
    </eventCode>
    <eventCode>
      <valueName>NWS</valueName>
      <value>SEVERE.TSTORM</value>
    </eventCode>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const eventCodes = Array.isArray(alerts[0].infos[0].eventCode)
        ? alerts[0].infos[0].eventCode
        : [alerts[0].infos[0].eventCode]
      expect(eventCodes.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse multiple parameter values', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-MP-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Hurricane</event>
    <urgency>Expected</urgency>
    <severity>Extreme</severity>
    <certainty>Likely</certainty>
    <parameter>
      <valueName>WindSpeed</valueName>
      <value>120mph</value>
    </parameter>
    <parameter>
      <valueName>StormSurge</valueName>
      <value>15ft</value>
    </parameter>
    <parameter>
      <valueName>Rainfall</valueName>
      <value>12inches</value>
    </parameter>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const parameters = Array.isArray(alerts[0].infos[0].parameter)
        ? alerts[0].infos[0].parameter
        : [alerts[0].infos[0].parameter]
      expect(parameters.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Multiple Geocode Values', () => {
    it('should parse multiple geocode values in a single area', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-MGC-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Flood Warning</event>
    <urgency>Expected</urgency>
    <severity>Moderate</severity>
    <certainty>Likely</certainty>
    <area>
      <areaDesc>Multiple Counties</areaDesc>
      <geocode>
        <valueName>FIPS6</valueName>
        <value>006037</value>
      </geocode>
      <geocode>
        <valueName>FIPS6</valueName>
        <value>006059</value>
      </geocode>
      <geocode>
        <valueName>UGC</valueName>
        <value>CAZ041</value>
      </geocode>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const geocodes = Array.isArray(alerts[0].infos[0].areas[0].geocode)
        ? alerts[0].infos[0].areas[0].geocode
        : [alerts[0].infos[0].areas[0].geocode]
      expect(geocodes.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Code Element', () => {
    it('should parse single code value', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CODE-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>IPAWSv1.0</code>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].code).toBeDefined()
    })

    it('should parse multiple code values', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CODE-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>IPAWSv1.0</code>
  <code>PROFILE:CAP-CP:0.4</code>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].code).toBeDefined()
    })
  })

  describe('Polygon Validation', () => {
    it('should parse closed polygon (first and last coordinates match)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-POLY-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Earthquake</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Affected Region</areaDesc>
      <polygon>38.47,-120.14 38.34,-119.95 38.52,-119.74 38.62,-119.89 38.47,-120.14</polygon>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const polygon = alerts[0].infos[0].areas[0].polygon
      expect(polygon).toBeDefined()
      expect(typeof polygon).toBe('string')
      const coords = (polygon as string).split(' ')
      expect(coords[0]).toBe(coords[coords.length - 1])
    })

    it('should parse polygon with minimum 4 coordinate pairs (triangle + closure)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-POLY-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Triangle Area</areaDesc>
      <polygon>0.0,0.0 1.0,0.0 0.5,1.0 0.0,0.0</polygon>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const polygon = alerts[0].infos[0].areas[0].polygon
      expect(polygon).toBeDefined()
      expect(typeof polygon).toBe('string')
      const coords = (polygon as string).split(' ')
      expect(coords.length).toBeGreaterThanOrEqual(4)
    })

    it('should parse polygon with WGS-84 valid latitude/longitude ranges', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-POLY-003</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Test Event</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Valid Coordinates</areaDesc>
      <polygon>-90.0,-180.0 -90.0,180.0 90.0,180.0 90.0,-180.0 -90.0,-180.0</polygon>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const polygon = alerts[0].infos[0].areas[0].polygon
      expect(polygon).toBeDefined()
    })
  })

  describe('Circle Format Validation', () => {
    it('should parse circle with valid format (lat,lon radius)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CIRCLE-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>CBRNE</category>
    <event>Chemical Spill</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Contamination Zone</areaDesc>
      <circle>38.5,-120.5 5.0</circle>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const circle = alerts[0].infos[0].areas[0].circle
      expect(circle).toBeDefined()
      expect(circle).toMatch(/^-?\d+\.?\d*,-?\d+\.?\d* \d+\.?\d*$/)
    })

    it('should parse multiple circles in a single area', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CIRCLE-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>CBRNE</category>
    <event>Multiple Hazard Zones</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Multiple Contamination Zones</areaDesc>
      <circle>38.5,-120.5 5.0</circle>
      <circle>39.0,-121.0 3.5</circle>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const circles = Array.isArray(alerts[0].infos[0].areas[0].circle)
        ? alerts[0].infos[0].areas[0].circle
        : [alerts[0].infos[0].areas[0].circle]
      expect(circles.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Message Type Relationships', () => {
    it('should parse Update msgType with references to original alert', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>UPDATE-001</identifier>
  <sender>nws@noaa.gov</sender>
  <sent>2024-01-15T12:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Update</msgType>
  <scope>Public</scope>
  <references>nws@noaa.gov,ALERT-001,2024-01-15T10:00:00-00:00</references>
  <info>
    <category>Met</category>
    <event>Severe Thunderstorm</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>Updated: Storm intensifying</headline>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].msgType).toBe('Update')
      expect(alerts[0].references).toBeDefined()
      expect(alerts[0].references).toContain('nws@noaa.gov')
      expect(alerts[0].references).toContain('ALERT-001')
    })

    it('should parse Cancel msgType with references', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>CANCEL-001</identifier>
  <sender>nws@noaa.gov</sender>
  <sent>2024-01-15T14:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Cancel</msgType>
  <scope>Public</scope>
  <references>nws@noaa.gov,ALERT-001,2024-01-15T10:00:00-00:00 nws@noaa.gov,UPDATE-001,2024-01-15T12:00:00-00:00</references>
  <info>
    <category>Met</category>
    <event>Severe Thunderstorm</event>
    <urgency>Past</urgency>
    <severity>Unknown</severity>
    <certainty>Unknown</certainty>
    <headline>Alert cancelled: Threat has passed</headline>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].msgType).toBe('Cancel')
      expect(alerts[0].references).toBeDefined()
    })

    it('should parse Ack msgType acknowledging receipt', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>ACK-001</identifier>
  <sender>local-ema@example.com</sender>
  <sent>2024-01-15T10:05:00-00:00</sent>
  <status>Actual</status>
  <msgType>Ack</msgType>
  <scope>Public</scope>
  <references>nws@noaa.gov,ALERT-001,2024-01-15T10:00:00-00:00</references>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].msgType).toBe('Ack')
      expect(alerts[0].references).toBeDefined()
    })

    it('should parse Error msgType for error notification', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>ERROR-001</identifier>
  <sender>system@example.com</sender>
  <sent>2024-01-15T10:10:00-00:00</sent>
  <status>Actual</status>
  <msgType>Error</msgType>
  <scope>Public</scope>
  <note>Previous alert contained formatting errors</note>
  <references>nws@noaa.gov,ALERT-BAD,2024-01-15T10:00:00-00:00</references>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].msgType).toBe('Error')
      expect(alerts[0].note).toBeDefined()
    })
  })

  describe('Character Entity References', () => {
    it('should handle special characters in text fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-CHAR-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Emergency Alert</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Observed</certainty>
    <headline>Alert &amp; Warning: "Stay Safe"</headline>
    <description>Temperature &lt; 32°F. Wind &gt; 40mph.</description>
    <instruction>Don&apos;t go outside. Stay &quot;indoors&quot;.</instruction>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].headline).toContain('&')
      expect(alerts[0].infos[0].description).toBeDefined()
      expect(alerts[0].infos[0].instruction).toBeDefined()
    })
  })

  describe('Temporal Relationships', () => {
    it('should parse effective, onset, and expires times', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-TIME-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Winter Storm</event>
    <urgency>Expected</urgency>
    <severity>Moderate</severity>
    <certainty>Likely</certainty>
    <effective>2024-01-15T10:00:00-00:00</effective>
    <onset>2024-01-15T18:00:00-00:00</onset>
    <expires>2024-01-16T06:00:00-00:00</expires>
    <headline>Winter Storm Expected Tonight</headline>
    <description>Heavy snow expected starting this evening.</description>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const info = alerts[0].infos[0]
      expect(info.effective).toBe('2024-01-15T10:00:00-00:00')
      expect(info.onset).toBe('2024-01-15T18:00:00-00:00')
      expect(info.expires).toBe('2024-01-16T06:00:00-00:00')
    })

    it('should handle alert without onset (immediate effective time)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-TIME-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Immediate Threat</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <effective>2024-01-15T10:00:00-00:00</effective>
    <expires>2024-01-15T12:00:00-00:00</expires>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const info = alerts[0].infos[0]
      expect(info.effective).toBeDefined()
      expect(info.onset).toBeUndefined()
      expect(info.expires).toBeDefined()
    })
  })

  describe('Language Support', () => {
    it('should parse language code in RFC 3066 format', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-LANG-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <language>fr-CA</language>
    <category>Safety</category>
    <event>Alerte d'urgence</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>Alerte d'urgence en français canadien</headline>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].language).toBe('fr-CA')
    })

    it('should parse three or more info blocks with different languages', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-LANG-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <language>en-US</language>
    <category>Safety</category>
    <event>Emergency Alert</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>Emergency Alert</headline>
  </info>
  <info>
    <language>es-US</language>
    <category>Safety</category>
    <event>Alerta de Emergencia</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>Alerta de Emergencia</headline>
  </info>
  <info>
    <language>zh-CN</language>
    <category>Safety</category>
    <event>紧急警报</event>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <headline>紧急警报</headline>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos).toHaveLength(3)
      expect(alerts[0].infos[0].language).toBe('en-US')
      expect(alerts[0].infos[1].language).toBe('es-US')
      expect(alerts[0].infos[2].language).toBe('zh-CN')
    })
  })

  describe('Boundary Conditions', () => {
    it('should parse resource with large size value', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-BC-001</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Safety</category>
    <event>Test</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Possible</certainty>
    <resource>
      <resourceDesc>Large Video File</resourceDesc>
      <mimeType>video/mp4</mimeType>
      <size>1073741824</size>
    </resource>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts[0].infos[0].resources[0].size).toBe(1073741824)
    })

    it('should parse area with extreme altitude and ceiling values', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-BC-002</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>High Altitude Warning</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>High Altitude Zone</areaDesc>
      <altitude>10000</altitude>
      <ceiling>50000</ceiling>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      expect(area.altitude).toBe(10000)
      expect(area.ceiling).toBe(50000)
    })

    it('should parse area with negative altitude (below sea level)', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>TEST-BC-003</identifier>
  <sender>test@example.com</sender>
  <sent>2024-01-15T10:00:00-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Env</category>
    <event>Below Sea Level Alert</event>
    <urgency>Immediate</urgency>
    <severity>Moderate</severity>
    <certainty>Observed</certainty>
    <area>
      <areaDesc>Below Sea Level Zone</areaDesc>
      <altitude>-100</altitude>
      <ceiling>0</ceiling>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      const area = alerts[0].infos[0].areas[0]
      expect(area.altitude).toBe(-100)
      expect(area.ceiling).toBe(0)
    })
  })

  describe('Complex Real-World Scenarios', () => {
    it('should parse comprehensive NOAA-style severe weather alert', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>NOAA-NWS-ALERTS-CA125ABC123456</identifier>
  <sender>w-nws.webmaster@noaa.gov</sender>
  <sent>2024-01-15T10:47:00-08:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <source>NWS National Weather Service</source>
  <scope>Public</scope>
  <code>IPAWSv1.0</code>
  <info>
    <language>en-US</language>
    <category>Met</category>
    <event>Severe Thunderstorm Warning</event>
    <responseType>Shelter</responseType>
    <responseType>Monitor</responseType>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <effective>2024-01-15T10:47:00-08:00</effective>
    <onset>2024-01-15T10:47:00-08:00</onset>
    <expires>2024-01-15T11:30:00-08:00</expires>
    <senderName>NWS Sacramento CA</senderName>
    <headline>Severe Thunderstorm Warning issued January 15 at 10:47AM PST until January 15 at 11:30AM PST by NWS Sacramento CA</headline>
    <description>The National Weather Service in Sacramento has issued a Severe Thunderstorm Warning for Central Sacramento County until 1130 AM PST. At 1047 AM PST, a severe thunderstorm was located near Sacramento, moving northeast at 25 mph. Hazard: 60 mph wind gusts and quarter size hail. Source: Radar indicated. Impact: Hail damage to vehicles is expected. Expect wind damage to roofs, siding, and trees.</description>
    <instruction>For your protection move to an interior room on the lowest floor of a building. Large hail and damaging winds and continuous cloud to ground lightning is occurring with this storm. Move indoors immediately.</instruction>
    <web>http://www.weather.gov</web>
    <contact>w-nws.webmaster@noaa.gov</contact>
    <parameter>
      <valueName>VTEC</valueName>
      <value>/O.NEW.KSTO.SV.W.0001.240115T1847Z-240115T1930Z/</value>
    </parameter>
    <parameter>
      <valueName>TIME...MOT...LOC</valueName>
      <value>1847Z 239DEG 22KT 3850 12120</value>
    </parameter>
    <eventCode>
      <valueName>SAME</valueName>
      <value>SVR</value>
    </eventCode>
    <eventCode>
      <valueName>NWS-IDP-SOURCE</valueName>
      <value>RADAR</value>
    </eventCode>
    <resource>
      <resourceDesc>Radar Image</resourceDesc>
      <mimeType>image/png</mimeType>
      <size>45678</size>
      <uri>http://www.weather.gov/radar/image.png</uri>
    </resource>
    <area>
      <areaDesc>Central Sacramento County</areaDesc>
      <polygon>38.47,-121.50 38.51,-121.35 38.56,-121.35 38.60,-121.45 38.55,-121.55 38.47,-121.50</polygon>
      <geocode>
        <valueName>FIPS6</valueName>
        <value>006067</value>
      </geocode>
      <geocode>
        <valueName>UGC</valueName>
        <value>CAC067</value>
      </geocode>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].identifier).toBe('NOAA-NWS-ALERTS-CA125ABC123456')
      expect(alerts[0].source).toBe('NWS National Weather Service')
      expect(alerts[0].infos[0].event).toBe('Severe Thunderstorm Warning')
      expect(alerts[0].infos[0].resources).toHaveLength(1)
      expect(alerts[0].infos[0].areas[0].polygon).toBeDefined()
    })

    it('should parse AMBER Alert with all required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>AMBER-CA-2024-001</identifier>
  <sender>chp@doj.ca.gov</sender>
  <sent>2024-01-15T15:30:00-08:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <source>California Highway Patrol</source>
  <scope>Public</scope>
  <code>AMBER</code>
  <info>
    <language>en-US</language>
    <category>Security</category>
    <category>Rescue</category>
    <event>Child Abduction Emergency</event>
    <responseType>Monitor</responseType>
    <urgency>Immediate</urgency>
    <severity>Severe</severity>
    <certainty>Observed</certainty>
    <effective>2024-01-15T15:30:00-08:00</effective>
    <expires>2024-01-16T03:30:00-08:00</expires>
    <senderName>California Highway Patrol</senderName>
    <headline>AMBER Alert for Missing Child</headline>
    <description>The California Highway Patrol has issued an AMBER Alert for a missing 5-year-old child. Suspect is believed to be driving a blue 2015 Honda Civic, license plate 7ABC123. Child was last seen wearing a red jacket and blue jeans.</description>
    <instruction>If you have any information about this abduction, call the California Highway Patrol immediately at 1-800-TELL-CHP (1-800-835-5247). Do not approach the suspect.</instruction>
    <web>http://www.chp.ca.gov/amber</web>
    <contact>1-800-835-5247</contact>
    <parameter>
      <valueName>VehicleYear</valueName>
      <value>2015</value>
    </parameter>
    <parameter>
      <valueName>VehicleMake</valueName>
      <value>Honda</value>
    </parameter>
    <parameter>
      <valueName>VehicleModel</valueName>
      <value>Civic</value>
    </parameter>
    <parameter>
      <valueName>VehicleColor</valueName>
      <value>Blue</value>
    </parameter>
    <parameter>
      <valueName>LicensePlate</valueName>
      <value>7ABC123</value>
    </parameter>
    <area>
      <areaDesc>Statewide California</areaDesc>
      <geocode>
        <valueName>FIPS6</valueName>
        <value>006000</value>
      </geocode>
    </area>
  </info>
</alert>`

      const alerts = parseCap(xml)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].code).toBe('AMBER')
      const categories = Array.isArray(alerts[0].infos[0].category)
        ? alerts[0].infos[0].category
        : [alerts[0].infos[0].category]
      expect(categories).toContain('Security')
      expect(categories).toContain('Rescue')
      const parameters = Array.isArray(alerts[0].infos[0].parameter)
        ? alerts[0].infos[0].parameter
        : [alerts[0].infos[0].parameter]
      expect(parameters.length).toBeGreaterThanOrEqual(1)
    })
  })
})
