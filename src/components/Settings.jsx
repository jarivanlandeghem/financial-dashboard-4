import { useState, useRef, useCallback, useEffect, startTransition } from 'react';
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
  { id: 'appearance',     sKey: 's_appearance',     icon: 'paintbrush.svg'        },
  { id: 'accent',         sKey: 's_accent',          icon: 'paintpalette.svg'      },
  { id: 'background',     sKey: 's_background',      icon: 'photo.on.rectangle.svg'},
  { id: 'visual_effects', sKey: 's_visual_effects',  icon: 'sparkles.svg'          },
  { id: 'typography',     sKey: 's_typography',      icon: 'textformat.svg'        },
  { id: 'display',        sKey: 's_display',         icon: 'number.svg'            },
  { id: 'language',       sKey: 's_language',        icon: 'globe.svg'             },
  { id: 'animations',     sKey: 's_animations',      icon: 'gauge.with.needle.svg' },
  { id: 'accessibility',  sKey: 's_accessibility',   icon: 'accessibility.svg'     },
  { id: 'about',          sKey: 's_about',           icon: 'info.app.svg'          },
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
// iOS-style color grid: 10 hue columns × rows from dark→light + grayscale row
function hsvToHexStr(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    const c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}
// Hues left→right matching iOS: blue, teal, green, yellow-green, yellow, orange, red, pink, magenta, purple
const IOS_HUES = [240, 195, 155, 105, 60, 35, 10, 345, 315, 280];
const IOS_ROWS = [
  { s: 1.00, v: 0.30 },
  { s: 1.00, v: 0.48 },
  { s: 1.00, v: 0.65 },
  { s: 1.00, v: 0.82 },
  { s: 1.00, v: 1.00 },
  { s: 0.70, v: 1.00 },
  { s: 0.45, v: 1.00 },
  { s: 0.25, v: 1.00 },
  { s: 0.12, v: 1.00 },
];
const RASTER_COLORS = [
  // grayscale top row (10 cols)
  '#FFFFFF','#D1D1D6','#AEAEB2','#8E8E93','#636366','#48484A','#3A3A3C','#2C2C2E','#1C1C1E','#000000',
  // color rows (dark → light)
  ...IOS_ROWS.flatMap(({ s, v }) => IOS_HUES.map(h => hsvToHexStr(h, s, v))),
];

function ColorPickerPopup({ initColor, onChange, onClose }) {
  const init   = initColor || '#007AFF';
  const iRgb   = hexToRgb(init);
  const iHsv   = rgbToHsv(iRgb.r, iRgb.g, iRgb.b);

  const [tab, setTab]           = useState('sliders');
  const [r, setR]               = useState(iRgb.r);
  const [g, setG]               = useState(iRgb.g);
  const [b, setB]               = useState(iRgb.b);
  const [hue, setHue]           = useState(iHsv.h);
  const [sat, setSat]           = useState(iHsv.s);
  const [val, setVal]           = useState(iHsv.v);
  const [hexInput, setHexInput] = useState(init.slice(1).toUpperCase());
  const [saved, setSaved]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('fd2-cpicker-saved') || '[]'); } catch { return []; }
  });

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

  const saveSwatch = () => {
    const next = [hex, ...saved.filter(c => c.toLowerCase() !== hex.toLowerCase())].slice(0, 8);
    setSaved(next);
    localStorage.setItem('fd2-cpicker-saved', JSON.stringify(next));
  };

  const specRef = useRef();
  const dotRef = useRef();

  // sync dot position to sat/val when those change from outside (tab switch, hex input, etc.)
  useEffect(() => {
    if (dotRef.current && specRef.current) {
      const w = specRef.current.offsetWidth;
      const h = specRef.current.offsetHeight;
      dotRef.current.style.transform = `translate(${sat / 100 * w}px, ${(1 - val / 100) * h}px)`;
    }
  }, [sat, val]);

  const handleSpec = useCallback((e) => {
    if (!specRef.current || !dotRef.current) return;
    const rect = specRef.current.getBoundingClientRect();
    const sx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const sy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    // update dot position instantly via transform — React never touches this property
    dotRef.current.style.transform = `translate(${(sx * rect.width).toFixed(1)}px, ${(sy * rect.height).toFixed(1)}px)`;
    startTransition(() => fromHsv(hue, sx * 100, (1 - sy) * 100));
  }, [hue, fromHsv]);

  const onSpecDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); handleSpec(e); };
  const onSpecMove = (e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) handleSpec(e); };

  const hueColor = `hsl(${hue}, 100%, 50%)`;

  useEffect(() => { onChange(hex); }, [hex]); // eslint-disable-line react-hooks/exhaustive-deps

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
              <div ref={dotRef} className="cpicker-dot" style={{ background: hex }} />
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
              <span className="cpicker-hex-label">Display P3<br/>Hex-kleurcode</span>
              <input className="cpicker-hex" value={hexInput} maxLength={6} onChange={e => fromHex(e.target.value)} />
            </div>
          </div>
        )}

        <div className="cpicker-bottom">
          <div className="cpicker-preview" style={{ background: hex }} />
          <div className="cpicker-saved-row">
            {saved.map((c, i) => (
              <button key={i} className="cpicker-saved-dot" style={{ background: c }}
                onClick={() => { const rgb = hexToRgb(c); fromRgb(rgb.r, rgb.g, rgb.b); }}
                title={c}
              />
            ))}
            <button className="cpicker-add-btn" onClick={saveSwatch} title="Kleur opslaan">+</button>
          </div>
        </div>
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

