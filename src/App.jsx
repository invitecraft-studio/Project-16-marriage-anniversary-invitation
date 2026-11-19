import {useEffect,useMemo,useRef,useState} from 'react'
import {C} from './config'
const I=n=>`images/${n}`
const START=new Date(C.wedding).getTime()

/* ---------- hooks ---------- */
function useIn(th=.25){
  const r=useRef(),[on,set]=useState(false)
  useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){set(true);o.disconnect()}},{threshold:th});o.observe(r.current);return()=>o.disconnect()},[th])
  return [r,on]
}

/* ---------- ambient gold dust + sparkle cursor ---------- */
function star(x,cx,cy,r){x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,d=i%2?r*.35:r;x.lineTo(cx+Math.cos(a)*d,cy+Math.sin(a)*d)}x.closePath();x.fill()}
function Magic(){
  const r=useRef()
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
    const c=r.current,x=c.getContext('2d'),k=Math.min(devicePixelRatio||1,2);let w,h,q,t=0
    const rs=()=>{w=innerWidth;h=innerHeight;c.width=w*k;c.height=h*k;x.setTransform(k,0,0,k,0,0)};rs();addEventListener('resize',rs)
    const motes=Array.from({length:36},()=>({x:Math.random()*w,y:Math.random()*h,r:.6+Math.random()*1.8,s:.15+Math.random()*.35,p:Math.random()*6.28}))
    const sp=[]
    const mv=e=>{for(let i=0;i<2;i++)sp.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*1.4,vy:Math.random()*1.2-.3,l:1,s:3+Math.random()*5})}
    const f=()=>{t+=.01;x.clearRect(0,0,w,h)
      for(const m of motes){m.y-=m.s;m.x+=Math.sin(t+m.p)*.4;if(m.y<-5){m.y=h+5;m.x=Math.random()*w}
        x.globalAlpha=.3+.3*Math.sin(t*3+m.p);x.fillStyle='#e9b44c';x.beginPath();x.arc(m.x,m.y,m.r,0,7);x.fill()}
      for(let i=sp.length-1;i>=0;i--){const s=sp[i];s.x+=s.vx;s.y+=s.vy;s.vy+=.04;s.l-=.025;if(s.l<=0){sp.splice(i,1);continue}
        x.globalAlpha=s.l;x.fillStyle='#ffd37a';star(x,s.x,s.y,s.s*s.l)}
      q=requestAnimationFrame(f)}
    f();addEventListener('pointermove',mv)
    return()=>{cancelAnimationFrame(q);removeEventListener('pointermove',mv);removeEventListener('resize',rs)}
  },[])
  return <canvas ref={r} className="magic" aria-hidden/>
}

/* ---------- intro: light the lamp, walk into the temple ---------- */
function Intro({onDone}){
  const [s,setS]=useState(0)
  const light=()=>{if(s)return;setS(1);setTimeout(()=>setS(2),1900);setTimeout(onDone,3700)}
  return <div className={`intro s${s}`} onClick={light}>
    <img src={I('01.webp')} alt=""/>
    <div className="minis">{Array.from({length:11},(_,i)=><i key={i} style={{'--i':Math.abs(i-5)}}/>)}</div>
    <button className="lamp" aria-label="Light the lamp" onKeyDown={e=>e.key==='Enter'&&light()}>
      <i className="fl"/><i className="wk"/><i className="bw"/>
    </button>
    <p className="itxt">tap the lamp to begin</p>
    <div className="flash"/>
  </div>
}

