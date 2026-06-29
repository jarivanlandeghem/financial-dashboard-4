import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from '../components/SFIcon';
import CategoryIcon from '../components/CategoryIcon';
import MonthSelector from '../components/MonthSelector';
import PeriodDropdown from '../components/PeriodDropdown';

// ─── Status badge helpers ───────────────────────────────────────────────────

const STATUS = {
  system:   { label: 'Squircle systeem',   color: '#34C759', bg: 'rgba(52,199,89,0.12)'   },
  fallback: { label: 'data-squircle-r',    color: '#FF9500', bg: 'rgba(255,149,0,0.12)'   },
  css:      { label: 'CSS border-radius',  color: '#007AFF', bg: 'rgba(0,122,255,0.10)'   },
  native:   { label: 'Native (browser)',   color: '#8E8E93', bg: 'rgba(142,142,147,0.12)' },
  none:     { label: 'Geen radius',        color: '#8E8E93', bg: 'rgba(142,142,147,0.12)' },
};

function StatusBadge({ type }) {
  const s = STATUS[type] || STATUS.none;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 8px',
      background: s.bg, color: s.color,
      borderRadius: 20, letterSpacing: 0.2,
    }}>
      {s.label}
    </span>
  );
}

// ─── Component block ────────────────────────────────────────────────────────

