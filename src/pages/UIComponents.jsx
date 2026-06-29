import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SFIcon from '../components/SFIcon';
import CategoryIcon from '../components/CategoryIcon';
import MonthSelector from '../components/MonthSelector';
import PeriodDropdown from '../components/PeriodDropdown';
import HealthScore from '../components/HealthScore';
import MonthlySummary from '../components/MonthlySummary';
import { CATEGORIES } from '../data/mockData';

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
  {
    group: 'Widgets',
    icon: 'square.grid.2x2.svg',
    items: [
      { id: 'widget-system',   label: 'Widget Systeem' },
      { id: 'widget-stat',     label: 'Stat Widgets' },
      { id: 'widget-list',     label: 'Lijst Widgets' },
      { id: 'widget-chart',    label: 'Chart Widgets' },
      { id: 'widget-progress', label: 'Progress Widgets' },
      { id: 'widget-picker',   label: 'Widget Picker' },
    ],
  },
];

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function UIComponents() {
  const navigate = useNavigate();
  const { darkMode } = useApp();
  const mainRef = useRef(null);

  // Active group drives which sections are visible
  const [activeGroup, setActiveGroup] = useState('Foundations');
  const [active, setActive] = useState('squircle');

  const currentGroupItems = NAV.find(n => n.group === activeGroup)?.items ?? [];

  // Click nav item: switch group if needed, then scroll
  const scrollTo = useCallback((id, group) => {
    if (group && group !== activeGroup) {
      setActiveGroup(group);
      setActive(id);
      // Wait for render then scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          mainRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    } else {
      setActive(id);
      mainRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeGroup]);

  // Click group header: switch group, activate first item
  const selectGroup = useCallback((group) => {
    const items = NAV.find(n => n.group === group)?.items ?? [];
    setActiveGroup(group);
    setActive(items[0]?.id ?? '');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mainRef.current?.scrollTo({ top: 0 });
      });
    });
  }, []);

  // Scroll spy: update active item as user scrolls
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const onScroll = () => {
      const ids = currentGroupItems.map(i => i.id);
      let current = ids[0];
      for (const id of ids) {
        const el = container.querySelector(`#${id}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
        if (top <= 80) current = id;
      }
      setActive(current);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [currentGroupItems]);

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
          {NAV.map(({ group, icon, items }) => {
            const isActive = group === activeGroup;
            return (
              <div key={group} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => selectGroup(group)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '6px 8px',
                    background: isActive ? 'var(--accent-light)' : 'none',
                    border: 'none', cursor: 'pointer',
                    borderRadius: 6,
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.6,
                    textAlign: 'left',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  <SFIcon name={icon} size={12} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                  <span style={{ flex: 1 }}>{group}</span>
                  <SFIcon
                    name="chevron.right.svg"
                    size={10}
                    color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                    style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
                  />
                </button>
                {isActive && items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id, group)}
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
            );
          })}
        </aside>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <main ref={mainRef} style={{
          flex: 1, overflowY: 'auto',
          padding: '40px 48px',
          maxWidth: 820,
        }}>

          {/* ── FOUNDATIONS ────────────────────────────────────────────── */}
          {activeGroup === 'Foundations' && <><Section id="squircle" title="Squircle Engine">
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

          </>}

          {/* ── ACTIONS ────────────────────────────────────────────────── */}
          {activeGroup === 'Actions' && <><Section id="buttons" title="Buttons">
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

          </>}

          {/* ── LAYOUT ─────────────────────────────────────────────────── */}
          {activeGroup === 'Layout' && <><Section id="cards" title="Cards">
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

          </>}

          {/* ── FORM CONTROLS ──────────────────────────────────────────── */}
          {activeGroup === 'Form Controls' && <><Section id="inputs" title="Inputs & Selects">
            <ComponentBlock
              title="Input veld"
              description="Native <input> heeft geen radius — de squircle zit op de .input-wrap container (r=20 via CLASS_RADIUS_MAP). clip-path werkt niet op native form elementen."
              status="system"
              cssClass="input-wrap"
            >
              <div className="input-wrap" style={{ maxWidth: 260 }}><input className="input" placeholder="Zoek transacties..." /></div>
              <div className="input-wrap" style={{ maxWidth: 140 }}><input className="input" type="number" placeholder="Bedrag" /></div>
            </ComponentBlock>

            <ComponentBlock
              title="Input met zoekicoon"
              description="input-wrap met een absoluut gepositioneerd icoon erin."
              status="system"
              cssClass="input-wrap"
            >
              <div className="input-wrap" style={{ position: 'relative', minWidth: 260 }}>
                <SFIcon name="magnifyingglass.svg" size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                <input className="input" style={{ paddingLeft: 34 }} placeholder="Zoek met squircle wrapper..." />
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Select"
              description="Native <select> — clip-path werkt niet op native form elementen, dus de wrapper (input-wrap) krijgt de squircle."
              status="system"
              cssClass="input-wrap"
            >
              <div className="input-wrap" style={{ display: 'inline-flex' }}>
                <select className="input" style={{ width: 'auto' }}>
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

          </>}

          {/* ── DATA & ICONS ───────────────────────────────────────────── */}
          {activeGroup === 'Data & Icons' && <><Section id="icons" title="SF Icons">
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

          </>}

          {/* ── WIDGETS ────────────────────────────────────────────────── */}
          {activeGroup === 'Widgets' && <><Section id="widget-system" title="Widget Systeem">
            <ComponentBlock
              title="Radius — via squircle engine"
              description="Alle widget-gerelateerde radii zitten in CLASS_RADIUS_MAP in squircleInit.js. Niets hieronder mag zelf border-radius bevatten."
              status="system"
            >
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
                {[
                  { cls: 'widget-rgl',             r: 20, desc: 'Widget container' },
                  { cls: 'widget-rgl-content',      r: 20, desc: 'Content wrapper' },
                  { cls: 'widget-dnd',              r: 20, desc: 'Drag-and-drop zone' },
                  { cls: 'widget-add-placeholder',  r: 20, desc: 'Lege slot' },
                  { cls: 'widget-edit-banner',      r: 20, desc: 'Edit mode banner' },
                  { cls: 'widget-resize-label',     r: 20, desc: 'Resize label' },
                  { cls: 'widget-drag-grip',        r:  8, desc: 'Drag grip' },
                  { cls: 'widget-drag-handle',      r:  8, desc: 'Drag handle' },
                  { cls: 'widget-resize-handle',    r:  4, desc: 'Resize handle' },
                  { cls: 'react-grid-item',         r: 20, desc: 'RGL grid item' },
                  { cls: 'react-grid-placeholder',  r: 20, desc: 'Drop placeholder' },
                  { cls: 'widget-picker-item',      r: 20, desc: 'Picker item' },
                ].map(({ cls, r, desc }) => (
                  <div key={cls} style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <code style={{ fontSize: 10, color: 'var(--accent)', display: 'block', marginBottom: 2 }}>.{cls}</code>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{desc} — r={r}</span>
                  </div>
                ))}
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Widget wrapper (widget-rgl)"
              description="Elke widget zit in een .widget-rgl container. In edit-mode verschijnen drag-handle en remove-badge."
              status="system"
              cssClass="widget-rgl"
            >
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Normal mode */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Normaal</div>
                  <div className="widget-rgl" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="widget-rgl-content">
                      <div className="card" style={{ margin: 0 }}>
                        <div className="section-header"><span className="section-title">Widget</span></div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Content hier</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Edit mode */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Edit mode</div>
                  <div className="widget-rgl edit-mode" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="widget-edit-banner" style={{ position: 'absolute', top: 6, left: 6, right: 6, zIndex: 2, padding: '4px 8px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent)' }}>
                      <SFIcon name="move.3d.svg" size={11} color="var(--accent)" /> Sleep om te verplaatsen
                    </div>
                    <div className="widget-rgl-content" style={{ opacity: 0.5, marginTop: 28 }}>
                      <div className="card" style={{ margin: 0 }}>
                        <div className="section-header"><span className="section-title">Widget</span></div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Content hier</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Widget catalogue"
              description="17 widget-types beschikbaar, gegroepeerd per categorie."
              status="none"
            >
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'income',        icon: 'chart.line.uptrend.xyaxis.svg', name: 'Inkomen',       cat: 'Finance'       },
                  { id: 'spent',         icon: 'chart.bar.svg',                 name: 'Uitgaven',      cat: 'Finance'       },
                  { id: 'net-savings',   icon: 'banknote.svg',                  name: 'Netto',         cat: 'Finance'       },
                  { id: 'investments',   icon: 'briefcase.svg',                 name: 'Beleggingen',   cat: 'Finance'       },
                  { id: 'health',        icon: 'heart.svg',                     name: 'Gezondheid',    cat: 'Finance'       },
                  { id: 'summary',       icon: 'brain.svg',                     name: 'Samenvatting',  cat: 'Finance'       },
                  { id: 'income-chart',  icon: 'chart.bar.svg',                 name: 'Inkomen chart', cat: 'Finance'       },
                  { id: 'networth',      icon: 'chart.line.uptrend.xyaxis.svg', name: 'Nettovermogen', cat: 'Finance'       },
                  { id: 'pie',           icon: 'percent.svg',                   name: 'Categorieën',   cat: 'Finance'       },
                  { id: 'transactions',  icon: 'list.bullet.svg',               name: 'Transacties',   cat: 'Finance'       },
                  { id: 'cash',          icon: 'banknote.svg',                  name: 'Contant',       cat: 'Finance'       },
                  { id: 'portfolio',     icon: 'briefcase.svg',                 name: 'Portfolio',     cat: 'Trading'       },
                  { id: 'trading',       icon: 'chart.bar.xaxis.ascending.svg', name: 'Trading',       cat: 'Trading'       },
                  { id: 'mortgage',      icon: 'house.svg',                     name: 'Hypotheek',     cat: 'Vastgoed'      },
                  { id: 'budget',        icon: 'slider.horizontal.3.svg',       name: 'Budget',        cat: 'Budget'        },
                  { id: 'goals',         icon: 'target.svg',                    name: 'Doelen',        cat: 'Doelen'        },
                  { id: 'subscriptions', icon: 'creditcard.rewards.svg',        name: 'Abonnementen',  cat: 'Abonnementen'  },
                ].map(w => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <SFIcon name={w.icon} size={14} color="var(--accent)" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{w.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{w.id} · {w.cat}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentBlock>
          </Section>

          {/* ── STAT WIDGETS ───────────────────────────────────────────── */}
          <Section id="widget-stat" title="Stat Widgets">
            <ComponentBlock
              title="income / spent / net-savings / investments"
              description="Vier KPI widgets. Gebruiken intern .card + .stat-card patroon. Radius via CLASS_RADIUS_MAP."
              status="system"
              cssClass="card"
            >
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: 'Inkomen',      value: '€ 3.200', color: '#1A56DB', change: '+€430 vs vorige maand', pos: true },
                  { label: 'Uitgaven',     value: '€ 1.840', color: '#3B82F6', change: '-€230 vs vorige maand', pos: false },
                  { label: 'Netto',        value: '€ 1.360', color: '#34C759', change: 'Op schema',             pos: true },
                  { label: 'Beleggingen', value: '€ 24.800', color: '#30D158', change: '+8.4%',                pos: true },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: s.pos ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <SFIcon name={s.pos ? 'arrow.up.right.svg' : 'arrow.down.right.svg'} size={11} color={s.pos ? 'var(--green)' : 'var(--red)'} />
                      {s.change}
                    </div>
                  </div>
                ))}
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="health"
              description="HealthScore component — live import uit components/HealthScore.jsx."
              status="system"
              cssClass="card"
            >
              <div style={{ width: '100%', maxWidth: 400 }}>
                <HealthScore />
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="summary"
              description="MonthlySummary component — live import uit components/MonthlySummary.jsx."
              status="system"
              cssClass="card"
            >
              <div style={{ width: '100%', maxWidth: 500 }}>
                <MonthlySummary />
              </div>
            </ComponentBlock>
          </Section>

          {/* ── LIST WIDGETS ───────────────────────────────────────────── */}
          <Section id="widget-list" title="Lijst Widgets">
            <ComponentBlock
              title="transactions"
              description="Recente transacties widget. Gebruikt .finder-row (r=20), .amount-positive/.amount-negative, CategoryIcon."
              status="system"
              cssClass="finder-row"
            >
              <div className="card" style={{ width: '100%', padding: 0, overflow: 'hidden' }}>
                <div className="section-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span className="section-title">Recente transacties</span>
                  <button className="btn btn-ghost" style={{ fontSize: 11 }}>Alles <SFIcon name="arrow.right.svg" size={11} color="currentColor" /></button>
                </div>
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { cat: 'groceries',     desc: 'Colruyt',    date: '2026-06-28', amount: -45.30 },
                    { cat: 'transport',     desc: 'NMBS',       date: '2026-06-27', amount: -12.80 },
                    { cat: 'income',        desc: 'Loon',       date: '2026-06-25', amount: 3200.00 },
                    { cat: 'dining',        desc: 'Lunch',      date: '2026-06-24', amount: -18.50 },
                    { cat: 'entertainment', desc: 'Netflix',    date: '2026-06-23', amount: -15.99 },
                  ].map((tx, i) => (
                    <div key={i} className="finder-row">
                      <CategoryIcon category={tx.cat} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.date}</div>
                      </div>
                      <div className={tx.amount >= 0 ? 'amount-positive' : 'amount-negative'} style={{ fontSize: 13 }}>
                        {tx.amount >= 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="subscriptions"
              description="Abonnementen widget. Lijst-stijl met scheidingslijnen."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ width: '100%', maxWidth: 360, padding: 0, overflow: 'hidden' }}>
                <div className="section-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span className="section-title">Abonnementen</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>-€63.97/mo</span>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {[
                    { name: 'Netflix',  amount: 15.99 },
                    { name: 'Spotify',  amount: 9.99  },
                    { name: 'iCloud',   amount: 2.99  },
                    { name: 'YouTube',  amount: 13.99 },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 13 }}>{s.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>€{s.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="cash"
              description="Contant geld widget met saldo en recente mutaties."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ maxWidth: 300, padding: '16px 18px' }}>
                <div className="section-header" style={{ marginBottom: 10 }}><span className="section-title">Contant</span></div>
                <div style={{ fontSize: 32, fontWeight: 200, letterSpacing: -1, marginBottom: 4 }}>€ 240,00</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Huidig saldo</div>
                {[
                  { desc: 'Koffie',    amount: -3.50  },
                  { desc: 'Markt',     amount: -12.00 },
                  { desc: 'Opname',    amount:  50.00 },
                ].map((tx, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tx.desc}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tx.amount > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </ComponentBlock>
          </Section>

          {/* ── CHART WIDGETS ──────────────────────────────────────────── */}
          <Section id="widget-chart" title="Chart Widgets">
            <ComponentBlock
              title="portfolio"
              description="Portfolio waarde widget met totaal + P&L badge."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ width: '100%', maxWidth: 360, padding: '16px 18px' }}>
                <div className="section-header" style={{ marginBottom: 12 }}>
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <SFIcon name="chart.line.uptrend.xyaxis.svg" size={14} color="var(--accent)" /> Portfolio
                  </span>
                  <SFIcon name="arrow.right.svg" size={14} color="var(--text-muted)" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Totale waarde</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>€ 24.800</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>+8.4%</span>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>+€ 1.920 all time</div>
                  </div>
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="trading"
              description="Trading samenvatting widget met P&L, winrate en laatste trade."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ width: '100%', padding: '16px 18px', borderLeft: '3px solid #059669' }}>
                <div className="section-header" style={{ marginBottom: 12 }}>
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <SFIcon name="chart.bar.xaxis.ascending.svg" size={14} color="#059669" /> Trading
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  {[
                    { lbl: 'Totaal P&L',  val: '+$2.840', color: '#059669' },
                    { lbl: 'Winrate',     val: '62%',     color: '#059669' },
                    { lbl: 'Trades',      val: '47',      color: 'var(--text-primary)' },
                  ].map((x, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      {i > 0 && <div style={{ width: 1, height: 32, background: 'var(--border)' }} />}
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{x.lbl}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: x.color }}>{x.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="income-chart / networth"
              description="Chart-widgets tonen BarChart of AreaChart via Recharts. Zie Dashboard voor live versie."
              status="system"
              cssClass="card"
            >
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Recharts-charts vereisen echte data — zie het live Dashboard voor preview.
              </div>
            </ComponentBlock>
          </Section>

          {/* ── PROGRESS WIDGETS ───────────────────────────────────────── */}
          <Section id="widget-progress" title="Progress Widgets">
            <ComponentBlock
              title="progress-bar / progress-fill"
              description="Voortgangsbalk gebruikt door mortgage, budget en goals widgets."
              status="css"
              cssClass="progress-bar"
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>Boodschappen</span><span style={{ color: 'var(--green)' }}>€ 180 / €300</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '60%', background: 'var(--green)' }} /></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>Horeca</span><span style={{ color: 'var(--yellow)' }}>€ 160 / €200</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '80%', background: 'var(--yellow)' }} /></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>Transport</span><span style={{ color: 'var(--red)' }}>€ 240 / €150</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '100%', background: 'var(--red)' }} /></div>
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="mortgage"
              description="Hypotheek widget met resterende schuld, afbetalingspercentage en progress-bar."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ maxWidth: 360, padding: '16px 18px' }}>
                <div className="section-header" style={{ marginBottom: 12 }}>
                  <span className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <SFIcon name="house.svg" size={14} color="var(--accent)" /> Hypotheek
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Resterend</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>€ 218.400</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Afbetaald</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>27%</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '27%', background: 'var(--green)' }} />
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="goals"
              description="Spaardromen widget. Elke goal heeft een icoon (data-squircle-r=8), naam, percentage en progress-bar."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ maxWidth: 360, padding: '16px 18px' }}>
                <div className="section-header" style={{ marginBottom: 12 }}><span className="section-title">Doelen</span></div>
                {[
                  { name: 'Vakantie Japan', icon: 'airplane.svg',      color: '#007AFF', pct: 68 },
                  { name: 'Nieuw laptop',   icon: 'laptopcomputer.svg', color: '#34C759', pct: 45 },
                  { name: 'Noodfonds',      icon: 'shield.svg',         color: '#FF9500', pct: 82 },
                ].map(g => (
                  <div key={g.name} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <div data-squircle-r={8} style={{ width: 24, height: 24, background: g.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <SFIcon name={g.icon} size={12} color={g.color} />
                      </div>
                      <span style={{ fontSize: 12, flex: 1, fontWeight: 500 }}>{g.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${g.pct}%`, background: g.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="budget"
              description="Budget widget toont top-4 categorieën met kleurcode: groen / oranje / rood op basis van gebruik."
              status="system"
              cssClass="card"
            >
              <div className="card" style={{ maxWidth: 360, padding: '16px 18px' }}>
                <div className="section-header" style={{ marginBottom: 12 }}>
                  <span className="section-title">Budget</span>
                  <button className="btn btn-ghost" style={{ fontSize: 11 }}>Alles <SFIcon name="arrow.right.svg" size={11} color="currentColor" /></button>
                </div>
                {[
                  { cat: 'Boodschappen', spent: 180, limit: 300 },
                  { cat: 'Horeca',       spent: 160, limit: 200 },
                  { cat: 'Transport',    spent: 240, limit: 150 },
                  { cat: 'Shopping',     spent: 60,  limit: 100 },
                ].map(b => {
                  const pct = Math.min((b.spent / b.limit) * 100, 100);
                  const color = b.spent > b.limit ? 'var(--red)' : pct >= 80 ? 'var(--yellow)' : 'var(--green)';
                  return (
                    <div key={b.cat} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.cat}</span>
                        <span style={{ fontSize: 12, color }}>€{b.spent} / €{b.limit}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: pct + '%', background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ComponentBlock>
          </Section>

          {/* ── WIDGET PICKER ──────────────────────────────────────────── */}
          <Section id="widget-picker" title="Widget Picker">
            <ComponentBlock
              title="Widget picker UI"
              description="macOS-stijl bottom sheet. wps-search-wrap (r=12), wps-widget-card (r=16), wps-widget-icon (r=12) — allemaal via CLASS_RADIUS_MAP."
              status="system"
              cssClass="wps-widget-card"
            >
              <div style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div className="wps-search-wrap" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <SFIcon name="magnifyingglass.svg" size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 10, zIndex: 1 }} />
                    <input className="input" style={{ paddingLeft: 30, borderRadius: 0, width: '100%' }} placeholder="Zoek widgets..." />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { icon: 'chart.line.uptrend.xyaxis.svg', name: 'Inkomen',    desc: 'Maandelijks inkomen' },
                    { icon: 'chart.bar.svg',                 name: 'Uitgaven',   desc: 'Totale uitgaven'    },
                    { icon: 'banknote.svg',                  name: 'Netto',      desc: 'Nettobesparingen'   },
                    { icon: 'briefcase.svg',                 name: 'Portfolio',  desc: 'Investeringen'      },
                    { icon: 'heart.svg',                     name: 'Gezondheid', desc: 'Financiële score'   },
                    { icon: 'house.svg',                     name: 'Hypotheek',  desc: 'Leningsaldo'        },
                  ].map(w => (
                    <div key={w.name} className="wps-widget-card" style={{ padding: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      <div className="wps-widget-icon" style={{ width: 32, height: 32, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SFIcon name={w.icon} size={16} color="var(--accent)" />
                      </div>
                      <div>
                        <div className="wps-widget-name" style={{ fontSize: 12, fontWeight: 600 }}>{w.name}</div>
                        <div className="wps-widget-desc" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{w.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ComponentBlock>

            <ComponentBlock
              title="Widget context menu"
              description="Rechtermuisklik op widget. widget-ctx-menu (r=12), widget-ctx-item (r=8) — beide via CLASS_RADIUS_MAP."
              status="system"
              cssClass="widget-ctx-menu"
            >
              <div className="widget-ctx-menu" style={{ pointerEvents: 'none', position: 'relative' }}>
                {[
                  { icon: 'pencil.svg',          label: 'Bewerk widgets' },
                  { icon: 'arrow.clockwise.svg',  label: 'Herstel layout' },
                ].map((item, i) => (
                  <button key={i} className="widget-ctx-item" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'none', border: 'none', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                    <SFIcon name={item.icon} size={13} color="var(--text-secondary)" />
                    {item.label}
                  </button>
                ))}
              </div>
            </ComponentBlock>
          </Section>

          </>}

        </main>
      </div>
    </div>
  );
}