/* ---------- hero: the twelve-light dial ---------- */
function Since(){
  const [n,setN]=useState(Date.now())
  useEffect(()=>{const t=setInterval(()=>setN(Date.now()),1000);return()=>clearInterval(t)},[])
  const d=Math.max(0,n-START)
  return <div className="since">{[['days',864e5,1e6],['hours',36e5,24],['minutes',6e4,60],['seconds',1e3,60]].map(([l,m,k])=>
    <div key={l}><b>{String(Math.floor(d/m)%k).padStart(2,'0')}</b><span>{l}</span></div>)}</div>
}
function Hero({on}){
  return <header className={`hero ${on?'on':''}`}>
    <div className="dial">
      <svg viewBox="0 0 400 400" aria-hidden>
        <circle className="ring" cx="200" cy="200" r="170" pathLength="1"/>
        {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <circle key={i} className="dt" cx={200+187*Math.sin(a)} cy={200-187*Math.cos(a)} r="6" style={{animationDelay:`${1.3+i*.22}s`}}/>})}
      </svg>
      <div className="pic"><img src={I('11.webp')} alt="A couple in a soft golden glow"/></div>
      <b className="badge">1<sup>st</sup></b>
    </div>
    <h1 className="script"><span>Happy Anniversary</span></h1>
    <p className="names">{C.him} <i>&amp;</i> {C.her}</p>
    <p className="together script">together for</p>
    <Since/>
    <div className="scrollhint"><i/>keep going</div>
  </header>
}

/* ---------- words that light up as you scroll ---------- */
function Scrub({text,cls=''}){
  const r=useRef();const words=text.split(' ')
  useEffect(()=>{
    const el=r.current,sp=el.querySelectorAll('span')
    const f=()=>{const b=el.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-b.top)/(b.height+innerHeight*.3)));const n=Math.ceil(p*sp.length*1.1);sp.forEach((s,i)=>s.classList.toggle('lit',i<n))}
    f();addEventListener('scroll',f,{passive:true});addEventListener('resize',f)
    return()=>{removeEventListener('scroll',f);removeEventListener('resize',f)}
  },[text])
  return <p ref={r} className={`scrub ${cls}`}>{words.map((w,i)=><span key={i}>{w}{' '}</span>)}</p>
}