function ComponentBlock({ title, description, status, cssClass, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        <StatusBadge type={status} />
        {cssClass && (
          <code style={{
            fontSize: 11, padding: '2px 7px',
            background: 'var(--bg-primary)', color: 'var(--text-secondary)',
            borderRadius: 6, border: '1px solid var(--border)',
          }}>
            .{cssClass}
          </code>
        )}
      </div>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      <div style={{
        padding: '24px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 56 }}>
      <h2 style={{
        fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
        marginBottom: 4, paddingBottom: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h2>
      <div style={{ marginTop: 24 }}>
        {children}
      </div>
    </section>
  );
}

// ─── NAV DATA ────────────────────────────────────────────────────────────────

const NAV = [
  {
    group: 'Foundations',
    icon: 'square.stack.3d.up.svg',
    items: [
      { id: 'squircle', label: 'Squircle Engine' },
      { id: 'tokens',   label: 'Design Tokens' },
    ],
  },
  {
    group: 'Actions',
    icon: 'hand.tap.svg',
    items: [
      { id: 'buttons',  label: 'Buttons' },
      { id: 'badges',   label: 'Badges' },
    ],
  },
  {
    group: 'Layout',
    icon: 'rectangle.3.group.svg',
    items: [
      { id: 'cards',    label: 'Cards' },
      { id: 'modals',   label: 'Modals' },
      { id: 'sidebar',  label: 'Sidebar & Nav' },
    ],
  },
  {
    group: 'Form Controls',
    icon: 'slider.horizontal.3.svg',
    items: [
      { id: 'inputs',   label: 'Inputs & Selects' },
      { id: 'period',   label: 'Period & Month' },
    ],
  },
  {
    group: 'Data & Icons',
    icon: 'chart.bar.svg',
    items: [
      { id: 'icons',    label: 'SF Icons' },
      { id: 'category', label: 'Category Icons' },
      { id: 'charts',   label: 'Charts & Tooltips' },
    ],
  },
];

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function UIComponents() {
  const navigate = useNavigate();
  const { darkMode } = useApp();
  const [openGroups, setOpenGroups] = useState(() => new Set(NAV.map(n => n.group)));
  const [active, setActive] = useState('squircle');

  const toggleGroup = (group) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100vw', height: '100dvh', overflow: 'hidden',
      background: 'var(--bg-primary)',
      fontFamily: 'var(--font-family)',
      color: 'var(--text-primary)',
    }}>

      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <div style={{
        height: 48, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/')}
          data-squircle-r={8}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px',
            background: 'none', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)',
          }}
        >
          <SFIcon name="chevron.left.svg" size={12} color="var(--text-muted)" />
          Hub
        </button>

        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        <span style={{ fontSize: 14, fontWeight: 600 }}>UI Components</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Live — wijzigingen in de repo verschijnen hier automatisch
          </span>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759' }} />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflowY: 'auto',
          padding: '12px 8px',
        }}>
          {NAV.map(({ group, icon, items }) => (
            <div key={group} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggleGroup(group)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '6px 8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderRadius: 6,
                  color: 'var(--text-muted)', fontSize: 11, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 0.6,
                  textAlign: 'left',
                }}
              >
                <SFIcon name={icon} size={12} color="var(--text-muted)" />
                <span style={{ flex: 1 }}>{group}</span>
                <SFIcon
                  name="chevron.down.svg"
                  size={10}
                  color="var(--text-muted)"
                  style={{
                    transform: openGroups.has(group) ? 'none' : 'rotate(-90deg)',
                    transition: 'transform 0.15s',
                  }}
                />
              </button>
              {openGroups.has(group) && items.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={active === item.id ? 'nav-item' : undefined}
                  data-squircle-r={active === item.id ? undefined : 8}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 12px 6px 28px',
                    background: active === item.id ? 'var(--accent-light)' : 'none',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13,
                    color: active === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: active === item.id ? 600 : 400,
                    marginBottom: 1,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '40px 48px',
          maxWidth: 820,
        }}>

          {/* ── SQUIRCLE ENGINE ────────────────────────────────────────── */}
          <Section id="squircle" title="Squircle Engine">
            <ComponentBlock
              title="Hoe het werkt"
              description="squircleInit.js scant het DOM via ResizeObserver + MutationObserver. Elke CSS-klasse in CLASS_RADIUS_MAP krijgt automatisch een Apple UICornerCurve.continuous clip-path (figma-squircle, cornerSmoothing=0.6)."
              status="none"
            >
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[4, 8, 12, 16, 20, 24].map(r => (
                  <div key={r} style={{ textAlign: 'center' }}>
                    <div data-squircle-r={r} style={{
                      width: 64, height: 64, margin: '0 auto 8px',
                      background: 'var(--accent-light)',
                      border: '1.5px solid var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{r}</span>
                    </div>
                    <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>r={r}</code>
                  </div>
                ))}
              </div>
            </ComponentBlock>
          </Section>

          {/* ── TOKENS ─────────────────────────────────────────────────── */}
          <Section id="tokens" title="Design Tokens">
            <ComponentBlock title="Kleuren" description="CSS variabelen uit index.css" status="none">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { name: '--accent', val: '#007AFF' },
                  { name: '--green', val: '#34C759' },
                  { name: '--red', val: '#FF3B30' },
                  { name: '--yellow', val: '#FF9500' },
                ].map(t => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.val, border: '1px solid var(--border)' }} />
                    <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.name}</code>
                  </div>
                ))}
              </div>
            </ComponentBlock>
            <ComponentBlock title="Oppervlakken" status="none">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
                {['--bg-primary', '--bg-card', '--bg-card-solid', '--glass-bg'].map(v => (
                  <div key={v} style={{
                    padding: '8px 12px', background: `var(${v})`,
                    border: '1px solid var(--border)', borderRadius: 8,
                  }}>
                    <code style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</code>
                  </div>
                ))}
              </div>
            </ComponentBlock>
          </Section>

          {/* ── BUTTONS ────────────────────────────────────────────────── */}
          <Section id="buttons" title="Buttons">
            <ComponentBlock
              title="Primaire knop"
              description="Hoofd-actie knop. Squircle r=20 via CLASS_RADIUS_MAP."
              status="system"
              cssClass="btn btn-primary"
            >
              <button className="btn btn-primary">Opslaan</button>
              <button className="btn btn-primary">
                <SFIcon name="plus.svg" size={14} color="currentColor" /> Toevoegen
              </button>
              <button className="btn btn-primary" disabled>Uitgeschakeld</button>
            </ComponentBlock>

            <ComponentBlock
              title="Ghost knop"
              description="Secundaire actie, transparante achtergrond."
              status="system"
              cssClass="btn btn-ghost"
            >
              <button className="btn btn-ghost">Annuleer</button>
              <button className="btn btn-ghost">
                <SFIcon name="square.and.arrow.down.svg" size={14} color="currentColor" /> Exporteer
              </button>
            </ComponentBlock>

            <ComponentBlock
              title="Danger knop"
              description="Destructieve actie (verwijderen)."
              status="system"
              cssClass="btn btn-danger"
            >
              <button className="btn btn-danger">
                <SFIcon name="trash.svg" size={13} color="currentColor" /> Verwijder
              </button>
            </ComponentBlock>

            <ComponentBlock
              title="Icon knop"
              description="Knop met alleen een icoon."
              status="system"
              cssClass="btn-icon"
            >
              <button className="btn-icon">
                <SFIcon name="gear.svg" size={16} color="var(--text-secondary)" />
              </button>
              <button className="btn-icon">
                <SFIcon name="moon.svg" size={16} color="var(--text-secondary)" />
              </button>
            </ComponentBlock>
          </Section>

          {/* ── BADGES ─────────────────────────────────────────────────── */}
          <Section id="badges" title="Badges">
            <ComponentBlock
              title="Badge"
              description="Status- of informatielabel. Squircle r=20 via CLASS_RADIUS_MAP."
              status="system"
              cssClass="badge"
            >
              <span className="badge">Standaard</span>
              <span className="badge badge-blue">Blauw</span>
              <span className="badge" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>Succes</span>
              <span className="badge" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>Fout</span>
              <span className="badge" style={{ background: 'var(--yellow-light)', color: 'var(--yellow)' }}>Waarschuwing</span>
              <span className="badge">Recurring</span>
            </ComponentBlock>
          </Section>

          {/* ── CARDS ──────────────────────────────────────────────────── */}
          <Section id="cards" title="Cards">
            <ComponentBlock
              title="Card"
              description="Standaard content container. Squircle r=20."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ padding: '16px 20px', minWidth: 200 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Totaal saldo</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>€ 12.450,00</div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Stat card"
              description="KPI-stijl kaart met label + waarde + optionele trend."
              status="system"
              cssClass="stat-card"
            >
              <div className="stat-card">
                <div className="stat-label">Maandelijks inkomen</div>
                <div className="stat-value">€ 3.200</div>
                <div className="stat-change positive">+12% vs vorige maand</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Uitgaven</div>
                <div className="stat-value" style={{ color: 'var(--red)' }}>€ 1.840</div>
                <div className="stat-change negative">-5% vs vorige maand</div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Hub card"
              description="Grote navigatiekaart op de Hub pagina. Squircle r=20."
              status="system"
              cssClass="hub-card"
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                (Zie de Hub pagina voor live voorbeeld)
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Transaction card"
              description="Transactierij met uitklapbare accordion. Flat-bottom variant wanneer open."
              status="system"
              cssClass="tx-card"
            >
              <div style={{ width: '100%' }}>
                <div className="tx-card" style={{ pointerEvents: 'none' }}>
                  <CategoryIcon category="groceries" size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Colruyt</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Boodschappen · KBC</div>
                  </div>
                  <div className="amount-negative" style={{ fontSize: 15 }}>-€45,30</div>
                </div>
              </div>
            </ComponentBlock>
          </Section>

          {/* ── MODALS ─────────────────────────────────────────────────── */}
          <Section id="modals" title="Modals">
            <ComponentBlock
              title="Modal"
              description="Gecentreerde overlay. Squircle r=24. Altijd via .modal klasse."
              status="system"
              cssClass="modal"
            >
              <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', borderRadius: 8 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div className="modal" style={{ position: 'relative', width: 260, padding: '20px 24px', pointerEvents: 'none' }}>
                    <div className="modal-title" style={{ marginBottom: 12 }}>Modal titel</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Modal inhoud hier.</div>
                    <div className="modal-actions">
                      <button className="btn btn-ghost" style={{ fontSize: 12 }}>Annuleer</button>
                      <button className="btn btn-primary" style={{ fontSize: 12 }}>Bevestig</button>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentBlock>
          </Section>

          {/* ── SIDEBAR & NAV ──────────────────────────────────────────── */}
          <Section id="sidebar" title="Sidebar & Nav">
            <ComponentBlock
              title="Nav item"
              description="Navigatierij in de zijbalk. Squircle r=8."
              status="system"
              cssClass="nav-item"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 200 }}>
                <div className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--accent-light)', cursor: 'default' }}>
                  <SFIcon name="chart.bar.xaxis.ascending.svg" size={16} color="var(--accent)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Dashboard</span>
                </div>
                <div data-squircle-r={8} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'default' }}>
                  <SFIcon name="arrow.left.arrow.right.svg" size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Transacties</span>
                </div>
                <div data-squircle-r={8} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'default' }}>
                  <SFIcon name="chart.line.uptrend.xyaxis.svg" size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Investeringen</span>
                </div>
              </div>
            </ComponentBlock>
          </Section>

          {/* ── INPUTS ─────────────────────────────────────────────────── */}
          <Section id="inputs" title="Inputs & Selects">
            <ComponentBlock
              title="Input veld"
              description="Native <input> — CSS border-radius (clip-path werkt niet op native form elementen). Gebruik altijd een wrapper-div met data-squircle-r voor de container."
              status="native"
              cssClass="input"
            >
              <input className="input" placeholder="Zoek transacties..." style={{ maxWidth: 260 }} />
              <input className="input" type="number" placeholder="Bedrag" style={{ maxWidth: 140 }} />
            </ComponentBlock>

            <ComponentBlock
              title="Input met squircle wrapper"
              description="Native input inside wrapper-div — de wrapper krijgt de squircle, de input krijgt borderRadius:0."
              status="fallback"
            >
              <div data-squircle-r={20} style={{ position: 'relative', display: 'inline-flex', minWidth: 260 }}>
                <SFIcon name="magnifyingglass.svg" size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                <input className="input" style={{ paddingLeft: 34, borderRadius: 0, width: '100%' }} placeholder="Zoek met squircle wrapper..." />
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Select"
              description="Native <select> — zelfde beperking als input. Wrapper-div patroon."
              status="native"
              cssClass="input"
            >
              <div data-squircle-r={20} style={{ display: 'inline-flex' }}>
                <select className="input" style={{ borderRadius: 0 }}>
                  <option>Alle categorieën</option>
                  <option>Boodschappen</option>
                  <option>Transport</option>
                </select>
              </div>
            </ComponentBlock>
          </Section>

          {/* ── PERIOD & MONTH ─────────────────────────────────────────── */}
          <Section id="period" title="Period & Month">
            <ComponentBlock
              title="PeriodDropdown"
              description="Trigger en dropdown panel via data-squircle-r. Menu-items r=12."
              status="fallback"
            >
              <PeriodDropdown />
            </ComponentBlock>

            <ComponentBlock
              title="MonthSelector"
              description="Wrapper en chevron-knoppen via data-squircle-r=20. TODAY badge r=12."
              status="fallback"
            >
              <MonthSelector />
            </ComponentBlock>
          </Section>

          {/* ── SF ICONS ───────────────────────────────────────────────── */}
          <Section id="icons" title="SF Icons">
            <ComponentBlock
              title="SFIcon component"
              description="SVG mask-image techniek. Kleur via background property. Geen radius nodig."
              status="none"
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {[
                  'chart.bar.xaxis.ascending.svg',
                  'arrow.left.arrow.right.svg',
                  'chart.line.uptrend.xyaxis.svg',
                  'person.2.svg',
                  'moon.svg',
                  'sun.max.svg',
                  'gear.svg',
                  'plus.svg',
                  'trash.svg',
                  'magnifyingglass.svg',
                  'chevron.right.svg',
                  'square.and.arrow.down.svg',
                ].map(name => (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <SFIcon name={name} size={22} color="var(--text-primary)" />
                    <code style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 80, wordBreak: 'break-all' }}>
                      {name.replace('.svg', '')}
                    </code>
                  </div>
                ))}
              </div>
            </ComponentBlock>
          </Section>

          {/* ── CATEGORY ICONS ─────────────────────────────────────────── */}
          <Section id="category" title="Category Icons">
            <ComponentBlock
              title="CategoryIcon"
              description="Icoon met gekleurde achtergrond. Squircle r=8 via .cat-icon klasse."
              status="system"
              cssClass="cat-icon"
            >
              {['groceries', 'transport', 'dining', 'entertainment', 'health', 'utilities', 'shopping', 'income'].map(cat => (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <CategoryIcon category={cat} size={40} />
                  <code style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cat}</code>
                </div>
              ))}
            </ComponentBlock>
          </Section>

          {/* ── CHARTS ─────────────────────────────────────────────────── */}
          <Section id="charts" title="Charts & Tooltips">
            <ComponentBlock
              title="Chart tooltip"
              description="Recharts custom tooltip. Squircle r=8 via .chart-tooltip klasse."
              status="system"
              cssClass="chart-tooltip"
            >
              <div className="chart-tooltip" style={{ pointerEvents: 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Januari</div>
                <div style={{ fontSize: 13, color: 'var(--accent)' }}>€ 3.200</div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Recharts bibliotheek"
              description="AreaChart, PieChart, BarChart — via Recharts. Kleuren zijn hardcoded hex in de dataviz arrays (nog geen token)."
              status="none"
            >
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Zie Dashboard, Investments en Statistics voor live chart-voorbeelden.
              </div>
            </ComponentBlock>
          </Section>

        </main>
      </div>
    </div>
  );
}
