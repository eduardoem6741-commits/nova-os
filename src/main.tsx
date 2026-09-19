import { useEffect, useState } from 'react'
import { Calculator, FileText, Folder, Globe, Menu, Minus, Search, Settings, Terminal, X, Zap } from 'lucide-react'
import './styles.css'

type AppId = 'browser' | 'files' | 'notes' | 'terminal' | 'calculator' | 'settings'
type WindowState = { id: number; app: AppId; x: number; y: number; width: number; height: number; minimized?: boolean }
type IconType = typeof Globe

const apps: Record<AppId, { title: string; icon: IconType; color: string }> = {
  browser: { title: 'Nebula Browser', icon: Globe, color: '#73a7ff' },
  files: { title: 'My Files', icon: Folder, color: '#ffd06e' },
  notes: { title: 'Notes', icon: FileText, color: '#ff8cbd' },
  terminal: { title: 'Terminal', icon: Terminal, color: '#86edb5' },
  calculator: { title: 'Calculator', icon: Calculator, color: '#b79cff' },
  settings: { title: 'Settings', icon: Settings, color: '#b9c4df' },
}

function App() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function openApp(app: AppId) {
    const existing = windows.find((item) => item.app === app)
    if (existing) {
      setActive(existing.id)
      setWindows((items) => items.map((item) => item.id === existing.id ? { ...item, minimized: false } : item))
      setLauncherOpen(false)
      return
    }
    const id = Date.now()
    const offset = windows.length * 26
    setWindows((items) => [...items, { id, app, x: 100 + offset, y: 74 + offset, width: app === 'browser' ? 780 : 540, height: app === 'browser' ? 510 : 390 }])
    setActive(id)
    setLauncherOpen(false)
  }

  function closeApp(id: number) {
    setWindows((items) => items.filter((item) => item.id !== id))
    setActive((current) => current === id ? null : current)
  }

  return <main className="desktop" onClick={() => setLauncherOpen(false)}>
    <div className="aurora aurora-one" /><div className="aurora aurora-two" />
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Zap size={15} /></span><strong>nova</strong><small>OS</small></div>
      <span className="workspace">Personal workspace</span>
      <time>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
    </header>

    <section className="welcome"><p className="eyebrow">YOUR PERSONAL WEB DESKTOP</p><h1>Good evening, Eduardo.</h1><p>Ideas, projects, and the open web — all in one focused space.</p></section>
    <div className="shortcuts"><Shortcut icon={Globe} label="Browser" color="#73a7ff" onOpen={() => openApp('browser')} /><Shortcut icon={Folder} label="My Files" color="#ffd06e" onOpen={() => openApp('files')} /><Shortcut icon={FileText} label="Notes" color="#ff8cbd" onOpen={() => openApp('notes')} /></div>

    {windows.map((item) => {
      if (item.minimized) return null
      const meta = apps[item.app]
      return <Window key={item.id} item={item} meta={meta} active={active === item.id} onFocus={() => setActive(item.id)} onClose={() => closeApp(item.id)} onMinimize={() => setWindows((items) => items.map((window) => window.id === item.id ? { ...window, minimized: true } : window))} />
    })}

    <nav className="dock" onClick={(event) => event.stopPropagation()}><button className="launcher" onClick={() => setLauncherOpen((value) => !value)}><Menu size={20} /></button>{(Object.keys(apps) as AppId[]).slice(0, 5).map((id) => { const Icon = apps[id].icon; return <button className="dock-app" key={id} title={apps[id].title} onClick={() => openApp(id)}><Icon size={19} color={apps[id].color} />{windows.some((window) => window.app === id && !window.minimized) && <i />}</button> })}</nav>
    {launcherOpen && <div className="launcher-menu" onClick={(event) => event.stopPropagation()}><div className="menu-title"><div><b>Applications</b><small>Everything you need</small></div><Search size={17} /></div><div className="app-grid">{(Object.keys(apps) as AppId[]).map((id) => { const Icon = apps[id].icon; return <button key={id} onClick={() => openApp(id)}><span style={{ background: apps[id].color }}><Icon size={20} /></span><label>{apps[id].title.replace('Nebula ', '')}</label></button> })}</div></div>}
  </main>
}