/* ══════════════════════════════════════════
   BACKGROUND SECTION
══════════════════════════════════════════ */
const BG_PRESETS = [
  { id: 'default', label: 'Standaard' },
  { id: 'hero',    label: 'Hero'      },
  { id: 'sunset',  label: 'Sunset'    },
  { id: 'ocean',   label: 'Ocean'     },
  { id: 'aurora',  label: 'Aurora'    },
  { id: 'minimal', label: 'Minimal'   },
];

function BgPresetCard({ preset, active, onClick, customThumb }) {
  return (
    <button
      className={`bg-preset-card${active ? ' selected' : ''}`}
      onClick={onClick}
      title={preset.label}
    >
      {preset.id === 'custom' && customThumb
        ? <img src={customThumb} className="bg-preset-thumb" alt="Custom" />
        : <div className={`bg-preset-thumb bg-preset-${preset.id}`} />
      }
      <span className="bg-preset-label">{preset.label}</span>
    </button>
  );
}

function BackgroundSection() {
  const {
    bgPreset, setBgPreset, bgCustomImage, setBgCustomImage,
    bgBlurEnabled, setBgBlurEnabled, bgBlurIntensity, setBgBlurIntensity,
  } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Alleen afbeeldingsbestanden worden ondersteund.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Bestand te groot (max 5 MB).');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setBgCustomImage(e.target.result);
      setBgPreset('custom');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleReset = () => {
    setBgPreset('default');
    setBgCustomImage('');
    setBgBlurEnabled(false);
    setBgBlurIntensity(40);
  };

  const allPresets = [
    ...BG_PRESETS,
    { id: 'custom', label: 'Aangepast' },
  ];

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Achtergrond</h2>
        <p className="darwin-section-desc">Kies een achtergrond voor het volledige dashboard.</p>
      </div>

      <div className="darwin-section-block">
        <div className="bg-preset-grid">
          {BG_PRESETS.map(p => (
            <BgPresetCard
              key={p.id}
              preset={p}
              active={bgPreset === p.id}
              onClick={() => setBgPreset(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="darwin-section-block">
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Aangepaste afbeelding
        </h3>
        <div
          className={`bg-upload-zone${dragOver ? ' drag-over' : ''}${bgCustomImage ? ' has-image' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {bgCustomImage ? (
            <>
              <img src={bgCustomImage} className="bg-upload-preview" alt="Achtergrond preview" />
              <div className="bg-upload-overlay">
                <SFIcon name="icloud.and.arrow.up.svg" size={24} color="white" />
                <span>Vervang afbeelding</span>
              </div>
            </>
          ) : (
            <>
              <SFIcon name="photo.on.rectangle.svg" size={32} color="var(--text-muted)" />
              <div className="bg-upload-text">
                <span className="bg-upload-primary">Sleep je afbeelding hierheen</span>
                <span className="bg-upload-secondary">of klik om te selecteren · JPG, PNG, WEBP · Max 5 MB</span>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
        {uploadError && <p className="bg-upload-error">{uploadError}</p>}
        {bgCustomImage && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="bg-reset-btn"
              style={{ fontSize: 12 }}
              onClick={e => { e.stopPropagation(); setBgPreset('custom'); }}
            >
              Gebruik als achtergrond
            </button>
            <button
              className="bg-reset-btn"
              style={{ fontSize: 12 }}
              onClick={e => { e.stopPropagation(); setBgCustomImage(''); if (bgPreset === 'custom') setBgPreset('default'); }}
            >
              Verwijder
            </button>
          </div>
        )}
      </div>

      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Glassmorphism Blur</div>
            <div className="darwin-row-sub">Voeg een blur-effect toe aan de achtergrond</div>
          </div>
          <Toggle checked={bgBlurEnabled} onChange={setBgBlurEnabled} />
        </div>
        {bgBlurEnabled && (
          <>
            <div className="darwin-card-divider" />
            <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="darwin-row-label" style={{ fontWeight: 400 }}>Intensiteit</div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{bgBlurIntensity}%</span>
              </div>
              <Slider value={bgBlurIntensity} onChange={setBgBlurIntensity} min={0} max={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Licht</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Zwaar</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="darwin-section-block" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="bg-reset-btn" onClick={handleReset}>
          Herstel naar standaard
        </button>
      </div>
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
    hoverEffect, setHoverEffect, hoverEffectEnabled, setHoverEffectEnabled, hoverEffectSpeed, setHoverEffectSpeed,
    revealEffect, setRevealEffect, revealEffectEnabled, setRevealEffectEnabled, revealEffectSpeed, setRevealEffectSpeed,
    trafficLightIcons, setTrafficLightIcons,
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

      {/* ── Window Buttons ── */}
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Window Buttons</h2>
        <p className="darwin-section-desc">Show icons on traffic light buttons when hovering.</p>
      </div>
      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Traffic Light Icons</div>
            <div className="darwin-row-sub">Show ✕ − ↗ icons on hover over window buttons</div>
          </div>
          <Toggle checked={trafficLightIcons} onChange={setTrafficLightIcons} />
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
            <div className="darwin-card-divider" />
            <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="darwin-row-label" style={{ fontWeight: 400 }}>Snelheid</div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{hoverEffectSpeed}%</span>
              </div>
              <Slider value={hoverEffectSpeed} onChange={setHoverEffectSpeed} min={0} max={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Traag</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Snel</span>
              </div>
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
            <div className="darwin-card-divider" />
            <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="darwin-row-label" style={{ fontWeight: 400 }}>Snelheid</div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{revealEffectSpeed}%</span>
              </div>
              <Slider value={revealEffectSpeed} onChange={setRevealEffectSpeed} min={0} max={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Traag</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Snel</span>
              </div>
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
  const { fontFamily, setFontFamily, boldText, setBoldText, boldWeight, setBoldWeight, fontSize, setFontSize, uiZoom, setUiZoom, allCaps, setAllCaps } = useApp();
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

      {/* UI zoom slider */}
      <div className="darwin-section-block darwin-card-block" style={{ marginTop: 12 }}>
        <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="darwin-row-label">{t('s_ui_zoom')}</div>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{uiZoom}%</span>
          </div>
          <Slider value={uiZoom} onChange={setUiZoom} min={70} max={130} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>−</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>+</span>
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
   VISUAL EFFECTS SECTION (Liquid Glass)
══════════════════════════════════════════ */
const LG_VARIANTS = [
  { id: 'iridescent',    label: 'Iridescent',    preview: 'linear-gradient(135deg,rgba(255,200,255,0.7),rgba(180,220,255,0.7))' },
  { id: 'dark-fluid',    label: 'Dark Fluid',    preview: 'linear-gradient(135deg,#08080c,#1a1a2e)' },
  { id: 'abstract',      label: 'Abstract',      preview: 'linear-gradient(120deg,rgba(255,140,80,0.7),rgba(80,80,255,0.7))' },
  { id: 'liquid-ripple', label: 'Liquid Ripple', preview: 'linear-gradient(120deg,rgba(60,200,255,0.6),rgba(120,240,200,0.6))' },
  { id: 'matte-glass',   label: 'Matte Glass',   preview: 'linear-gradient(135deg,rgba(235,235,240,0.8),rgba(210,210,220,0.8))' },
  { id: 'wazig',         label: 'Wazig',         preview: 'linear-gradient(135deg,rgba(248,248,250,0.6),rgba(200,220,240,0.6))' },
];

function VisualEffectsSection() {
  const { lgEnabled, setLgEnabled, lgVariant, setLgVariant, lgIntensity, setLgIntensity } = useApp();

  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Visuele Effecten</h2>
        <p className="darwin-section-desc">Liquid Glass geeft widgets een doorschijnend glazen uiterlijk.</p>
      </div>

      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Liquid Glass</div>
            <div className="darwin-row-sub">Glasachtig uiterlijk voor alle widgets</div>
          </div>
          <Toggle checked={lgEnabled} onChange={setLgEnabled} />
        </div>
      </div>

      {lgEnabled && (
        <>
          <div className="darwin-section-block">
            <div className="darwin-row-label" style={{ marginBottom: 12 }}>Variant</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {LG_VARIANTS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setLgVariant(v.id)}
                  style={{
                    background: v.preview,
                    border: lgVariant === v.id
                      ? '2px solid var(--accent)'
                      : '2px solid var(--border)',
                    borderRadius: 'var(--radius-panel)',
                    height: 72,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '8px 10px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: lgVariant === v.id ? '0 0 0 3px var(--accent-light)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#fff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    lineHeight: 1.2,
                  }}>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="darwin-section-block darwin-card-block">
            <div className="darwin-card-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="darwin-row-label">Intensiteit</div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{lgIntensity}%</span>
              </div>
              <Slider value={lgIntensity} onChange={setLgIntensity} min={0} max={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Subtiel</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Intens</span>
              </div>
            </div>
          </div>
        </>
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
    case 'background':    return <BackgroundSection />;
    case 'visual_effects':return <VisualEffectsSection />;
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
  const { privateMode, setPrivateMode, trafficLightIcons } = useApp();
  const navigate = useNavigate();
  const t = useT();

  return (
    <div className="darwin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="darwin-window">
        <div className="darwin-titlebar">
          <div className={`darwin-traffic-lights${trafficLightIcons ? ' darwin-tl-icons' : ''}`}>
            <button className="darwin-tl darwin-tl-red"    onClick={onClose} title="Close"><span className="darwin-tl-icon">✕</span></button>
            <button className="darwin-tl darwin-tl-yellow" title="Minimise"><span className="darwin-tl-icon">−</span></button>
            <button className="darwin-tl darwin-tl-green"  title="Maximise"><span className="darwin-tl-icon">↗</span></button>
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
