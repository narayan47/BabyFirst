import { useState } from "react";
import { ArrowLeft, Sprout, Star, MoonStar } from "lucide-react";

const milestones = [
  { skill: "Lullaby design", value: 92, note: "Can calm even the bounciest cloud." },
  { skill: "Lantern crafting", value: 84, note: "Learning to make softer, warmer light." },
  { skill: "Dream navigation", value: 76, note: "Three rooftops and one moon to go." },
  { skill: "Storytelling", value: 88, note: "Every ending gets a cozy blanket." },
  { skill: "Kindness", value: 100, note: "Pip's most powerful magic." }
];

export default function GrowthChart() {
  const [selected, setSelected] = useState(milestones[0]);
  const [view, setView] = useState("bars");
  return <main className="growth-page">
    <header className="growth-top"><a className="button secondary" href="/"><ArrowLeft size={17}/> Back to nursery</a><span className="eyebrow"><Sprout size={15}/> PIP'S PROGRESS JOURNAL</span></header>
    <section className="growth-hero">
      <span className="growth-moon">🌙</span><h1>Pip's Growth Chart</h1>
      <p>Little steps become big magic. This is how our Junior Dream Engineer is growing, one sleepy shift at a time.</p>
      <div className="growth-stats"><div><strong>5</strong><span>Dream skills</span></div><div><strong>88%</strong><span>Overall sparkle</span></div><div><strong>∞</strong><span>Room to grow</span></div></div>
    </section>
    <section className="growth-content">
      <div className="growth-toolbar"><div><h2>Nursery skill levels</h2><p>Choose a skill to see Pip's latest learning note.</p></div><div className="segmented"><button className={view==="bars"?"active":""} onClick={()=>setView("bars")}>Growth bars</button><button className={view==="stars"?"active":""} onClick={()=>setView("stars")}>Star chart</button></div></div>
      {view==="bars" ? <div className="growth-bars">{milestones.map((m,i)=><button className={`growth-row ${selected.skill===m.skill?"selected":""}`} key={m.skill} onClick={()=>setSelected(m)}><span className="growth-emoji">{["🎵","🏮","🗺️","📖","💗"][i]}</span><span className="growth-skill"><strong>{m.skill}</strong><span className="bar-track"><span style={{width:`${m.value}%`}}/></span></span><strong className="growth-value">{m.value}%</strong></button>)}</div> : <div className="star-chart">{milestones.map(m=><button key={m.skill} className={`star-skill ${selected.skill===m.skill?"selected":""}`} onClick={()=>setSelected(m)}><span style={{fontSize:`${1.2+m.value/35}rem`}}>✦</span><strong>{m.skill}</strong><small>{m.value}%</small></button>)}</div>}
      <article className="growth-note"><span className="eyebrow"><MoonStar size={14}/> LEARNING NOTE</span><h3>{selected.skill}</h3><p>{selected.note}</p><div className="note-progress"><span style={{width:`${selected.value}%`}}/></div><strong>{selected.value}% dream mastery</strong></article>
      <div className="growth-footer-card"><Star/><p>These numbers are Pip's fictional portfolio stats, not real-world measurements. Every skill grows with practice, patience, and a little imagination.</p></div>
      <a className="button primary" href="/">Return to Pip's portfolio ✦</a>
    </section>
  </main>;
}