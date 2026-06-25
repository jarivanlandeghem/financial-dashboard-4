import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from './SFIcon';
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb } from '../utils/colorUtils';

const SECTIONS = [
  { id: 'appearance',   label: 'Appearance',    icon: 'paintbrush.svg'      },
  { id: 'accent',       label: 'Accent Color',  icon: 'paintpalette.svg'    },
  { id: 'animations',   label: 'Animations',    icon: 'gauge.with.needle.svg' },
  { id: 'accessibility',label: 'Accessibility', icon: 'accessibility.svg'   },
  { id: 'about',        label: 'About',         icon: 'info.app.svg'        },
];


function Toggle({ checked, onChange }) {
  return (
    <div className={`darwin-toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
      <div className="darwin-toggle-thumb" />
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 100 }) {
  return (
    <div className="darwin-slider-wrap">
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="darwin-slider"
      />
    </div>
  );
}

function AppearanceSection() {
  const { themeMode, setThemeMode } = useApp();
  const [transparency, setTransparency] = useState(80);
  const [soundEffects, setSoundEffects] = useState(true);
  const [boldText, setBoldText] = useState(false);

  const themes = [
    { id: 'auto',  label: 'Auto',  icon: 'display.svg' },
    { id: 'light', label: 'Light', icon: 'sun.max.svg'  },
    { id: 'dark',  label: 'Dark',  icon: 'moon.svg'     },
  ];

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Theme</h2>
        <div className="darwin-theme-grid">
          {themes.map(t => (
            <button
              key={t.id}
              className={`darwin-theme-card${themeMode === t.id ? ' active' : ''}`}
              onClick={() => setThemeMode(t.id)}
            >
              <SFIcon name={t.icon} size={26} color={themeMode === t.id ? 'var(--accent)' : 'var(--text-secondary)'} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="darwin-section-block">
        <div className="darwin-row">
          <span className="darwin-row-label">Window Transparency</span>
          <span className="darwin-row-value">{transparency}%</span>
        </div>
        <Slider value={transparency} onChange={setTransparency} />
      </div>

      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Sound Effects</div>
            <div className="darwin-row-sub">Play sounds for interactions</div>
          </div>
          <Toggle checked={soundEffects} onChange={setSoundEffects} />
        </div>
        <div className="darwin-card-divider" />
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Bold Text</div>
            <div className="darwin-row-sub">Increase text weight throughout</div>
          </div>
          <Toggle checked={boldText} onChange={setBoldText} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COLOR PICKER POPUP
══════════════════════════════════════════ */
const RASTER_COLORS = [
  '#FF3B30','#FF453A','#FF6B6B','#FF8C69','#FF9500','#FFBD44','#FFCC00',
  '#FFD60A','#C8E63A','#4CD964','#34C759','#30D158','#00C7BE','#1DB954',
  '#00BCD4','#0CBFE5','#5AC8FA','#007AFF','#0A84FF','#1D4ED8','#0077ED',
  '#5E5CE6','#7C3AED','#AF52DE','#BF5AF2','#FF2D55','#FF375F','#FF6EAF',
  '#FFABAB','#FFD6A5','#FDFFB6','#CAFFBF','#9BF6FF','#A0C4FF','#BDB2FF',
  '#B00020','#E65100','#F57F17','#1B5E20','#004D40','#0D47A1','#4A148C',
  '#F2F2F7','#C7C7CC','#8E8E93','#636366','#3A3A3C','#1C1C1E','#000000',
];

function ColorPickerPopup({ initColor, onChange, onClose }) {
  const init   = initColor || '#007AFF';
  const iRgb   = hexToRgb(init);
  const iHsv   = rgbToHsv(iRgb.r, iRgb.g, iRgb.b);

  const [tab, setTab]         = useState('sliders');
  const [r, setR]             = useState(iRgb.r);
  const [g, setG]             = useState(iRgb.g);
  const [b, setB]             = useState(iRgb.b);
  const [hue, setHue]         = useState(iHsv.h);
  const [sat, setSat]         = useState(iHsv.s);
  const [val, setVal]         = useState(iHsv.v);
  const [hexInput, setHexInput] = useState(init.slice(1).toUpperCase());

  const hex = rgbToHex(r, g, b);

  const fromRgb = (nr, ng, nb) => {
    const [cr, cg, cb] = [nr, ng, nb].map(v => Math.max(0, Math.min(255, Math.round(v))));
    setR(cr); setG(cg); setB(cb);
    setHexInput(rgbToHex(cr, cg, cb).slice(1).toUpperCase());
    const hsv = rgbToHsv(cr, cg, cb);
    setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
  };

  const fromHsv = useCallback((nh, ns, nv) => {
    setHue(nh); setSat(ns); setVal(nv);
    const rgb = hsvToRgb(nh, ns, nv);
    setR(rgb.r); setG(rgb.g); setB(rgb.b);
    setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b).slice(1).toUpperCase());
  }, []);

  const fromHex = (raw) => {
    const clean = raw.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 6);
    setHexInput(clean);
    if (clean.length === 6) {
      const rgb = hexToRgb('#' + clean);
      setR(rgb.r); setG(rgb.g); setB(rgb.b);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
    }
  };

  const specRef = useRef();
  const handleSpec = useCallback((e) => {
    if (!specRef.current) return;
    const rect = specRef.current.getBoundingClientRect();
    const sx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const sy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    fromHsv(hue, sx * 100, (1 - sy) * 100);
  }, [hue, fromHsv]);

  const onSpecDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); handleSpec(e); };
  const onSpecMove = (e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) handleSpec(e); };

  const hueColor = `hsl(${hue}, 100%, 50%)`;

  return (
    <div className="cpicker-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cpicker-window">
        <div className="cpicker-header">
          <SFIcon name="eyedropper.svg" size={15} color="var(--text-secondary)" />
          <span className="cpicker-title">Kleuren</span>
          <button className="cpicker-close" onClick={onClose}>✕</button>
        </div>

        <div className="cpicker-tabs">
          {[['grid','Raster'],['spectrum','Spectrum'],['sliders','Schuifbalken']].map(([id,lbl]) => (
            <button key={id} className={`cpicker-tab${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </div>

        {tab === 'grid' && (
          <div className="cpicker-grid">
            {RASTER_COLORS.map(c => (
              <div key={c}
                className={`cpicker-swatch${hex.toLowerCase() === c.toLowerCase() ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => { const rgb = hexToRgb(c); fromRgb(rgb.r, rgb.g, rgb.b); }}
              />
            ))}
          </div>
        )}

        {tab === 'spectrum' && (
          <div className="cpicker-spectrum-wrap">
            <div
              className="cpicker-spectrum"
              ref={specRef}
              style={{ background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${hueColor})` }}
              onPointerDown={onSpecDown}
              onPointerMove={onSpecMove}
            >
              <div className="cpicker-dot" style={{ left: sat.toFixed(1) + '%', top: (100 - val).toFixed(1) + '%', background: hex }} />
            </div>
            <input type="range" min="0" max="360" step="1" value={Math.round(hue)}
              className="cpicker-hue"
              onChange={e => fromHsv(+e.target.value, sat, val)}
            />
          </div>
        )}

        {tab === 'sliders' && (
          <div className="cpicker-sliders">
            {[
              { lbl:'ROOD',  val:r, grad:`linear-gradient(to right,rgb(0,${g},${b}),rgb(255,${g},${b}))`,   set: v => fromRgb(v,g,b) },
              { lbl:'GROEN', val:g, grad:`linear-gradient(to right,rgb(${r},0,${b}),rgb(${r},255,${b}))`,   set: v => fromRgb(r,v,b) },
              { lbl:'BLAUW', val:b, grad:`linear-gradient(to right,rgb(${r},${g},0),rgb(${r},${g},255))`,   set: v => fromRgb(r,g,v) },
            ].map(s => (
              <div key={s.lbl}>
                <div className="cpicker-slider-label">{s.lbl}</div>
                <div className="cpicker-slider-row">
                  <input type="range" min="0" max="255" step="1" value={s.val}
                    className="cpicker-rgb-slider"
                    style={{'--grad': s.grad}}
                    onChange={e => s.set(+e.target.value)}
                  />
                  <input type="number" min="0" max="255" value={s.val}
                    className="cpicker-num"
                    onChange={e => s.set(+e.target.value)}
                  />
                </div>
              </div>
            ))}
            <div className="cpicker-hex-row">
              <span className="cpicker-hex-label">sRGB Hex-kleurcode</span>
              <input className="cpicker-hex" value={hexInput} maxLength={6} onChange={e => fromHex(e.target.value)} />
            </div>
          </div>
        )}

        <div className="cpicker-bottom">
          <div className="cpicker-preview" style={{ background: hex }} />
          <span style={{ fontSize:13, color:'var(--text-secondary)', fontFamily:'monospace' }}>#{hexInput.padEnd(6,'0')}</span>
        </div>

        <button className="btn btn-primary cpicker-apply" onClick={() => { onChange(hex); onClose(); }}>
          Toepassen
        </button>
      </div>
    </div>
  );
}

const ACCENT_PRESETS = [
  { label: 'Blue',     val: '#007AFF' },
  { label: 'Purple',   val: '#AF52DE' },
  { label: 'Pink',     val: '#FF2D55' },
  { label: 'Red',      val: '#FF3B30' },
  { label: 'Orange',   val: '#FF9500' },
  { label: 'Yellow',   val: '#FFCC00' },
  { label: 'Green',    val: '#34C759' },
  { label: 'Graphite', val: '#8E8E93' },
];

function AccentSection() {
  const { accentColor, setAccentColor } = useApp();
  const [showPicker, setShowPicker] = useState(false);

  const isPreset = ACCENT_PRESETS.some(p => p.val.toLowerCase() === accentColor.toLowerCase());

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Accent Color</h2>
        <p className="darwin-section-desc">Choose the accent color used across the interface.</p>
        <div className="darwin-accent-grid">
          {ACCENT_PRESETS.map(c => (
            <div key={c.val} className="darwin-accent-item" onClick={() => setAccentColor(c.val)}>
              <div
                className={`darwin-accent-dot${accentColor.toLowerCase() === c.val.toLowerCase() ? ' selected' : ''}`}
                style={{ background: c.val, outlineColor: c.val }}
              />
              <span className="darwin-accent-label">{c.label}</span>
            </div>
          ))}
          {/* Custom */}
          <div className="darwin-accent-item" onClick={() => setShowPicker(true)}>
            <div
              className={`darwin-accent-dot${!isPreset ? ' selected' : ''}`}
              style={{ background: isPreset ? '#8E8E93' : accentColor, outlineColor: isPreset ? '#8E8E93' : accentColor }}
            />
            <span className="darwin-accent-label" style={{ color: !isPreset ? 'var(--accent)' : undefined }}>Aangepast...</span>
          </div>
        </div>
      </div>

      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Highlight Color</div>
            <div className="darwin-row-sub">Used for text selection</div>
          </div>
          <div className="darwin-color-preview" style={{ background: accentColor }} />
        </div>
      </div>

      {showPicker && (
        <ColorPickerPopup
          initColor={accentColor}
          onChange={setAccentColor}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

function AnimationsSection() {
  const [reveal, setReveal] = useState(true);
  const [spring, setSpring] = useState(true);
  const [pageTransitions, setPageTransitions] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const rows = [
    { label: 'Reveal Effect',     sub: 'Animate elements as they enter the viewport',   val: reveal,           set: setReveal           },
    { label: 'Spring Physics',    sub: 'Use spring-based easing for interactions',       val: spring,           set: setSpring           },
    { label: 'Page Transitions',  sub: 'Animate between route changes',                  val: pageTransitions,  set: setPageTransitions  },
    { label: 'Reduce Motion',     sub: 'Minimize movement for accessibility',            val: reduceMotion,     set: setReduceMotion     },
  ];

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Motion & Effects</h2>
      </div>
      <div className="darwin-section-block darwin-card-block">
        {rows.map((r, i) => (
          <div key={r.label}>
            {i > 0 && <div className="darwin-card-divider" />}
            <div className="darwin-card-row">
              <div>
                <div className="darwin-row-label">{r.label}</div>
                <div className="darwin-row-sub">{r.sub}</div>
              </div>
              <Toggle checked={r.val} onChange={r.set} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccessibilitySection() {
  const [highContrast, setHighContrast] = useState(false);
  const [largerText, setLargerText] = useState(false);
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [increaseContrast, setIncreaseContrast] = useState(false);

  const rows = [
    { label: 'High Contrast',         sub: 'Increase UI contrast',                         val: highContrast,          set: setHighContrast          },
    { label: 'Larger Text',           sub: 'Increase default font sizes',                   val: largerText,            set: setLargerText            },
    { label: 'Reduce Transparency',   sub: 'Replace translucent backgrounds with solid',    val: reduceTransparency,    set: setReduceTransparency    },
    { label: 'Increase Contrast',     sub: 'Strengthen border and divider visibility',      val: increaseContrast,      set: setIncreaseContrast      },
  ];

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Accessibility</h2>
      </div>
      <div className="darwin-section-block darwin-card-block">
        {rows.map((r, i) => (
          <div key={r.label}>
            {i > 0 && <div className="darwin-card-divider" />}
            <div className="darwin-card-row">
              <div>
                <div className="darwin-row-label">{r.label}</div>
                <div className="darwin-row-sub">{r.sub}</div>
              </div>
              <Toggle checked={r.val} onChange={r.set} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">About</h2>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-about-logo">
          <div className="darwin-about-icon">
            <SFIcon name="wallet.pass.svg" size={32} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Financial Dashboard</div>
            <div className="darwin-row-sub">Version 2.0.0</div>
          </div>
        </div>
        <div className="darwin-card-divider" />
        <div className="darwin-card-row">
          <span className="darwin-row-label">Build</span>
          <span className="darwin-row-value">2026.06.25</span>
        </div>
        <div className="darwin-card-divider" />
        <div className="darwin-card-row">
          <span className="darwin-row-label">Framework</span>
          <span className="darwin-row-value">React + Vite</span>
        </div>
        <div className="darwin-card-divider" />
        <div className="darwin-card-row">
          <span className="darwin-row-label">Design</span>
          <span className="darwin-row-value">Darwin UI</span>
        </div>
      </div>
    </div>
  );
}

const SECTION_CONTENT = {
  appearance:    <AppearanceSection />,
  accent:        <AccentSection />,
  animations:    <AnimationsSection />,
  accessibility: <AccessibilitySection />,
  about:         <AboutSection />,
};

export default function Settings({ onClose }) {
  const [active, setActive] = useState('appearance');
  const { privateMode, setPrivateMode } = useApp();
  const navigate = useNavigate();

  return (
    <div className="darwin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="darwin-window">

        {/* macOS traffic lights + title bar */}
        <div className="darwin-titlebar">
          <div className="darwin-traffic-lights">
            <button className="darwin-tl darwin-tl-red"    onClick={onClose} title="Close" />
            <button className="darwin-tl darwin-tl-yellow" title="Minimise" />
            <button className="darwin-tl darwin-tl-green"  title="Maximise" />
          </div>
          <span className="darwin-window-title">Settings</span>
        </div>

        <div className="darwin-window-body">

          {/* Left sidebar nav */}
          <aside className="darwin-nav">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`darwin-nav-item${active === s.id ? ' active' : ''}`}
                onClick={() => setActive(s.id)}
              >
                <SFIcon name={s.icon} size={16} color="currentColor" />
                <span>{s.label}</span>
              </button>
            ))}

            <div className="darwin-nav-spacer" />

            {/* Hub + Hide Numbers moved here */}
            <div className="darwin-nav-divider" />
            <button className="darwin-nav-item" onClick={() => { onClose(); navigate('/'); }}>
              <SFIcon name="house.svg" size={16} color="currentColor" />
              <span>Hub</span>
            </button>
            <button className="darwin-nav-item" onClick={() => setPrivateMode(p => !p)}>
              <SFIcon name={privateMode ? 'eye.svg' : 'lock.svg'} size={16} color="currentColor" />
              <span>{privateMode ? 'Show Numbers' : 'Hide Numbers'}</span>
            </button>
          </aside>

          {/* Right content */}
          <main className="darwin-content" key={active}>
            {SECTION_CONTENT[active]}
          </main>
        </div>
      </div>
    </div>
  );
}