/* ---------- the red thread that draws itself down the page ---------- */
function Thread({host}){
  const [sz,setSz]=useState({w:0,h:0}),path=useRef()
  useEffect(()=>{const el=host.current,m=()=>setSz({w:el.offsetWidth,h:el.offsetHeight});m();const ro=new ResizeObserver(m);ro.observe(el);return()=>ro.disconnect()},[host])
  const d=useMemo(()=>{const {w,h}=sz;if(!h)return '';const n=Math.max(4,Math.round(h/950)),seg=h/n;let s=`M${w/2} 0`,x=w/2
    for(let k=0;k<n;k++){const y0=k*seg,y1=(k+1)*seg,nx=k%2?w*.07:w*.93;s+=`C${x} ${y0+seg*.55} ${nx} ${y1-seg*.55} ${nx} ${y1}`;x=nx}return s},[sz])
  useEffect(()=>{const el=host.current,p=path.current;if(!p)return
    const f=()=>{const top=el.getBoundingClientRect().top+scrollY,pr=Math.min(1,Math.max(0,(scrollY+innerHeight*.7-top)/el.offsetHeight));p.style.strokeDashoffset=1-pr}
    f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[d,host])
  return <svg className="thread" width={sz.w} height={sz.h} viewBox={`0 0 ${sz.w||1} ${sz.h||1}`} aria-hidden><path ref={path} d={d} pathLength="1"/></svg>
}

/* ---------- arched frame with its own reveal ---------- */
function Frame({src,rv,pos,alt='',sparkle}){
  const [r,on]=useIn(.3)
  return <div ref={r} data-par className={`frame rv-${rv} ${on?'on':''}`}>
    <div className="arch"><img src={I(src)} style={{objectPosition:pos}} alt={alt}/><span className="shine"/></div>
    {sparkle&&[[18,30],[34,38],[46,34],[26,50],[40,56],[12,44],[52,46],[30,22]].map(([l,t],i)=><b key={i} className="spk" style={{left:l+'%',top:t+'%',animationDelay:i*.45+'s'}}/>)}
  </div>
}
function Chapter({d,i}){
  const [r,on]=useIn(.25)
  return <section ref={r} className={`chap ${d.theme} ${i%2?'flip':''} ${on?'on':''}`}>
    <Frame src={d.img} rv={d.rv} pos={d.pos} sparkle={d.sparkle}/>
    <div className="txt"><h2>{d.title}</h2><p>{d.line}</p><span className="note script">{d.note}</span></div>
  </section>
}

/* ---------- twelve diyas, one for every month ---------- */
const ROM=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
function Diyas(){
  const [lit,setLit]=useState(Array(12).fill(false));const [cur,setCur]=useState(null);const [r,on]=useIn(.2)
  const n=lit.filter(Boolean).length,all=n===12
  const tap=i=>{setLit(l=>l.map((v,j)=>j===i||v));setCur(i)}
  const petals=useMemo(()=>Array.from({length:40},()=>({l:Math.random()*100,x:(Math.random()-.5)*260,d:3+Math.random()*3,s:10+Math.random()*14,dl:Math.random()*1.5})),[])
  return <section ref={r} className={`s-diyas dy ${all?'all':''} ${on?'on':''}`}>
    <img className="bgimg" src={I('01.webp')} alt=""/>
    <div className="dyin">
      <h2>Twelve months,<br/>twelve lights</h2>
      <p className="sub">Tap each lamp to remember the month it holds.</p>
      <div className="row">{lit.map((v,i)=><button key={i} className={`diya ${v?'lit':''}`} aria-pressed={v} aria-label={`Month ${i+1}`} onClick={()=>tap(i)}>
        <i className="fl"/><i className="wk"/><i className="bw"/><span>{ROM[i]}</span></button>)}</div>
      <p key={cur} className="msg">{cur===null?'':C.months[cur]}</p>
      <p className="cnt">{n} of 12 lit</p>
      {all&&<p className="all script">{C.allLit}</p>}
    </div>
    {all&&<div className="burst" aria-hidden>{petals.map((p,i)=><i key={i} style={{left:p.l+'%',width:p.s,height:p.s*1.3,'--x':p.x+'px',animationDuration:p.d+'s',animationDelay:p.dl+'s'}}/>)}</div>}
  </section>
}

/* ---------- numbers ---------- */
function Count({to,go}){
  const [v,setV]=useState(0)
  useEffect(()=>{if(!go||typeof to!=='number')return;let q,t0
    const f=t=>{t0=t0||t;const p=Math.min(1,(t-t0)/2000);setV(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)q=requestAnimationFrame(f)};q=requestAnimationFrame(f);return()=>cancelAnimationFrame(q)},[go,to])
  return typeof to==='number'?v.toLocaleString('en-IN'):to
}
function Stats(){
  const [r,on]=useIn(.3);const days=Math.max(0,Math.floor((Date.now()-START)/864e5))
  const val=n=>n==='days'?days:n==='hours'?days*24:n
  return <section ref={r} className={`s-stats stats ${on?'on':''}`}>
    {C.stats.map((s,i)=><div key={i} style={{'--i':i}}><b><Count to={val(s.n)} go={on}/></b><span>{s.l}</span></div>)}
  </section>
}

/* ---------- sky + promises ---------- */
function Sky(){
  const [r,on]=useIn(.2);const [f,setF]=useState([])
  return <section ref={r} className={`s-sky sky ${on?'on':''}`}>
    <div className="chap sky-top">
      <Frame src="07.webp" rv="bloom" pos="50% 55%"/>
      <div className="txt"><h2>{C.skyTitle}</h2><p>{C.skyLine}</p><span className="note script">{C.skyNote}</span></div>
    </div>
    <div className="promises">{C.promises.map((p,i)=>{const o=f.includes(i)
      return <button key={i} className={`fc ${o?'flip':''}`} onClick={()=>setF(a=>a.includes(i)?a.filter(x=>x!==i):[...a,i])} aria-pressed={o}>
        <span className="fi"><span className="ff"><i>✦</i>{p.t}</span><span className="fb">{p.b}</span></span></button>})}
    </div>
  </section>
}

/* ---------- finale: open the doors, fireworks ---------- */
function Finale(){
  const [open,setOpen]=useState(false);const cv=useRef(),ps=useRef([]),raf=useRef(0),sec=useRef()
  const loop=()=>{const c=cv.current,x=c.getContext('2d');x.clearRect(0,0,c.width,c.height)
    ps.current=ps.current.filter(p=>p.l>0)
    for(const p of ps.current){const px=p.x,py=p.y;p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.vx*=.985;p.l-=.014
      x.globalAlpha=Math.max(p.l,0);x.strokeStyle=p.c;x.lineWidth=2;x.beginPath();x.moveTo(px,py);x.lineTo(p.x,p.y);x.stroke()}
    raf.current=ps.current.length?requestAnimationFrame(loop):0}
  const boom=(px,py)=>{const c=cv.current;c.width=c.offsetWidth;c.height=c.offsetHeight
    const cols=['#ffd37a','#e98aa0','#fff3d6','#8fb5e6','#f0b45a'],col=cols[Math.floor(Math.random()*5)]
    for(let i=0;i<70;i++){const a=Math.random()*6.283,s=1+Math.random()*4.5;ps.current.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:col})}
    if(!raf.current)raf.current=requestAnimationFrame(loop)}
  const go=()=>{if(open)return;setOpen(true)
    for(let i=0;i<8;i++)setTimeout(()=>{const c=cv.current;boom(c.offsetWidth*(.12+Math.random()*.76),c.offsetHeight*(.12+Math.random()*.42))},1400+i*520)}
  const click=e=>{if(!open)return;const b=cv.current.getBoundingClientRect();boom(e.clientX-b.left,e.clientY-b.top)}
  useEffect(()=>()=>cancelAnimationFrame(raf.current),[])
  return <section ref={sec} className={`s-finale finale ${open?'open':''}`} onClick={click}>
    <canvas ref={cv} className="fw" aria-hidden/>
    <div className="stage">
      <div className="card"><img src={I('04.webp')} alt="Happy Anniversary to the two people who make love look beautiful"/></div>
      <button className="door l" onClick={go} aria-label="Open the doors"><i/></button>
      <button className="door r" onClick={go} aria-label="Open the doors"><i/></button>
    </div>
    <p className="tap script">{open?'tap anywhere for stars':'one last surprise, tap the doors'}</p>
    <div className="end">
      <h2>Happy First Anniversary,<br/>{C.him} &amp; {C.her}</h2>
      <p className="script sign">{C.sign}</p>
    </div>
  </section>
}

