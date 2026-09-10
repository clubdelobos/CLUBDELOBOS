/* eslint-disable */
// @ts-nocheck
/* Tour Motion — animaciones originales para categorías de turismo.
 * Vendored from the client's "codigo-animaciones-turismo" package
 * (2026-09-09). Canvas 2D, no runtime dependencies. Re-vendor from source if
 * it changes. Local changes, kept minimal:
 *   1. `export const TourMotion` appended at the end (import as a module).
 *   2. Renderer option `flourish` (default true) — `false` skips the little
 *      underline/flower/wave drawn beneath the final word.
 *   3. Animation option `speed` (default 1) — multiplies playback speed.
 *   4. `TourMotion.setFont(family, weight)` — render the final word in a
 *      custom typeface (call before constructing any Renderer/Animation).
 * Here: flourish false, speed ~1.7, font = the site's Montserrat.
 */
(function (root) {
  'use strict';
  const W = 720, H = 300, START = 2.15, MORPH = 1.85, END = 6.4;
  // Local change: FONT/WEIGHT are mutable so the host can render the final
  // word in the site typeface — call TourMotion.setFont(family, weight)
  // BEFORE constructing any Renderer/Animation (the text is sampled once).
  let FONT = 'TourSans, "Arial", sans-serif';
  let WEIGHT = 800;
  const palette = {
    nacionales: { label: 'Nacionales', color: '#164caf', bg: '#eef5fc', detail: 'El Salvador', colors: ['#154bbe','#368cf2','#163d91'] },
    internacionales: { label: 'Internacionales', color: '#235ca0', bg: '#eff6fa', detail: 'Más allá de nuestras fronteras', colors: ['#2769ab','#339ece','#1b477e'] },
    rios: { label: 'Ríos', color: '#08786f', bg: '#ecf7f3', detail: 'Agua, naturaleza y aventura', colors: ['#048b8a','#2bbbb9','#146c6d'] },
    volcanes: { label: 'Volcanes', color: '#ad4c23', bg: '#fff3e9', detail: 'Caminos hacia la cima', colors: ['#bd5428','#e9862f','#8a4230'] },
    pueblos: { label: 'Pueblos vivos', color: '#9d3e7b', bg: '#fbf0f6', detail: 'Color, cultura y tradición', colors: ['#c03883','#ee9835','#207e89','#74469c'] }
  };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const random = seed => { let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  function circle(c,x,y,r,color) { c.fillStyle=color; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
  function ellipse(c,x,y,rx,ry,color,rotation=0) { c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fill(); }
  function shape(c, points, color) { c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill(); }
  function line(c, points, color, width=2) { c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke(); }
  function leaf(c,x,y,size,angle,color) { c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(size,-size,size*1.7,-size*.65,size*1.6,0);c.bezierCurveTo(size, size*.55,size*.45,size*.6,0,0);c.fill();c.restore(); }
  function flower(c,x,y,r,color,angle=0) { c.save();c.translate(x,y);c.rotate(angle);for(let i=0;i<6;i++){const a=i*Math.PI/3;ellipse(c,Math.cos(a)*r*.58,Math.sin(a)*r*.58,r*.48,r*.26,color,a);}circle(c,0,0,r*.24,'#ffdc68');circle(c,0,0,r*.09,'#99502d');c.restore(); }
  function seal(c,x,y) {
    // Emblema estilizado legible a escala pequeña; no reproducción heráldica.
    c.save();c.translate(x,y);c.strokeStyle='#b99944';c.lineWidth=1.25;c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.stroke();
    c.fillStyle='#e7f6f7';c.beginPath();c.moveTo(0,-11);c.lineTo(10,8);c.lineTo(-10,8);c.closePath();c.fill();c.stroke();
    for(let i=0;i<5;i++)shape(c,[[-8+i*3.1,5],[-5+i*3.1,-1-Math.sin(i)*2],[-2+i*3.1,5]],'#548359');
    line(c,[[-8,7],[8,7]],'#5bace0',2);circle(c,0,-6,1.5,'#d34b42');c.restore();
  }
  function flag(c,t) {
    const x=241,y=65,w=239,h=133;
    const wave = px => Math.sin(px/w*6.2-t*3.2)*11+Math.sin(px/w*3-t*2)*3;
    ellipse(c,363,247,116,7,'rgba(29,74,133,.08)');
    line(c,[[236,54],[236,244]],'#7593ad',4);circle(c,236,50,4,'#dfba66');
    for(let band=0;band<3;band++) {
      c.beginPath();
      for(let i=0;i<=w;i+=2) {const yy=y+h/3*band+wave(i);if(i===0)c.moveTo(x+i,yy);else c.lineTo(x+i,yy);}
      for(let i=w;i>=0;i-=2)c.lineTo(x+i,y+h/3*(band+1)+wave(i));
      c.closePath();c.fillStyle=band===1?'#ffffff':'#1957bd';c.fill();
      c.save();c.clip();const shine=c.createLinearGradient(x,0,x+w,0);shine.addColorStop(0,'rgba(0,32,100,.12)');shine.addColorStop(.27,'rgba(255,255,255,.3)');shine.addColorStop(.54,'rgba(0,30,87,.14)');shine.addColorStop(.83,'rgba(255,255,255,.15)');shine.addColorStop(1,'rgba(0,30,87,.14)');c.fillStyle=shine;c.fillRect(x,y-25,w,h+50);c.restore();
    }
    seal(c,x+w*.51,y+h/2+wave(w*.51));
  }
  function flightPoint(p) {
    return {x:178+360*p,y:173-51*Math.sin(p*Math.PI*2.1)-36*p};
  }
  function plane(c,x,y,angle) {
    c.save();c.translate(x,y);c.rotate(angle);c.shadowColor='rgba(15,76,118,.12)';c.shadowBlur=10;c.shadowOffsetY=5;
    shape(c,[[35,0],[16,7],[0,9],[-27,34],[-37,33],[-21,5],[-37,2],[-46,10],[-50,9],[-46,-1],[-49,-12],[-43,-12],[-35,-5],[-21,-5],[-37,-32],[-27,-32],[0,-8],[16,-7]],'#fff');
    c.shadowBlur=0;c.shadowOffsetY=0;shape(c,[[35,0],[16,7],[-5,7],[-34,2],[-35,-2],[11,-2]],'#b6d9ed');
    line(c,[[10,-4],[16,-3],[20,0]],'#246a96',2);
    shape(c,[[-45,-2],[-48,-12],[-42,-12],[-35,-3]],'#e2ac4b');c.restore();
  }
  function flight(c,t) {
    const p = mix(.06,.98,clamp(t/START));
    c.strokeStyle='#a9cfe0';c.lineWidth=2;c.setLineDash([5,8]);c.lineCap='round';c.beginPath();
    for(let i=0;i<=100*p;i++){const q=flightPoint(i/100);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();c.setLineDash([]);
    c.strokeStyle='rgba(92,178,213,.16)';c.lineWidth=7;c.beginPath();for(let i=Math.max(0,Math.floor(p*100)-17);i<=100*p;i++){const q=flightPoint(i/100);i===Math.max(0,Math.floor(p*100)-17)?c.moveTo(q.x,q.y):c.lineTo(q.x,q.y);}c.stroke();
    const q=flightPoint(p),n=flightPoint(p+.002);plane(c,q.x,q.y,Math.atan2(n.y-q.y,n.x-q.x));
    circle(c,178,173,5,'#397dab');circle(c,178,173,2,'#fff');
    // Dos nubes discretas para que la ruta se lea con claridad.
    for(const [x,y,s] of [[244,82,1],[457,211,.75]]) {c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,28,7,'#dcecf4');circle(c,-9,-7,10,'#dcecf4');circle(c,6,-10,15,'#dcecf4');c.restore();}
  }
  function river(c,t) {
    ellipse(c,357,244,131,13,'#ceece8');
    shape(c,[[237,226],[262,146],[284,151],[293,84],[345,70],[378,79],[411,120],[438,124],[473,226]],'#91b8a2');
    shape(c,[[237,226],[265,153],[291,151],[299,92],[330,89],[318,219]],'#416f64');
    shape(c,[[391,98],[424,145],[438,149],[473,226],[390,226]],'#5b8975');
    shape(c,[[317,89],[346,78],[379,91],[376,146],[396,213],[362,234],[322,216],[331,156]],'#8ddadd');
    shape(c,[[339,87],[356,84],[352,161],[368,224],[348,224],[340,164]],'#d7fbef');
    shape(c,[[367,87],[379,91],[377,156],[392,210],[379,218],[364,158]],'#44b9c2');
    for(let i=0;i<13;i++) {const yy=94+((t*74+i*27)%117);const xx=334+(i%4)*11+Math.sin(yy*.04)*4;line(c,[[xx,yy],[xx-1,yy+9+(i%3)*3]],i%2?'#ecfff8':'#55bfc4',2);}
    for(let i=0;i<18;i++){const a=i*2.399;const ph=(t*.7+i*.07)%1;circle(c,356+Math.cos(a)*ph*59,224-Math.sin(ph*Math.PI)*22-Math.abs(Math.sin(a))*9,1.7+(i%3)*.4,i%2?'#6ececb':'#ffffff');}
    for(let i=0;i<3;i++){c.strokeStyle=i===1?'#f6fffa':'#83cbc3';c.lineWidth=2;c.beginPath();c.ellipse(356,236+i*7,44+i*23+Math.sin(t*3+i)*3,5,0,0,Math.PI*2);c.stroke();}
    for(const [x,y,a] of [[267,168,-1.1],[280,102,-.8],[408,153,-2.1],[445,202,-2]]){leaf(c,x,y,22,a,'#216e5b');leaf(c,x,y,17,a-.8,'#54a077');}
    ellipse(c,293,233,24,9,'#537e70');ellipse(c,424,231,25,11,'#527c70');
  }
  function volcano(c,t) {
    ellipse(c,360,248,133,9,'rgba(121,67,36,.10)');
    shape(c,[[229,241],[306,170],[332,132],[383,132],[412,172],[490,241]],'#8f7763');
    shape(c,[[229,241],[326,146],[337,136],[355,242]],'#677664');
    shape(c,[[355,242],[361,139],[381,136],[419,181],[490,241]],'#556551');
    shape(c,[[267,241],[331,160],[321,207],[310,232]],'#839277');
    shape(c,[[410,190],[378,140],[366,168],[381,206],[377,241],[359,239],[365,198],[351,170],[340,148],[331,142],[347,133],[378,134]],'#d15c2f');
    line(c,[[348,146],[358,167],[355,184],[372,211]],'#ffb34e',4);
    ellipse(c,358,137,30,9,'#503a35');ellipse(c,358,136,23,5,'#fda945');
    const power = ease((t-.5)/1.25);
    for(let i=0;i<8;i++) {const k=i/8;const x=357+Math.sin(i*4.2)*power*(20+k*34);const y=124-k*(57+35*power);ellipse(c,x,y,11+k*13,11+k*8,i%2?'#d7c7b6':'#c2b4a8');}
    const rng=random(99);
    for(let i=0;i<29;i++){const a=-Math.PI*.94+rng()*Math.PI*.88;const speed=48+rng()*66;const phase=clamp((t-.52)/1.5);const x=357+Math.cos(a)*speed*phase;const y=130+Math.sin(a)*speed*phase+24*phase*phase;const r=1.5+rng()*2.1;circle(c,x,y,r,i%3?'#eb883c':'#b9532c');}
    line(c,[[220,246],[499,246]],'#c5c9ac',2);
    for(const [x,y] of [[251,231],[446,224],[278,217]]) {shape(c,[[x-9,y+9],[x,y-10],[x+9,y+9]],'#3f775f');line(c,[[x,y+4],[x,y+12]],'#46705a',2);}
  }
  function town(c,t) {
    const sway=Math.sin(t*2)*.035;
    // Composición propia inspirada en flores, fachadas y colores de los murales.
    ellipse(c,360,245,134,8,'rgba(163,70,123,.08)');
    shape(c,[[268,237],[268,164],[310,140],[350,164],[350,237]],'#eeb24d');
    shape(c,[[366,237],[366,169],[411,143],[458,170],[458,237]],'#79b9ba');
    line(c,[[261,165],[310,136],[357,165]],'#a85555',6);line(c,[[359,169],[411,139],[464,169]],'#b95757',6);
    c.fillStyle='#e67382';c.fillRect(321,150,64,89);shape(c,[[314,152],[353,116],[391,152]],'#77588f');
    c.fillStyle='#684d7e';c.fillRect(343,199,20,39);circle(c,353,198,10,'#684d7e');
    for(const [x,y] of [[282,183],[323,184],[388,186],[430,186]]) {c.fillStyle='#fff2db';c.fillRect(x,y,14,20);line(c,[[x+7,y],[x+7,y+20]],'#956660',2);}
    circle(c,353,165,10,'#ffe4a2');circle(c,353,165,5,'#a16988');
    for(const [x,y,a,s] of [[256,234,-1.5,27],[450,234,-2,26],[248,199,-1.65,22],[469,202,-2.2,20]]){leaf(c,x,y,s,a+sway,'#277d79');leaf(c,x,y,s*.8,a-.8+sway,'#5c9c68');}
    const flowers=[[254,154,25,'#c63588'],[469,147,23,'#e39c32'],[286,111,19,'#9a4f9c'],[423,99,24,'#b9317e'],[328,83,16,'#e8a338'],[383,72,18,'#da6299'],[224,206,18,'#e99b37'],[488,222,17,'#a24e9b']];
    flowers.forEach(([x,y,r,col],i)=>flower(c,x,y,r*(.9+.1*Math.sin(t*2+i)),col,sway*(i%2?1:-1)));
    // Pequeña ave ornamental original entre las flores.
    c.save();c.translate(383,107);c.rotate(Math.sin(t*4)*.06);ellipse(c,0,0,13,8,'#398d99',-.3);circle(c,11,-5,6,'#398d99');shape(c,[[16,-6],[24,-3],[15,-2]],'#e8a23a');shape(c,[[-8,2],[-26,-5],[-21,11]],'#3d7e8d');ellipse(c,-3,-3,9,5,'#f3b649',-.5);circle(c,12,-7,1.2,'#263f4f');c.restore();
  }
  const scenes={nacionales:flag,internacionales:flight,rios:river,volcanes:volcano,pueblos:town};

  function textLayout(c,key,label) {
    let size = key==='rios'?83:key==='internacionales'?62:key==='pueblos'?68:76;
    c.font=`${WEIGHT} ${size}px ${FONT}`;
    while(c.measureText(label).width>644) {size-=1;c.font=`${WEIGHT} ${size}px ${FONT}`;}
    c.textAlign='center';c.textBaseline='alphabetic';
    return size;
  }
  function paintText(c,key,label,alpha=1) {
    c.save();c.globalAlpha=alpha; textLayout(c,key,label);
    const grad=c.createLinearGradient(80,140,650,174);const colors=palette[key].colors;
    colors.forEach((color,i)=>grad.addColorStop(i/(colors.length-1),color));c.fillStyle=grad;
    c.fillText(label,360,176);c.restore();
  }
  function sample(c) {
    const data=c.getImageData(0,0,W,H).data,out=[];
    for(let y=36;y<H-20;y+=2)for(let x=50;x<W-50;x+=2){const o=(y*W+x)*4;if(data[o+3]>110)out.push({x,y,r:data[o],g:data[o+1],b:data[o+2]});}
    return out;
  }
  function shuffle(a,rng) {for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  class Renderer {
    constructor(key, {createCanvas,label,particles=2400,flourish=true}={}) {
      if(!palette[key])throw new Error(`Categoría desconocida: ${key}`);
      this.key=key;this.label=label||palette[key].label;this.flourish=flourish!==false;this.createCanvas=createCanvas||(()=>document.createElement('canvas'));
      const a=this.createCanvas(W,H);a.width=W;a.height=H;const c=a.getContext('2d',{willReadFrequently:true});
      scenes[key](c,START);const source=shuffle(sample(c),random(12));c.clearRect(0,0,W,H);paintText(c,key,this.label);const dest=shuffle(sample(c),random(19));
      const rng=random(27);this.points=[];
      const count=Math.max(300,Math.min(3600,particles));
      for(let i=0;i<count;i++){
        const s=source[i%source.length],d=dest[i%dest.length];
        this.points.push({s,d,seed:rng(),arc:30+rng()*60,spread:(rng()-.5)*110});
      }
    }
    draw(c,seconds,{width=W,height=H,background=false}={}) {
      const t=clamp(seconds,0,END),u=clamp((t-START)/MORPH),k=this.key;
      c.save();c.clearRect(0,0,width,height);c.scale(width/W,height/H);
      if(background){c.fillStyle=palette[k].bg;c.fillRect(0,0,W,H);}
      if(u===0) scenes[k](c,t);
      else if(u<1) {
        const imageOpacity=1-ease(u/.19);if(imageOpacity>0){c.save();c.globalAlpha=imageOpacity;scenes[k](c,START);c.restore();}
        const particleOpacity=ease(u/.16)*(1-ease((u-.83)/.17));
        for(const p of this.points) {
          const travel=ease((u-p.seed*.08)/.92),arch=Math.sin(travel*Math.PI),{s,d}=p;
          let x=mix(s.x,d.x,travel),y=mix(s.y,d.y,travel);
          if(k==='nacionales'){y+=Math.sin(s.x*.024+u*8)*arch*24;x+=arch*p.spread*.3;}
          if(k==='internacionales'){y-=arch*(p.arc+24);x+=arch*p.spread*.7;}
          if(k==='rios'){y+=arch*(p.arc*.58);x+=Math.sin(p.seed*20+u*6)*arch*18;}
          if(k==='volcanes'){y-=arch*(p.arc+31);x+=arch*p.spread*.8;}
          if(k==='pueblos'){x+=Math.cos(p.seed*Math.PI*8+u*3)*arch*39;y+=Math.sin(p.seed*Math.PI*8+u*3)*arch*33;}
          const colorBlend=ease(travel);const rr=Math.round(mix(s.r,d.r,colorBlend)),gg=Math.round(mix(s.g,d.g,colorBlend)),bb=Math.round(mix(s.b,d.b,colorBlend));
          c.globalAlpha=particleOpacity;c.fillStyle=`rgb(${rr},${gg},${bb})`;
          const radius=1.15+arch*(k==='pueblos'?1.35:.7);c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();
        }
        c.globalAlpha=1;if(u>.76)paintText(c,k,this.label,ease((u-.76)/.24));
      } else paintText(c,k,this.label);
      if(this.flourish&&u>.64){
        const a=ease((u-.64)/.36);c.save();c.globalAlpha=a;
        c.strokeStyle=palette[k].color;c.lineWidth=2;c.beginPath();c.moveTo(331,206);c.lineTo(389,206);c.stroke();
        if(k==='pueblos'){flower(c,306,206,7,'#d99235');flower(c,414,206,7,'#b9448d');}
        else if(k==='rios'){c.strokeStyle='#3caca0';c.beginPath();c.moveTo(326,215);c.quadraticCurveTo(342,220,359,215);c.quadraticCurveTo(375,210,394,215);c.stroke();}
        else{circle(c,318,206,2,palette[k].color);circle(c,402,206,2,palette[k].color);}
        c.restore();
      }
      c.restore();
    }
  }

  class Animation {
    constructor(canvas,key,options={}) {
      this.canvas=canvas;this.options=options;this.key=key;this.dead=false;this.visible=false;this.frame=0;this.time=END;this.playing=false;this.last=0;
      this.speed=options.speed>0?options.speed:1;
      this.media=window.matchMedia('(prefers-reduced-motion: reduce)');
      this.renderer=new Renderer(key,options);
      this.resize=()=>{if(this.dead)return;const rect=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));this.render();};
      this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);
      this.motionChange=()=>{if(this.media.matches){this.stop();this.time=END;this.render();}};this.media.addEventListener('change',this.motionChange);
      this.visibilityChange=()=>{this.last=0;if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0;}else this.schedule();};document.addEventListener('visibilitychange',this.visibilityChange);
      this.tick=now=>{this.frame=0;if(this.dead||!this.playing||!this.visible||document.hidden)return;if(this.last)this.time+=Math.min((now-this.last)/1000,.05)*this.speed;this.last=now;this.render();if(this.time>=4.35){this.playing=false;this.options.onComplete?.();}else this.schedule();};
      this.intersection=new IntersectionObserver(entries=>{const was=this.visible;this.visible=entries[0].isIntersecting;if(this.visible&&!this.started&&options.autoplay!==false){this.started=true;this.play();}else if(this.visible&&!was){this.last=0;this.schedule();}else if(!this.visible){cancelAnimationFrame(this.frame);this.frame=0;this.last=0;}},{threshold:.12});this.intersection.observe(canvas);
      this.resize();
    }
    render(){this.renderer.draw(this.canvas.getContext('2d'),this.time,{width:this.canvas.width,height:this.canvas.height});}
    schedule(){if(!this.dead&&!this.frame&&this.playing&&this.visible&&!document.hidden)this.frame=requestAnimationFrame(this.tick);}
    play(){if(this.dead)return;cancelAnimationFrame(this.frame);this.frame=0;this.last=0;this.time=this.media.matches?END:0;this.playing=!this.media.matches;this.started=true;this.render();this.schedule();}
    stop(){cancelAnimationFrame(this.frame);this.frame=0;this.playing=false;this.last=0;}
    seek(seconds){this.stop();this.time=seconds;this.render();}
    destroy(){this.dead=true;this.stop();this.observer.disconnect();this.intersection.disconnect();this.media.removeEventListener('change',this.motionChange);document.removeEventListener('visibilitychange',this.visibilityChange);}
  }
  root.TourMotion={Renderer,Animation,palette,duration:END,width:W,height:H,
    setFont(family,weight){if(family)FONT=family;if(weight)WEIGHT=weight;}};
})(typeof window!=='undefined'?window:globalThis);

export const TourMotion = (typeof window !== 'undefined' ? window : globalThis).TourMotion;
