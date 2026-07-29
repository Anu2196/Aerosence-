/**
 * AREOSENCE ESP32 Hardware Circuit Vector Schematic Generator
 * Renders an interactive graphical vector diagram of all components & pin connections.
 */
class CircuitSchematic {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  }

  render() {
    const svg = `
      <svg id="circuitSvg" viewBox="0 0 1050 620" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Glow Filter Effects -->
          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowYellow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <!-- Wire Gradients -->
          <linearGradient id="wireGradVCC" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#f87171" />
          </linearGradient>
          <linearGradient id="wireGradGND" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#60a5fa" />
          </linearGradient>
          <linearGradient id="wireGradSDA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#a855f7" />
          </linearGradient>
          <linearGradient id="wireGradSCL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
        </defs>

        <!-- Subtle Grid Pattern Background -->
        <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
          <line x1="0" y1="50" x2="1050" y2="50" />
          <line x1="0" y1="100" x2="1050" y2="100" />
          <line x1="0" y1="150" x2="1050" y2="150" />
          <line x1="0" y1="200" x2="1050" y2="200" />
          <line x1="0" y1="250" x2="1050" y2="250" />
          <line x1="0" y1="300" x2="1050" y2="300" />
          <line x1="0" y1="350" x2="1050" y2="350" />
          <line x1="0" y1="400" x2="1050" y2="400" />
          <line x1="0" y1="450" x2="1050" y2="450" />
          <line x1="0" y1="500" x2="1050" y2="500" />
          <line x1="0" y1="550" x2="1050" y2="550" />

          <line x1="150" y1="0" x2="150" y2="620" />
          <line x1="300" y1="0" x2="300" y2="620" />
          <line x1="450" y1="0" x2="450" y2="620" />
          <line x1="600" y1="0" x2="600" y2="620" />
          <line x1="750" y1="0" x2="750" y2="620" />
          <line x1="900" y1="0" x2="900" y2="620" />
        </g>

        <!-- ===================================================================
             BREADBOARD POWER BUS RAILS (BOTTOM)
             =================================================================== -->
        <g id="breadboardPowerBus" transform="translate(60, 550)">
          <!-- Base Breadboard Strip -->
          <rect x="0" y="0" width="930" height="40" rx="6" fill="#0f172a" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
          
          <!-- Red 5V Power Rail -->
          <line x1="20" y1="12" x2="910" y2="12" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
          <text x="5" y="15" font-family="Fira Code" font-size="10" font-weight="bold" fill="#ef4444">+</text>

          <!-- Black GND Ground Rail -->
          <line x1="20" y1="28" x2="910" y2="28" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 3" />
          <text x="5" y="31" font-family="Fira Code" font-size="10" font-weight="bold" fill="#3b82f6">-</text>

          <text x="465" y="-6" font-family="Outfit" font-size="11" fill="#64748b" text-anchor="middle">Breadboard Common Power Bus (5V Rail &amp; GND Rail)</text>
        </g>

        <!-- ===================================================================
             WIRING TRACES & SIGNAL LINES
             =================================================================== -->

        <!-- 1. Power Supply Connections to Rails -->
        <path d="M 450 330 L 450 562" fill="none" stroke="url(#wireGradVCC)" stroke-width="3.5" stroke-linecap="round" />
        <path d="M 470 330 L 470 578" fill="none" stroke="url(#wireGradGND)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="6 3" />

        <!-- 2. DHT11 Connections (Top Left) -->
        <!-- DHT11 VCC -> 3V3 (ESP32) -->
        <path d="M 130 190 L 130 80 L 410 80 L 410 120" fill="none" stroke="#f87171" stroke-width="2.5" />
        <!-- DHT11 DATA -> GPIO32 (ESP32 Pin 23) -->
        <path d="M 160 190 L 160 120 L 410 120 L 410 200" fill="none" stroke="#10b981" stroke-width="3" filter="url(#glowGreen)" />
        <!-- DHT11 GND -> GND Bus -->
        <path d="M 190 190 L 190 578" fill="none" stroke="url(#wireGradGND)" stroke-width="2.5" stroke-dasharray="6 3" />

        <!-- 3. MQ135 Gas Sensor Connections (Top Right) -->
        <!-- MQ135 VCC -> 5V Bus -->
        <path d="M 830 190 L 830 562" fill="none" stroke="url(#wireGradVCC)" stroke-width="2.5" />
        <!-- MQ135 GND -> GND Bus -->
        <path d="M 860 190 L 860 578" fill="none" stroke="url(#wireGradGND)" stroke-width="2.5" stroke-dasharray="6 3" />
        <!-- MQ135 AO -> GPIO34 Analog (ESP32) -->
        <path d="M 890 190 L 890 100 L 530 100 L 530 200" fill="none" stroke="#06b6d4" stroke-width="3" filter="url(#glowCyan)" />

        <!-- 4. LCD 16x2 I2C Connections (Right Center) -->
        <!-- LCD SDA -> GPIO21 (ESP32) -->
        <path d="M 720 280 L 530 280 L 530 220" fill="none" stroke="url(#wireGradSDA)" stroke-width="3" filter="url(#glowCyan)" />
        <!-- LCD SCL -> GPIO22 (ESP32) -->
        <path d="M 720 300 L 520 300 L 520 240" fill="none" stroke="url(#wireGradSCL)" stroke-width="3" filter="url(#glowCyan)" />
        <!-- LCD VCC & GND -->
        <path d="M 720 240 L 780 240 L 780 562" fill="none" stroke="url(#wireGradVCC)" stroke-width="2.5" />
        <path d="M 720 260 L 800 260 L 800 578" fill="none" stroke="url(#wireGradGND)" stroke-width="2.5" stroke-dasharray="6 3" />

        <!-- 5. LEDs Driver Wires (Left Center) -->
        <!-- Green LED -> GPIO25 -->
        <path d="M 230 240 L 410 240" fill="none" stroke="#10b981" stroke-width="3" filter="url(#glowGreen)" />
        <!-- Yellow LED -> GPIO26 -->
        <path d="M 230 300 L 410 300 L 410 260" fill="none" stroke="#f59e0b" stroke-width="3" filter="url(#glowYellow)" />
        <!-- Red LED -> GPIO19 -->
        <path d="M 230 360 L 410 360 L 410 280" fill="none" stroke="#ef4444" stroke-width="3" filter="url(#glowRed)" />
        <!-- LED Cathodes -> GND Bus -->
        <path d="M 120 260 L 120 578" fill="none" stroke="url(#wireGradGND)" stroke-width="2.5" stroke-dasharray="6 3" />

        <!-- 6. Buzzer Connections (Bottom Left) -->
        <!-- Buzzer (+) -> GPIO18 -->
        <path d="M 280 470 L 430 470 L 430 310" fill="none" stroke="#ec4899" stroke-width="3" />
        <!-- Buzzer (-) -> GND Bus -->
        <path d="M 280 500 L 280 578" fill="none" stroke="url(#wireGradGND)" stroke-width="2.5" stroke-dasharray="6 3" />

        <!-- 7. TM1637 4-Digit Display Connections (Bottom Right) -->
        <!-- CLK -> GPIO18 & DIO -> GPIO19 -->
        <path d="M 720 460 L 530 460 L 530 310" fill="none" stroke="#f43f5e" stroke-width="2.5" />
        <path d="M 720 480 L 520 480 L 520 280" fill="none" stroke="#fb7185" stroke-width="2.5" />

        <!-- ===================================================================
             HARDWARE COMPONENTS GRAPHICAL BLOCKS
             =================================================================== -->

        <!-- COMPONENT 1: DHT11 SENSOR MODULE (TOP LEFT) -->
        <g transform="translate(90, 40)" class="schematic-comp" id="compDHT11">
          <rect x="0" y="0" width="130" height="150" rx="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
          <!-- Air Vent Grilles -->
          <line x1="20" y1="30" x2="110" y2="30" stroke="#0369a1" stroke-width="4" stroke-linecap="round" />
          <line x1="20" y1="42" x2="110" y2="42" stroke="#0369a1" stroke-width="4" stroke-linecap="round" />
          <line x1="20" y1="54" x2="110" y2="54" stroke="#0369a1" stroke-width="4" stroke-linecap="round" />
          <line x1="20" y1="66" x2="110" y2="66" stroke="#0369a1" stroke-width="4" stroke-linecap="round" />

          <text x="65" y="100" font-family="Outfit" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">DHT11</text>
          <text x="65" y="115" font-family="Inter" font-size="9" fill="#bae6fd" text-anchor="middle">Temp &amp; Humidity</text>

          <!-- Terminal Pins -->
          <circle cx="40" cy="150" r="4" fill="#ef4444" />
          <text x="40" y="142" font-family="Fira Code" font-size="8" fill="#ef4444" text-anchor="middle">3V3</text>

          <circle cx="70" cy="150" r="4" fill="#10b981" />
          <text x="70" y="142" font-family="Fira Code" font-size="8" fill="#10b981" text-anchor="middle">DAT</text>

          <circle cx="100" cy="150" r="4" fill="#3b82f6" />
          <text x="100" y="142" font-family="Fira Code" font-size="8" fill="#3b82f6" text-anchor="middle">GND</text>
        </g>

        <!-- COMPONENT 2: MQ135 GAS SENSOR MODULE (TOP RIGHT) -->
        <g transform="translate(800, 40)" class="schematic-comp" id="compMQ135">
          <rect x="0" y="0" width="140" height="150" rx="10" fill="#0f172a" stroke="#06b6d4" stroke-width="2" />
          <!-- Metallic Mesh Sensor Ring -->
          <circle cx="70" cy="60" r="38" fill="#1e293b" stroke="#06b6d4" stroke-width="2.5" />
          <circle cx="70" cy="60" r="28" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-dasharray="5 3" />
          <circle cx="70" cy="60" r="12" fill="#06b6d4" opacity="0.5" />

          <text x="70" y="64" font-family="Outfit" font-size="11" font-weight="bold" fill="#fff" text-anchor="middle">MQ135</text>
          <text x="70" y="115" font-family="Inter" font-size="9" fill="#94a3b8" text-anchor="middle">Gas &amp; Air Sensor</text>

          <!-- Terminal Pins -->
          <circle cx="30" cy="150" r="4" fill="#ef4444" />
          <text x="30" y="142" font-family="Fira Code" font-size="8" fill="#ef4444" text-anchor="middle">VCC</text>

          <circle cx="60" cy="150" r="4" fill="#3b82f6" />
          <text x="60" y="142" font-family="Fira Code" font-size="8" fill="#3b82f6" text-anchor="middle">GND</text>

          <circle cx="90" cy="150" r="4" fill="#06b6d4" />
          <text x="90" y="142" font-family="Fira Code" font-size="8" fill="#06b6d4" text-anchor="middle">AO</text>
        </g>

        <!-- COMPONENT 3: ESP32 DEVKIT V1 MICROCONTROLLER (CENTER CORE) -->
        <g transform="translate(390, 100)" class="schematic-comp" id="compESP32">
          <!-- Board Chassis -->
          <rect x="0" y="0" width="160" height="230" rx="12" fill="#0b0f19" stroke="#8b5cf6" stroke-width="2.5" />
          
          <!-- Metal IC Shield Header -->
          <rect x="30" y="45" width="100" height="100" rx="6" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1.5" />
          <text x="80" y="88" font-family="Outfit" font-size="13" font-weight="bold" fill="#c084fc" text-anchor="middle">ESP32-WROOM</text>
          <text x="80" y="108" font-family="Fira Code" font-size="8" fill="#94a3b8" text-anchor="middle">Tensilica 240MHz</text>

          <text x="80" y="25" font-family="Outfit" font-size="13" font-weight="bold" fill="#fff" text-anchor="middle">ESP32 DevKit V1</text>
          
          <!-- USB Port -->
          <rect x="60" y="215" width="40" height="15" rx="3" fill="#475569" />
          <text x="80" y="226" font-family="Fira Code" font-size="8" fill="#fff" text-anchor="middle">USB</text>

          <!-- Left Pin Header Labels -->
          <text x="20" y="103" font-family="Fira Code" font-size="8" fill="#10b981">GPIO32</text>
          <text x="20" y="143" font-family="Fira Code" font-size="8" fill="#10b981">GPIO25</text>
          <text x="20" y="203" font-family="Fira Code" font-size="8" fill="#f59e0b">GPIO26</text>
          <text x="20" y="213" font-family="Fira Code" font-size="8" fill="#ef4444">GPIO19</text>

          <!-- Right Pin Header Labels -->
          <text x="140" y="103" font-family="Fira Code" font-size="8" fill="#06b6d4" text-anchor="end">GPIO34</text>
          <text x="140" y="123" font-family="Fira Code" font-size="8" fill="#a855f7" text-anchor="end">GPIO21</text>
          <text x="140" y="143" font-family="Fira Code" font-size="8" fill="#38bdf8" text-anchor="end">GPIO22</text>
          <text x="140" y="213" font-family="Fira Code" font-size="8" fill="#ec4899" text-anchor="end">GPIO18</text>
        </g>

        <!-- COMPONENT 4: LCD 16x2 DISPLAY WITH I2C BACKPACK (CENTER RIGHT) -->
        <g transform="translate(680, 210)" class="schematic-comp" id="compLCD">
          <!-- Green PCB Board -->
          <rect x="0" y="0" width="240" height="140" rx="8" fill="#065f46" stroke="#10b981" stroke-width="2" />
          
          <!-- Glass Screen Frame -->
          <rect x="20" y="20" width="200" height="70" rx="4" fill="#022c22" stroke="#059669" stroke-width="2" />
          
          <!-- Backlit Screen Display Line Text -->
          <text x="30" y="48" font-family="Fira Code" font-size="12" font-weight="bold" fill="#34d399">T:24.5C H:52%</text>
          <text x="30" y="74" font-family="Fira Code" font-size="12" font-weight="bold" fill="#34d399">Gas:420 AQ:GOOD</text>

          <text x="120" y="115" font-family="Outfit" font-size="11" font-weight="bold" fill="#a7f3d0" text-anchor="middle">LCD 16x2 Display (I2C Backpack)</text>

          <!-- Pins -->
          <circle cx="40" cy="140" r="4" fill="#ef4444" />
          <text x="40" y="132" font-family="Fira Code" font-size="8" fill="#ef4444" text-anchor="middle">VCC</text>

          <circle cx="80" cy="140" r="4" fill="#3b82f6" />
          <text x="80" y="132" font-family="Fira Code" font-size="8" fill="#3b82f6" text-anchor="middle">GND</text>

          <circle cx="120" cy="140" r="4" fill="#a855f7" />
          <text x="120" y="132" font-family="Fira Code" font-size="8" fill="#a855f7" text-anchor="middle">SDA</text>

          <circle cx="160" cy="140" r="4" fill="#38bdf8" />
          <text x="160" y="132" font-family="Fira Code" font-size="8" fill="#38bdf8" text-anchor="middle">SCL</text>
        </g>

        <!-- COMPONENT 5: OUTPUT ALERT STATUS LEDS (MIDDLE LEFT) -->
        <g transform="translate(60, 220)" class="schematic-comp" id="compLEDs">
          <rect x="0" y="0" width="180" height="170" rx="10" fill="#0f172a" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
          <text x="90" y="25" font-family="Outfit" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">Status Alert LEDs</text>

          <!-- Green LED (Good <= 800) -->
          <circle cx="40" cy="55" r="12" fill="#10b981" filter="url(#glowGreen)" />
          <text x="65" y="58" font-family="Inter" font-size="10" font-weight="600" fill="#10b981">GOOD (GPIO 25)</text>

          <!-- Yellow LED (Moderate <= 1500) -->
          <circle cx="40" cy="95" r="12" fill="#f59e0b" filter="url(#glowYellow)" />
          <text x="65" y="98" font-family="Inter" font-size="10" font-weight="600" fill="#f59e0b">MOD (GPIO 26)</text>

          <!-- Red LED (Hazard > 1500) -->
          <circle cx="40" cy="135" r="12" fill="#ef4444" filter="url(#glowRed)" />
          <text x="65" y="138" font-family="Inter" font-size="10" font-weight="600" fill="#ef4444">HAZARD (GPIO 19)</text>
        </g>

        <!-- COMPONENT 6: ALARM BUZZER MODULE (LOWER LEFT) -->
        <g transform="translate(200, 430)" class="schematic-comp" id="compBuzzer">
          <rect x="0" y="0" width="120" height="100" rx="8" fill="#0f172a" stroke="#ec4899" stroke-width="1.5" />
          
          <!-- Buzzer Cylinder Body -->
          <circle cx="60" cy="45" r="24" fill="#1e293b" stroke="#ec4899" stroke-width="2" />
          <circle cx="60" cy="45" r="8" fill="#ec4899" />
          
          <text x="60" y="85" font-family="Outfit" font-size="10" font-weight="bold" fill="#f472b6" text-anchor="middle">Alarm Buzzer (18)</text>

          <!-- Sound Wave Arcs -->
          <path d="M 90 35 A 15 15 0 0 1 90 55" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" />
          <path d="M 96 28 A 24 24 0 0 1 96 62" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" />
        </g>

        <!-- COMPONENT 7: TM1637 4-DIGIT DISPLAY MODULE (LOWER RIGHT) -->
        <g transform="translate(710, 400)" class="schematic-comp" id="compTM1637">
          <rect x="0" y="0" width="200" height="110" rx="8" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="2" />
          
          <!-- 4-Digit Segment Frame -->
          <rect x="25" y="20" width="150" height="50" rx="4" fill="#09090b" stroke="#4c1d95" stroke-width="1.5" />
          
          <!-- Digital 7-Segment Digits readout -->
          <text x="100" y="55" font-family="Fira Code" font-size="28" font-weight="bold" fill="#ef4444" text-anchor="middle" letter-spacing="4">0420</text>

          <text x="100" y="92" font-family="Outfit" font-size="10" font-weight="bold" fill="#c084fc" text-anchor="middle">TM1637 LED Display (CLK 18 / DIO 19)</text>
        </g>

      </svg>
    `;

    this.container.innerHTML = svg;
  }
}

window.CircuitSchematic = CircuitSchematic;