/* ---------- app ---------- */
export default function App(){
  const [ready,setReady]=useState(false);const bar=useRef(),main=useRef()
  useEffect(()=>{document.body.style.overflow=ready?'':'hidden'},[ready])
  useEffect(()=>{let q
    const f=()=>{cancelAnimationFrame(q);q=requestAnimationFrame(()=>{
      bar.current.style.width=(scrollY/Math.max(1,document.body.scrollHeight-innerHeight)*100)+'%'
      document.querySelectorAll('[data-par]').forEach(el=>{const b=el.getBoundingClientRect();el.style.setProperty('--p',((b.top+b.height/2-innerHeight/2)/innerHeight).toFixed(3))})})}
    f();addEventListener('scroll',f,{passive:true});addEventListener('resize',f)
    return()=>{removeEventListener('scroll',f);removeEventListener('resize',f)}},[])
  return <>
    {!ready&&<Intro onDone={()=>setReady(true)}/>}
    <Magic/><div className="bar"><i ref={bar}/></div>
    <Hero on={ready}/>
    <main ref={main}>
      <Thread host={main}/>
      <section className="s-prologue prologue"><Scrub cls="big" text={C.prologue}/></section>
      {C.chapters.map((d,i)=><Chapter key={d.img} d={d} i={i}/>)}
      <Diyas/>
      <Stats/>
      <Sky/>
      <section className="s-letter letter"><div className="paper">{C.letter.map((l,i)=><Scrub key={i} text={l}/>)}</div></section>
      <Finale/>
    </main>
  </>
}