function Shortcut({ icon: Icon, label, color, onOpen }: { icon: IconType; label: string; color: string; onOpen: () => void }) { return <button className="shortcut" onDoubleClick={onOpen}><span style={{ background: color }}><Icon size={24} /></span>{label}</button> }

function Window({ item, meta, active, onFocus, onClose, onMinimize }: { item: WindowState; meta: typeof apps[AppId]; active: boolean; onFocus: () => void; onClose: () => void; onMinimize: () => void }) {
  const Icon = meta.icon
  return <article className={'window ' + (active ? 'active' : '')} style={{ left: item.x, top: item.y, width: item.width, height: item.height, zIndex: active ? 10 : 3 }} onMouseDown={onFocus}><header className="window-head"><span><Icon size={15} color={meta.color} />{meta.title}</span><div><button onClick={onMinimize}><Minus size={15} /></button><button onClick={onClose}><X size={15} /></button></div></header><div className="window-body">{item.app === 'browser' && <Browser />} {item.app === 'files' && <Files />} {item.app === 'notes' && <Notes />} {item.app === 'terminal' && <TerminalApp />} {item.app === 'calculator' && <CalculatorApp />} {item.app === 'settings' && <SettingsApp />}</div></article>
}

function Browser() { const [address, setAddress] = useState('https://example.com'); const [page, setPage] = useState('https://example.com'); const go = (event: React.FormEvent) => { event.preventDefault(); setPage(address.startsWith('http') ? address : `https://${address}`) }; return <div className="browser"><div className="tabs">🌐 New tab <span>×</span></div><form className="address" onSubmit={go}><input value={address} onChange={(event) => setAddress(event.target.value)} /><button>Go</button></form><div className="browser-page"><div className="browser-hero"><div className="orb"><Globe size={29} /></div><h2>Explore the open web</h2><p>Enter an address to begin browsing.</p><form className="search-box" onSubmit={go}><Search size={16} /><input value={address} onChange={(event) => setAddress(event.target.value)} /><button>Open</button></form><small>Proxy-ready browsing · private by design</small></div><iframe title="web preview" src={page} /></div></div> }
function Files() { return <div className="files"><aside><b>LOCATIONS</b><p className="selected"><Folder size={14} /> My Files</p><p><Folder size={14} /> Desktop</p><p><Zap size={14} /> Applications</p></aside><section><div className="file-toolbar"><strong>My Files</strong><button>＋ New</button></div><div className="file-grid"><File icon={Folder} name="Documents" /><File icon={Folder} name="Downloads" /><File icon={FileText} name="Welcome.txt" /></div></section></div> }
function File({ icon: Icon, name }: { icon: IconType; name: string }) { return <div className="file"><Icon size={32} color={name.includes('.') ? '#ff8cbd' : '#ffd06e'} /><span>{name}</span></div> }
function Notes() { const [value, setValue] = useState('Welcome to NovaOS.\n\nYour workspace is ready.'); return <textarea className="notes" value={value} onChange={(event) => setValue(event.target.value)} /> }
function TerminalApp() { return <div className="terminal"><p><b>nova@workspace</b>:~$ neofetch</p><p className="green">NovaOS 0.1 · React workspace<br />Memory: virtual · Shell: nova-sh</p><p><b>nova@workspace</b>:~$ <span className="cursor">▌</span></p></div> }
function CalculatorApp() { const [value, setValue] = useState(''); const press = (key: string) => { if (key === 'C') return setValue(''); if (key === '=') { try { setValue(String(Function(`return ${value}`)())) } catch { setValue('Error') }; return }; setValue((current) => current + key) }; return <div className="calculator"><div className="display">{value || '0'}</div><div className="keypad">{'789/456*123-0.C=+'.split('').map((key) => <button key={key} onClick={() => press(key)}>{key}</button>)}</div></div> }
function SettingsApp() { return <div className="settings"><Setting title="Appearance" detail="Glass dark theme" /><Setting title="Animations" detail="Fluid window transitions" /><Setting title="Proxy browser" detail="Safe relay when configured" badge="READY" /></div> }
function Setting({ title, detail, badge }: { title: string; detail: string; badge?: string }) { return <div className="setting"><div><b>{title}</b><small>{detail}</small></div>{badge ? <em>{badge}</em> : <span className="toggle" />}</div> }

export default App
