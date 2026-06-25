import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from './SFIcon';
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb } from '../utils/colorUtils';

import { TRANSLATIONS, LANGUAGE_OPTIONS, FONT_OPTIONS } from '../i18n/translations';

function useT() {
  const { language } = useApp();
  const dict = TRANSLATIONS[language] || TRANSLATIONS.nl;
  return (key) => dict[key] ?? key;
}

function DarwinSelect({ value, onChange, options, style }) {
  return (
    <div className="darwin-sel-wrap" style={style}>
      <select className="darwin-sel" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <SFIcon name="chevron.down.svg" size={11} color="var(--text-muted)" style={{ position:'absolute', right:10, pointerEvents:'none' }} />
    </div>
  );
}

const SECTIONS_KEYS = [
  { id: 'appearance',   sKey: 's_appearance',   icon: 'paintbrush.svg'        },
  { id: 'accent',       sKey: 's_accent',        icon: 'paintpalette.svg'      },
  { id: 'typography',   sKey: 's_typography',    icon: 'textformat.svg'        },
  { id: 'display',      sKey: 's_display',       icon: 'number.svg'            },
  { id: 'language',     sKey: 's_language',      icon: 'globe.svg'             },
  { id: 'animations',   sKey: 's_animations',    icon: 'gauge.with.needle.svg' },
  { id: 'accessibility',sKey: 's_accessibility', icon: 'accessibility.svg'     },
  { id: 'about',        sKey: 's_about',         icon: 'info.app.svg'          },
];


