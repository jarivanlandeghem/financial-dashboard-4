import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from './SFIcon';

const SECTIONS = [
  { id: 'appearance',   label: 'Appearance',    icon: 'paintbrush.svg'      },
  { id: 'accent',       label: 'Accent Color',  icon: 'paintpalette.svg'    },
  { id: 'animations',   label: 'Animations',    icon: 'gauge.with.needle.svg' },
  { id: 'accessibility',label: 'Accessibility', icon: 'accessibility.svg'   },
  { id: 'about',        label: 'About',         icon: 'info.app.svg'        },
];

const ACCENT_COLORS = [
  { label: 'Blue',    val: '#007AFF', rgb: '0,122,255'   },
  { label: 'Purple',  val: '#AF52DE', rgb: '175,82,222'  },
  { label: 'Pink',    val: '#FF2D55', rgb: '255,45,85'   },
  { label: 'Red',     val: '#FF3B30', rgb: '255,59,48'   },
  { label: 'Orange',  val: '#FF9500', rgb: '255,149,0'   },
  { label: 'Yellow',  val: '#FFCC00', rgb: '255,204,0'   },
  { label: 'Green',   val: '#34C759', rgb: '52,199,89'   },
  { label: 'Teal',    val: '#5AC8FA', rgb: '90,200,250'  },
  { label: 'Graphite',val: '#8E8E93', rgb: '142,142,147' },
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

function AccentSection() {
  const [selected, setSelected] = useState('#007AFF');
  return (
    <div className="darwin-section-content">
      <div className="darwin-section-block">
        <h2 className="darwin-section-title">Accent Color</h2>
        <p className="darwin-section-desc">Choose the accent color used across the interface.</p>
        <div className="darwin-accent-grid">
          {ACCENT_COLORS.map(c => (
            <div key={c.val} className="darwin-accent-item" onClick={() => setSelected(c.val)}>
              <div
                className={`darwin-accent-dot${selected === c.val ? ' selected' : ''}`}
                style={{ background: c.val, outlineColor: c.val }}
              />
              <span className="darwin-accent-label">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="darwin-section-block darwin-card-block">
        <div className="darwin-card-row">
          <div>
            <div className="darwin-row-label">Highlight Color</div>
            <div className="darwin-row-sub">Used for text selection</div>
          </div>
          <div className="darwin-color-preview" style={{ background: selected }} />
        </div>
      </div>
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