function Toggle({ checked, onChange }) {
  return (
    <div className={`darwin-toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
      <div className="darwin-toggle-thumb" />
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 100 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="darwin-slider-wrap">
      <input
        type="range" min={min} max={max} value={value}
        style={{ '--pct': pct + '%' }}
        onChange={e => onChange(Number(e.target.value))}
        className="darwin-slider"
      />
    </div>
  );
}

function AppearanceSection() {
  const { themeMode, setThemeMode, toggleColor, setToggleColor } = useApp();
  const [transparency, setTransparency] = useState(80);
  const [soundEffects, setSoundEffects] = useState(true);
  const [showTogglePicker, setShowTogglePicker] = useState(false);
  const t = useT();

  const themes = [
    { id: 'auto',  tKey: 'auto',  icon: 'display.svg' },
    { id: 'light', tKey: 'light', icon: 'sun.max.svg'  },
    { id: 'dark',  tKey: 'dark',  icon: 'moon.svg'     },
  ];

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">{t('s_theme')}</h2>
        <div className="darwin-theme-grid">
          {themes.map(th => (
            <button
              key={th.id}
              className={`darwin-theme-card${themeMode === th.id ? ' active' : ''}`}
              onClick={() => setThemeMode(th.id)}
            >
              <SFIcon name={th.icon} size={26} color={themeMode === th.id ? 'var(--accent)' : 'var(--text-secondary)'} />
              <span>{t(th.tKey)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="darwin-section-block">
        <div className="darwin-row">
          <span className="darwin-row-label">{t('s_transparency')}</span>
          <span className="darwin-row-value">{transparency}%</span>
        </div>
        <Slider value={transparency} onChange={setTransparency} />
      </div>

      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">{t('s_sound')}</div>
            <div className="darwin-row-sub">{t('s_sound_sub')}</div>
          </div>
          <Toggle checked={soundEffects} onChange={setSoundEffects} />
        </div>
      </div>

      <div className="darwin-section-block darwin-card-block" style={{ marginTop: 12 }}>
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">{t('s_toggle_color')}</div>
            <div className="darwin-row-sub">{t('s_toggle_color_sub')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="darwin-color-preview"
              style={{ background: toggleColor, cursor: 'pointer' }}
              onClick={() => setShowTogglePicker(true)}
            />
          </div>
        </div>
      </div>

      {showTogglePicker && (
        <ColorPickerPopup
          initColor={toggleColor}
          onChange={setToggleColor}
          onClose={() => setShowTogglePicker(false)}
        />
      )}
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

const HOVER_EFFECTS = [
  { id: 'gradient-reveal', label: 'Gradient Reveal' },
  { id: 'lift',            label: 'Lift' },
  { id: 'scale',           label: 'Scale' },
  { id: 'glow',            label: 'Glow' },
  { id: 'border-glow',     label: 'Border Glow' },
  { id: 'slide-arrow',     label: 'Slide Arrow' },
];

const REVEAL_EFFECTS = [
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'fade-in',  label: 'Fade In'  },
  { id: 'scale',    label: 'Scale'    },
  { id: 'blur',     label: 'Blur'     },
];

function GradientRevealPreviewCard({ selected, onClick }) {
  const ref = useRef();
  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    ref.current.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  };
  return (
    <div
      ref={ref}
      className={`effect-select-card preview-gradient-reveal${selected ? ' selected' : ''}`}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <span className="effect-label">Gradient Reveal</span>
    </div>
  );
}

function AnimationsSection() {
  const {
    hoverEffect, setHoverEffect, hoverEffectEnabled, setHoverEffectEnabled,
    revealEffect, setRevealEffect, revealEffectEnabled, setRevealEffectEnabled,
  } = useApp();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="darwin-section-content">
      {/* General motion */}
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Motion & Effects</h2>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Reduce Motion</div>
            <div className="darwin-row-sub">Minimize movement for accessibility</div>
          </div>
          <Toggle checked={reduceMotion} onChange={setReduceMotion} />
        </div>
      </div>

      {/* ── Hover Effects ── */}
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Hover Effects</h2>
        <p className="darwin-section-desc">Apply an interactive hover effect to all cards.</p>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Enable Hover Effects</div>
            <div className="darwin-row-sub">Activeer hover animaties op kaarten</div>
          </div>
          <Toggle checked={hoverEffectEnabled} onChange={setHoverEffectEnabled} />
        </div>
        {hoverEffectEnabled && (
          <>
            <div className="darwin-card-divider" />
            <div className="effect-select-grid">
              {HOVER_EFFECTS.map(ef => {
                if (ef.id === 'gradient-reveal') {
                  return (
                    <GradientRevealPreviewCard
                      key={ef.id}
                      selected={hoverEffect === ef.id}
                      onClick={() => setHoverEffect(ef.id)}
                    />
                  );
                }
                return (
                  <div
                    key={ef.id}
                    className={`effect-select-card preview-${ef.id}${hoverEffect === ef.id ? ' selected' : ''}`}
                    onClick={() => setHoverEffect(ef.id)}
                  >
                    <span className="effect-label">{ef.label}</span>
                    {ef.id === 'slide-arrow' && <span className="card-arrow">→</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Reveal Effects ── */}
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Reveal Effects</h2>
        <p className="darwin-section-desc">Animate cards as they appear on screen.</p>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Enable Reveal Effects</div>
            <div className="darwin-row-sub">Animeer kaarten bij laden van pagina</div>
          </div>
          <Toggle checked={revealEffectEnabled} onChange={setRevealEffectEnabled} />
        </div>
        {revealEffectEnabled && (
          <>
            <div className="darwin-card-divider" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, paddingBottom: 4 }}>
              <button className="effect-replay-btn" onClick={() => setReplayKey(k => k + 1)}>
                ↺ Replay Animations
              </button>
            </div>
            <div className="effect-select-grid-2">
              {REVEAL_EFFECTS.map(ef => (
                <div
                  key={ef.id}
                  className={`effect-select-card preview-reveal-${ef.id}${revealEffect === ef.id ? ' selected' : ''}`}
                  onClick={() => setRevealEffect(ef.id)}
                >
                  <span key={replayKey} className="effect-label">{ef.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
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

/* ══════════════════════════════════════════
   LANGUAGE SECTION
══════════════════════════════════════════ */
function LanguageSection() {
  const { language, setLanguage } = useApp();
  const t = useT();
  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">{t('s_language')}</h2>
        <p className="darwin-section-desc">{t('s_lang_desc')}</p>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div className="darwin-row-label">{t('s_lang_label')}</div>
          <DarwinSelect
            value={language}
            onChange={setLanguage}
            options={LANGUAGE_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TYPOGRAPHY SECTION
══════════════════════════════════════════ */
function TypographySection() {
  const { fontFamily, setFontFamily, boldText, setBoldText, boldWeight, setBoldWeight, fontSize, setFontSize, allCaps, setAllCaps } = useApp();
  const t = useT();
  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">{t('s_typography')}</h2>
        <p className="darwin-section-desc">{t('s_font_desc')}</p>
      </div>

      {/* Font family — select */}
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div className="darwin-row-label">{t('s_font_label')}</div>
          <DarwinSelect
            value={fontFamily}
            onChange={setFontFamily}
            options={FONT_OPTIONS}
            style={{ width: 170 }}
          />
        </div>
      </div>

      {/* Font size slider */}
      <div className="darwin-section-block darwin-card-block" style={{ marginTop: 12 }}>
        <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="darwin-row-label">{t('s_fontsize')}</div>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{fontSize}%</span>
          </div>
          <Slider value={fontSize} onChange={setFontSize} min={70} max={150} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>A</span>
            <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>A</span>
          </div>
        </div>
      </div>

      {/* All caps toggle */}
      <div className="darwin-section-block darwin-card-block" style={{ marginTop: 12 }}>
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">{t('s_allcaps')}</div>
            <div className="darwin-row-sub">{t('s_allcaps_sub')}</div>
          </div>
          <Toggle checked={allCaps} onChange={setAllCaps} />
        </div>
      </div>

      {/* Bold text toggle + intensity slider */}
      <div className="darwin-section-block darwin-card-block" style={{ marginTop: 12 }}>
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">{t('s_boldtext')}</div>
            <div className="darwin-row-sub">{t('s_boldtext_sub')}</div>
          </div>
          <Toggle checked={boldText} onChange={setBoldText} />
        </div>
        {boldText && (
          <>
            <div className="darwin-card-divider" />
            <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="darwin-row-label" style={{ fontWeight: 400 }}>{t('s_bold_intensity')}</div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{boldWeight}%</span>
              </div>
              <Slider value={boldWeight} onChange={setBoldWeight} min={0} max={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 300 }}>Licht</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 900 }}>Zwaar</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DISPLAY SECTION (amount colors)
══════════════════════════════════════════ */
function DisplaySection() {
  const { amountPositiveColor, setAmountPositiveColor, amountNegativeColor, setAmountNegativeColor } = useApp();
  const [pickerTarget, setPickerTarget] = useState(null);
  const t = useT();

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">{t('s_display')}</h2>
        <p className="darwin-section-desc">{t('s_preview')}: <span style={{ color: amountPositiveColor, fontWeight: 700 }}>+€1.234,56</span> &nbsp; <span style={{ color: amountNegativeColor, fontWeight: 700 }}>-€567,89</span></p>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">{t('s_positive_color')}</div>
            <div className="darwin-row-sub">{t('s_positive_color_sub')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="darwin-color-preview"
              style={{ background: amountPositiveColor, cursor: 'pointer' }}
              onClick={() => setPickerTarget('positive')}
            />
          </div>
        </div>
        <div className="darwin-card-divider" />
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">{t('s_negative_color')}</div>
            <div className="darwin-row-sub">{t('s_negative_color_sub')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="darwin-color-preview"
              style={{ background: amountNegativeColor, cursor: 'pointer' }}
              onClick={() => setPickerTarget('negative')}
            />
          </div>
        </div>
      </div>

      {pickerTarget === 'positive' && (
        <ColorPickerPopup
          initColor={amountPositiveColor}
          onChange={setAmountPositiveColor}
          onClose={() => setPickerTarget(null)}
        />
      )}
      {pickerTarget === 'negative' && (
        <ColorPickerPopup
          initColor={amountNegativeColor}
          onChange={setAmountNegativeColor}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN SETTINGS EXPORT
══════════════════════════════════════════ */
function SectionContent({ active }) {
  switch (active) {
    case 'appearance':    return <AppearanceSection />;
    case 'accent':        return <AccentSection />;
    case 'typography':    return <TypographySection />;
    case 'display':       return <DisplaySection />;
    case 'language':      return <LanguageSection />;
    case 'animations':    return <AnimationsSection />;
    case 'accessibility': return <AccessibilitySection />;
    case 'about':         return <AboutSection />;
    default:              return null;
  }
}

export default function Settings({ onClose }) {
  const [active, setActive] = useState('appearance');
  const { privateMode, setPrivateMode } = useApp();
  const navigate = useNavigate();
  const t = useT();

  return (
    <div className="darwin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="darwin-window">
        <div className="darwin-titlebar">
          <div className="darwin-traffic-lights">
            <button className="darwin-tl darwin-tl-red"    onClick={onClose} title="Close" />
            <button className="darwin-tl darwin-tl-yellow" title="Minimise" />
            <button className="darwin-tl darwin-tl-green"  title="Maximise" />
          </div>
          <span className="darwin-window-title">{t('nav_settings')}</span>
        </div>

        <div className="darwin-window-body">
          <aside className="darwin-nav">
            {SECTIONS_KEYS.map(s => (
              <button
                key={s.id}
                className={`darwin-nav-item${active === s.id ? ' active' : ''}`}
                onClick={() => setActive(s.id)}
              >
                <SFIcon name={s.icon} size={16} color="currentColor" />
                <span>{t(s.sKey)}</span>
              </button>
            ))}

            <div className="darwin-nav-spacer" />
            <div className="darwin-nav-divider" />
            <button className="darwin-nav-item" onClick={() => { onClose(); navigate('/'); }}>
              <SFIcon name="house.svg" size={16} color="currentColor" />
              <span>{t('hub')}</span>
            </button>
            <button className="darwin-nav-item" onClick={() => setPrivateMode(p => !p)}>
              <SFIcon name={privateMode ? 'eye.svg' : 'lock.svg'} size={16} color="currentColor" />
              <span>{t(privateMode ? 'show_numbers' : 'hide_numbers')}</span>
            </button>
          </aside>

          <main className="darwin-content" key={active}>
            <SectionContent active={active} />
          </main>
        </div>
      </div>
    </div>
  );
}
