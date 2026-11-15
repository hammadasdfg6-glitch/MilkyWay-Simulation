var $t=Object.defineProperty;var Yt=(o,t,e)=>t in o?$t(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var d=(o,t,e)=>Yt(o,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();const It=2200,_t=42e3,mt=512,vt=1/_t,jt=1/It,Zt=14387.76877;function Qt(o){const t=(o-442)*(o<442?.0624:.0374),e=(o-599.8)*(o<599.8?.0264:.0323),a=(o-501.1)*(o<501.1?.049:.0382);return .362*Math.exp(-.5*t*t)+1.056*Math.exp(-.5*e*e)-.065*Math.exp(-.5*a*a)}function Jt(o){const t=(o-568.8)*(o<568.8?.0213:.0247),e=(o-530.9)*(o<530.9?.0613:.0322);return .821*Math.exp(-.5*t*t)+.286*Math.exp(-.5*e*e)}function te(o){const t=(o-437)*(o<437?.0845:.0278),e=(o-459)*(o<459?.0385:.0725);return 1.217*Math.exp(-.5*t*t)+.681*Math.exp(-.5*e*e)}function ee(o){let t=0,e=0,a=0;for(let c=380;c<=780;c+=5){const l=c*.001,u=l*l*l*l*l,h=Zt/(l*o),f=1/(u*Math.expm1(h));t+=f*Qt(c),e+=f*Jt(c),a+=f*te(c)}let s=3.2404542*t-1.5371385*e-.4985314*a,i=-.969266*t+1.8760108*e+.041556*a,n=.0556434*t-.2040259*e+1.0572252*a;s=Math.max(0,s),i=Math.max(0,i),n=Math.max(0,n);const r=Math.max(s,i,n,1e-8);return[s/r,i/r,n/r]}const nt=new Float32Array(mt*3);for(let o=0;o<mt;o++){const t=o/(mt-1),a=1/(vt+t*(jt-vt)),[s,i,n]=ee(a),r=o*3;nt[r]=s,nt[r+1]=i,nt[r+2]=n}function T(o){return Number.isFinite(o)?Math.min(_t,Math.max(It,o)):5778}function B(o){const t=Math.max(1e-7,o()),e=o();return Math.sqrt(-2*Math.log(t))*Math.cos(2*Math.PI*e)}function ae(o,t){const e=Math.max(1e-6,o()),a=1-t,s=1,i=Math.pow(12,a),n=Math.pow(s+e*(i-s),1/a);return Math.min(1,Math.max(0,(n-1)/11))}function se(o,t,e=0,a={tempK:5778,luminosity:1,size:1}){const s=(n,r,c)=>(a.tempK=n,a.luminosity=r,a.size=c,a),i=t();switch(o){case 0:{if(e>.2&&t()<.22*e){const l=T(11e3+Math.pow(t(),1.4)*24e3),u=2.6+Math.pow(t(),2.2)*8.5,h=1.4+Math.min(1.6,u*.14);return s(l,u,h)}if(i<.54){const l=T(4550+B(t)*380),u=1+e*.75,h=(.55+Math.pow(t(),1.6)*2.1)*u,f=.9+Math.min(1.2,h*.25);return s(l,h,f)}if(i<.88){const l=T(3450+B(t)*320),h=(.75+Math.pow(t(),2.1)*4.2)*(1+e*.6),f=1.05+Math.min(1.5,h*.22);return s(l,h,f)}if(i<.965){const l=T(5400+B(t)*340),u=.4+t()*.8,h=.85+t()*.35;return s(l,u,h)}const n=T(7400+t()*2400),r=.85+t()*1.9,c=1.1+t()*.55;return s(n,r,c)}case 1:{if(i<.16){const l=ae(t,2.35),u=T(22500+(1-l)*18e3),h=3.8+Math.pow(1-l,1.5)*11.5,f=1.65+Math.min(1.65,h*.11);return s(u,h,f)}if(i<.62){const l=Math.pow(t(),1.35),u=T(10500+l*11500),h=1.3+l*3.8,f=1.15+Math.min(1.25,h*.19);return s(u,h,f)}if(i<.88){const l=T(8e3+t()*2500),u=.75+t()*1.45,h=.95+t()*.55;return s(l,u,h)}if(t()<.3){const l=T(3550+B(t)*260),u=4.2+t()*6.5,h=1.7+t()*.9;return s(l,u,h)}const n=T(6400+t()*1600),r=.55+t()*.9,c=.85+t()*.4;return s(n,r,c)}case 2:{if(i<.28){const l=T(2850+Math.pow(t(),.85)*1250),u=.22+t()*.42,h=.72+t()*.28;return s(l,u,h)}if(i<.6){const l=T(4200+t()*1750),u=.34+t()*.65,h=.8+t()*.35;return s(l,u,h)}if(i<.84){const l=T(6e3+Math.pow(t(),1.2)*2200),u=.55+t()*1.1,h=.9+t()*.45;return s(l,u,h)}if(i<.94){const l=T(4300+B(t)*420),u=1.25+Math.pow(t(),1.8)*3.4,h=1.15+Math.min(1.1,u*.22);return s(l,u,h)}const n=T(8200+t()*3300),r=.9+t()*1.9,c=1.05+t()*.55;return s(n,r,c)}case 3:{if(i<.44){const l=T(3800+t()*1300),u=.28+t()*.52,h=.78+t()*.3;return s(l,u,h)}if(i<.8){const l=T(5100+Math.pow(t(),1.15)*1300),u=.42+t()*.78,h=.85+t()*.35;return s(l,u,h)}const n=T(4150+B(t)*380),r=1.15+Math.pow(t(),1.7)*2.8,c=1.1+t()*.75;return s(n,r,c)}case 4:default:{if(i<.22){const l=T(7800+Math.pow(t(),1.5)*6700),u=1.35+t()*2.3,h=1.15+t()*.65;return s(l,u,h)}if(i<.66){const l=T(4450+B(t)*410),u=1.1+Math.pow(t(),1.8)*3.6,h=1.05+Math.min(1.25,u*.24);return s(l,u,h)}const n=T(5200+t()*1400),r=.35+t()*.68,c=.82+t()*.32;return s(n,r,c)}}}const bt=8,yt=8,ft=8.178,Ot=.001022712165,Kt=.041,$=.025,Bt=27*Math.PI/180,N=Math.cos(Bt),V=Math.sin(Bt),ie=12.5,zt=1/Math.tan(ie*Math.PI/180),Nt=3.1,W=[0,Math.PI*.5,Math.PI,Math.PI*1.5],lt=[.27,.56,.77,1],D=Math.PI*2;function rt(o){let t=(o^2654435769)>>>0;const e=()=>{t=t+2654435769>>>0;let r=t^t>>>16;return r=Math.imul(r,2246822507)>>>0,r=r^r>>>13,r=Math.imul(r,3266489909)>>>0,(r^r>>>16)>>>0};let a=e()||1,s=e()||2,i=e()||3,n=e()||4;return()=>{const r=Math.imul(xt(Math.imul(s,5),7),9)>>>0,c=s<<9>>>0;return i^=a,n^=s,s^=i,a^=n,i^=c,n=xt(n,11),r/4294967296}}function xt(o,t){return(o<<t|o>>>32-t)>>>0}function C(o){let t=0,e=0,a=0;do t=o()*2-1,e=o()*2-1,a=t*t+e*e;while(a>=1||a<=1e-9);return t*Math.sqrt(-2*Math.log(a)/a)}function Q(o,t){const e=.002+o()*.996;return t*.5*Math.log(e/(1-e))}function Vt(o){const t=Math.max(o,.45);return 225*Math.tanh(o/1.4)*Ot/t}function Z(o,t){return t-zt*Math.log(Math.max(o,1.15)/Nt)}const F=512,it=new Float32Array(F);(()=>{const e=2.5600000000000005,a=new Float64Array(F);let s=0;for(let n=0;n<F;n++){const r=.25+31.75*n/(F-1),c=r*r*Math.pow(r*r+e,-1.75);s+=c,a[n]=s}for(let n=0;n<F;n++)a[n]/=s;let i=0;for(let n=0;n<F;n++){const r=n/(F-1);for(;i<F-2&&a[i+1]<r;)i++;const c=a[i],l=a[i+1],u=l>c?(r-c)/(l-c):0,h=.25+(32-.25)*i/(F-1),f=.25+(32-.25)*(i+1)/(F-1);it[n]=h+(f-h)*u}})();function oe(o){const t=o()*(F-1),e=Math.floor(t),a=Math.min(F-1,e+1),s=t-e;return it[e]+(it[a]-it[e])*s}const Y=(()=>{const o=rt(1196183362),t=[{name:"Omega Centauri (NGC 5139)",x:-4.98,y:1.38,z:3.93,omega:.011,coreRadiusKpc:.015,tidalRadiusKpc:.075,weight:2.3},{name:"47 Tucanae (NGC 104)",x:-6.31,y:-3.16,z:2.58,omega:.012,coreRadiusKpc:.012,tidalRadiusKpc:.062,weight:2},{name:"Hercules Cluster (M13)",x:-5.53,y:4.47,z:-4.41,omega:.009,coreRadiusKpc:.011,tidalRadiusKpc:.056,weight:1.7},{name:"M22 (NGC 6656)",x:-5.06,y:-.4,z:-.54,omega:.015,coreRadiusKpc:.012,tidalRadiusKpc:.058,weight:1.7}];for(let e=t.length;e<120;e++){const s=o()<.72?1.4+Math.pow(o(),1.35)*10.5:8+Math.pow(o(),1.6)*18,i=2*o()-1,n=Math.sqrt(Math.max(0,1-i*i)),r=o()*D,c=s*n*Math.cos(r),l=s*i*.82,u=s*n*Math.sin(r),h=Math.hypot(c,u),E=Vt(Math.max(h,1))*(.25+o()*.45)*(o()<.85?1:-1),p=.007+o()*.01,M=p*(4.2+o()*2.4),w=.65+Math.pow(o(),1.4)*1.1;t.push({name:`GC-${e+1}`,x:c,y:l,z:u,omega:E,coreRadiusKpc:p,tidalRadiusKpc:M,weight:w})}return t})(),Mt=(()=>{const o=new Float64Array(Y.length);let t=0;for(let e=0;e<Y.length;e++)t+=Y[e].weight,o[e]=t;for(let e=0;e<Y.length;e++)o[e]/=t;return o})();function re(o){const t=o();let e=0,a=Mt.length-1;for(;e<a;){const s=e+a>>1;Mt[s]<t?e=s+1:a=s}return Y[e]}const H=(()=>{const o=rt(1329744718),t=[{x:-8.518,y:-.116,z:.188,radiusKpc:.14,luminosityBoost:1.55},{x:-7.39,y:-.027,z:2.48,radiusKpc:.24,luminosityBoost:1.65},{x:-6.5,y:.045,z:-.51,radiusKpc:.19,luminosityBoost:1.5},{x:-4.24,y:-.029,z:1.47,radiusKpc:.18,luminosityBoost:1.7},{x:-9.8,y:-.148,z:-1.63,radiusKpc:.21,luminosityBoost:1.5},{x:-7.47,y:.14,z:-2.08,radiusKpc:.22,luminosityBoost:1.45}];for(let e=0;e<156;e++){const a=e%4,s=2.6+Math.pow(o(),.92)*11.8,i=C(o)*(.045+.015*(s/10)),n=Z(s,W[a])+i,r=s*Math.cos(n),c=s*Math.sin(n),l=C(o)*.045;t.push({x:r,y:l,z:c,radiusKpc:.1+o()*.22,luminosityBoost:1.15+o()*.65})}for(let e=0;e<18;e++){const s=6.9+e/17*2.7,i=Math.PI-3.6*Math.log(s/ft)+C(o)*.03,n=s*Math.cos(i),r=s*Math.sin(i),c=C(o)*.04;t.push({x:n,y:c,z:r,radiusKpc:.09+o()*.16,luminosityBoost:1.15+o()*.55})}return t})();function ot(o){const t=o();return t<lt[0]?W[0]:t<lt[1]?W[1]:t<lt[2]?W[2]:W[3]}function ne(o,t){const e=-zt*Math.log(Math.max(o,1.15)/Nt);let a=Math.PI;for(let s=0;s<4;s++){const i=W[s]+e;let n=(t-i)%D;n>Math.PI&&(n-=D),n<-Math.PI&&(n+=D);const r=Math.abs(n);r<a&&(a=r)}return a}function wt(o,t){const e=Math.max(0,Math.floor(t)),a=new Float32Array(e*bt),s=rt(1518082531^Math.imul(o+1,2654435769)),i={tempK:5778,luminosity:1,size:1};for(let n=0;n<e;n++){const r=s();let c=0,l=0,u=0,h=0,f=2,E=0,p=1;if(r<.21){f=0,h=Kt;const b=s();if(b<.075){const v=Math.min(.35,.0035+Math.pow(s(),1.65)*.3465),g=2*s()-1,y=Math.sqrt(Math.max(0,1-g*g)),m=s()*D;c=v*y*Math.cos(m),l=v*g*.68,u=v*y*Math.sin(m),E=Math.exp(-v/.14),p=1+.25*E}else if(b<.52){const v=C(s)*1.15,g=C(s)*.72,y=1+.38*Math.exp(-Math.pow((Math.abs(v)-.95)/.65,2)),x=(s()<.5?-1:1)*.19*Math.exp(-Math.pow((Math.abs(v)-1.05)/.55,2)),P=C(s)*.48*y+x;c=v*N-g*V,l=P,u=v*V+g*N}else{const v=Math.min(4.1,Math.abs(C(s))*1.85)*(s()<.5?-1:1),g=1-.35*Math.min(1,Math.abs(v)/3.8),y=C(s)*.56*g,m=C(s)*.36*g;c=v*N-y*V,l=m,u=v*V+y*N}}else if(r<.45){f=1,h=$;const b=s();if(b<.31){const v=H[Math.floor(s()*H.length)],g=Math.max(1e-6,s()),y=v.radiusKpc*Math.sqrt(-.42*Math.log(g)),m=s()*D;c=v.x+y*Math.cos(m),u=v.z+y*Math.sin(m),l=v.y+C(s)*.045,p=v.luminosityBoost}else if(b<.42){const v=6.7+s()*3.1,g=Math.PI-3.6*Math.log(v/ft),y=.32/v,m=g+C(s)*y;c=v*Math.cos(m),u=v*Math.sin(m),l=Q(s,.115)}else{const v=s(),g=2.4+Math.pow(v,.92)*13.4,y=ot(s),m=.045*Math.sin(2.4*Math.log(g/3.1)+y),x=s()<.22?1.55:1,P=(.28+.045*g)*x,S=C(s)*(P/g),k=Z(g,y)+m+S;c=g*Math.cos(k),u=g*Math.sin(k);const U=.095+.07*Math.min(1,Math.max(0,(g-4)/11));l=Q(s,U)}}else if(r<.79){f=2;let b=0;for(let P=0;P<4;P++){const S=Math.max(1e-6,s()),k=Math.max(1e-6,s());if(b=-2.6*(Math.log(S)+Math.log(k)),b<=17.8)break}b>17.8&&(b=17.8*(.5+.5*s()));let v=s()*D;if(b>3){const P=ne(b,v),S=Math.exp(-(P*P)/(2*.35*.35));s()>.78+.22*S&&(v=s()*D)}c=b*Math.cos(v),u=b*Math.sin(v);const g=Math.min(1,Math.max(0,(b-4)/12)),y=.22+.23*Math.pow(g,1.35),m=Math.max(0,(b-10.5)/5.5),x=.42*Math.pow(m,1.55)*Math.sin(v-.35);l=Q(s,y)+x,h=Vt(b)}else if(r<.92){f=3;let b=0;for(let x=0;x<4;x++){const P=Math.max(1e-6,s()),S=Math.max(1e-6,s());if(b=-3.4*(Math.log(P)+Math.log(S)),b<=19.5)break}b>19.5&&(b=19.5*(.45+.55*s()));const v=s()*D;c=b*Math.cos(v),u=b*Math.sin(v);const g=.78+.16*Math.min(1,b/16);l=Q(s,g);const y=Math.max(b,.55);h=.84*225*Math.tanh(b/1.6)*Ot/y}else if(f=4,s()<.15){const b=re(s),v=s(),g=Math.sqrt(Math.pow(1-v*.92,-1.25)-1),y=Math.min(b.tidalRadiusKpc,b.coreRadiusKpc*g),m=2*s()-1,x=Math.sqrt(Math.max(0,1-m*m)),P=s()*D;c=b.x+y*x*Math.cos(P),l=b.y+y*m,u=b.z+y*x*Math.sin(P),h=b.omega,p=1.32}else{const b=oe(s),v=2*s()-1,g=Math.sqrt(Math.max(0,1-v*v)),y=s()*D,m=.72+.18*Math.min(1,b/22);c=b*g*Math.cos(y),l=b*v*m,u=b*g*Math.sin(y),h=.0025+C(s)*.007}const M=se(f,s,E,i),w=n*bt;a[w]=c,a[w+1]=l,a[w+2]=u,a[w+3]=h,a[w+4]=T(M.tempK),a[w+5]=M.luminosity*p,a[w+6]=M.size,a[w+7]=f}return{chunkIndex:o,starCount:e,buffer:a}}function le(o=16e3){const t=Math.max(0,Math.floor(o)),e=new Float32Array(t*yt),a=rt(1852138101);for(let s=0;s<t;s++){const i=a();let n=0,r=0,c=0,l=$,u=0,h=.25,f=.8;if(i<.38)if(u=0,l=$,a()<.42){const p=H[Math.floor(a()*H.length)],M=p.radiusKpc*(.2+a()*1.15),w=a()*D;n=p.x+M*Math.cos(w),c=p.z+M*Math.sin(w),r=p.y+C(a)*.03,h=.14+a()*.28,f=(.78+a()*.72)*Math.min(1.3,p.luminosityBoost)}else if(a()<.16){const p=6.9+a()*2.8,M=Math.PI-3.6*Math.log(p/ft)+C(a)*(.22/p);n=p*Math.cos(M),c=p*Math.sin(M),r=C(a)*.035,h=.16+a()*.26,f=.65+a()*.65}else{const p=2.6+Math.pow(a(),.95)*12.2,M=ot(a),w=Z(p,M)+.04+C(a)*(.24/p);n=p*Math.cos(w),c=p*Math.sin(w),r=C(a)*.04,h=.16+a()*.34,f=.62+a()*.75}else if(i<.65){if(u=1,l=$,a()<.48){const p=H[Math.floor(a()*H.length)],M=p.radiusKpc*(.3+a()*1.4),w=a()*D;n=p.x+M*Math.cos(w),c=p.z+M*Math.sin(w),r=p.y+C(a)*.04}else{const p=2.8+Math.pow(a(),.95)*12.4,M=ot(a),w=Z(p,M)+C(a)*(.32/p);n=p*Math.cos(w),c=p*Math.sin(w),r=C(a)*.05}h=.2+a()*.36,f=.55+a()*.68}else if(u=2,a()<.45){l=Kt;const p=C(a)*1.45,M=C(a)*.68,w=C(a)*.32;n=p*N-M*V,r=w,c=p*V+M*N,h=.45+a()*.9,f=.48+a()*.52}else{l=$;const p=2.5+Math.pow(a(),.95)*11.5,M=ot(a),w=a()<.72?Z(p,M)+C(a)*(.55/p):a()*D;n=p*Math.cos(w),c=p*Math.sin(w),r=C(a)*.09,h=.55+a()*1.15,f=.32+a()*.48}const E=s*yt;e[E]=n,e[E+1]=r,e[E+2]=c,e[E+3]=l,e[E+4]=u,e[E+5]=h,e[E+6]=f,e[E+7]=a()}return{count:t,buffer:e}}const G=5e5;class ce{constructor(){d(this,"workers",[]);d(this,"cachedChunks",new Map);d(this,"inFlightChunks",new Set);d(this,"queue",[]);d(this,"nebulaCache",null);d(this,"targetCount",0);d(this,"onChunk",null);d(this,"onProgress",null);d(this,"disposed",!1);d(this,"initialized",!1)}ensureWorkers(){if(this.initialized||this.disposed||(this.initialized=!0,typeof Worker>"u"))return;const t=typeof navigator<"u"&&navigator.hardwareConcurrency?navigator.hardwareConcurrency:4,e=Math.max(1,Math.min(t,6));for(let a=0;a<e;a++){const s=new Worker(new URL("/assets/starWorker-BfKx-x2g.js",import.meta.url),{type:"module"}),i={worker:s,busy:!1,currentChunkIndex:null};s.onmessage=n=>{var u;if(this.disposed)return;const r=n.data;i.busy=!1;const c=i.currentChunkIndex;if(i.currentChunkIndex=null,c!==null&&this.inFlightChunks.delete(c),"error"in r){console.error(`[StarPool] Worker error generating chunk ${r.chunkIndex}: ${r.error}`),this.dispatchNext();return}const l={chunkIndex:r.chunkIndex,starCount:r.starCount,buffer:new Float32Array(r.buffer)};this.cachedChunks.set(l.chunkIndex,l),(u=this.onChunk)==null||u.call(this,l),this.emitProgress(),this.dispatchNext()},s.onerror=n=>{var c;if(this.disposed)return;console.error("[StarPool] Worker runtime error:",n.message);const r=i.currentChunkIndex;if(i.busy=!1,i.currentChunkIndex=null,r!==null){this.inFlightChunks.delete(r);const l=this.getChunkStarCount(r);if(l>0&&!this.cachedChunks.has(r)){const u=wt(r,l);this.cachedChunks.set(u.chunkIndex,u),(c=this.onChunk)==null||c.call(this,u),this.emitProgress()}}this.dispatchNext()},this.workers.push(i)}}startGeneration(t,e,a){if(this.disposed)return;this.onChunk=e,this.onProgress=a??null,this.ensureWorkers(),this.targetCount=Math.max(0,t);const s=Math.ceil(this.targetCount/G);for(let i=0;i<s;i++){const n=this.cachedChunks.get(i);n&&this.onChunk(n)}this.enqueueMissingChunks(s),this.emitProgress(),this.dispatchNext()}ensureStars(t){if(this.disposed)return;this.targetCount=Math.max(0,t);const e=Math.ceil(this.targetCount/G);for(let a=this.queue.length-1;a>=0;a--)this.queue[a]>=e&&this.queue.splice(a,1);this.enqueueMissingChunks(e),this.emitProgress(),this.dispatchNext()}getNebulaCloudBuffer(t=16e3){return(!this.nebulaCache||this.nebulaCache.count!==t)&&(this.nebulaCache=le(t)),this.nebulaCache}getLoadedStarCount(){const t=Math.ceil(this.targetCount/G);let e=0;for(let a=0;a<t;a++){const s=this.cachedChunks.get(a);s&&(e+=s.starCount)}return Math.min(e,this.targetCount)}dispose(){if(!this.disposed){this.disposed=!0,this.queue.length=0,this.inFlightChunks.clear(),this.cachedChunks.clear(),this.nebulaCache=null,this.onChunk=null,this.onProgress=null;for(const t of this.workers)t.worker.terminate();this.workers.length=0}}getChunkStarCount(t){const e=t*G;return Math.max(0,Math.min(G,this.targetCount-e))}enqueueMissingChunks(t){for(let e=0;e<t;e++)!this.cachedChunks.has(e)&&!this.inFlightChunks.has(e)&&!this.queue.includes(e)&&this.queue.push(e)}emitProgress(){var t;(t=this.onProgress)==null||t.call(this,this.getLoadedStarCount(),this.targetCount)}dispatchNext(){var t;if(!(this.disposed||this.queue.length===0)){if(this.workers.length===0){const e=this.queue.shift();if(e===void 0)return;const a=this.getChunkStarCount(e);if(a>0){const s=wt(e,a);this.cachedChunks.set(s.chunkIndex,s),(t=this.onChunk)==null||t.call(this,s),this.emitProgress()}this.queue.length>0&&queueMicrotask(()=>this.dispatchNext());return}for(const e of this.workers){if(this.queue.length===0)break;if(e.busy)continue;const a=this.queue.shift(),s=this.getChunkStarCount(a);if(s<=0)continue;e.busy=!0,e.currentChunkIndex=a,this.inFlightChunks.add(a);const i={chunkIndex:a,starCount:s};e.worker.postMessage(i)}}}}function J(){const o=new Float32Array(16);return o[0]=1,o[5]=1,o[10]=1,o[15]=1,o}function ue(o,t,e,a,s=new Float32Array(16)){const i=Math.max(t,1e-6),n=1/Math.tan(o*.5),r=1/(e-a);return s[0]=n/i,s[1]=0,s[2]=0,s[3]=0,s[4]=0,s[5]=n,s[6]=0,s[7]=0,s[8]=0,s[9]=0,s[10]=(a+e)*r,s[11]=-1,s[12]=0,s[13]=0,s[14]=2*a*e*r,s[15]=0,s}function he(o,t,e=[0,1,0],a=new Float32Array(16)){let s=o[0]-t[0],i=o[1]-t[1],n=o[2]-t[2],r=Math.hypot(s,i,n);r<1e-8?(s=0,i=0,n=1):(s/=r,i/=r,n/=r);let c=e[1]*n-e[2]*i,l=e[2]*s-e[0]*n,u=e[0]*i-e[1]*s,h=Math.hypot(c,l,u);if(h<1e-8){const M=Math.abs(e[2])<.9?[0,0,-1]:[1,0,0];c=M[1]*n-M[2]*i,l=M[2]*s-M[0]*n,u=M[0]*i-M[1]*s,h=Math.hypot(c,l,u)||1}c/=h,l/=h,u/=h;const f=i*u-n*l,E=n*c-s*u,p=s*l-i*c;return a[0]=c,a[1]=f,a[2]=s,a[3]=0,a[4]=l,a[5]=E,a[6]=i,a[7]=0,a[8]=u,a[9]=p,a[10]=n,a[11]=0,a[12]=-(c*o[0]+l*o[1]+u*o[2]),a[13]=-(f*o[0]+E*o[1]+p*o[2]),a[14]=-(s*o[0]+i*o[1]+n*o[2]),a[15]=1,a}function de(o,t,e=new Float32Array(16)){const a=o[0],s=o[1],i=o[2],n=o[3],r=o[4],c=o[5],l=o[6],u=o[7],h=o[8],f=o[9],E=o[10],p=o[11],M=o[12],w=o[13],b=o[14],v=o[15];let g=t[0],y=t[1],m=t[2],x=t[3];return e[0]=g*a+y*r+m*h+x*M,e[1]=g*s+y*c+m*f+x*w,e[2]=g*i+y*l+m*E+x*b,e[3]=g*n+y*u+m*p+x*v,g=t[4],y=t[5],m=t[6],x=t[7],e[4]=g*a+y*r+m*h+x*M,e[5]=g*s+y*c+m*f+x*w,e[6]=g*i+y*l+m*E+x*b,e[7]=g*n+y*u+m*p+x*v,g=t[8],y=t[9],m=t[10],x=t[11],e[8]=g*a+y*r+m*h+x*M,e[9]=g*s+y*c+m*f+x*w,e[10]=g*i+y*l+m*E+x*b,e[11]=g*n+y*u+m*p+x*v,g=t[12],y=t[13],m=t[14],x=t[15],e[12]=g*a+y*r+m*h+x*M,e[13]=g*s+y*c+m*f+x*w,e[14]=g*i+y*l+m*E+x*b,e[15]=g*n+y*u+m*p+x*v,e}function me(o,t=new Float32Array(16)){const e=o[0],a=o[1],s=o[2],i=o[3],n=o[4],r=o[5],c=o[6],l=o[7],u=o[8],h=o[9],f=o[10],E=o[11],p=o[12],M=o[13],w=o[14],b=o[15],v=e*r-a*n,g=e*c-s*n,y=e*l-i*n,m=a*c-s*r,x=a*l-i*r,P=s*l-i*c,S=u*M-h*p,k=u*w-f*p,U=u*b-E*p,O=h*w-f*M,K=h*b-E*M,A=f*b-E*w,I=v*A-g*K+y*O+m*U-x*k+P*S;if(Math.abs(I)<1e-12)return t.set([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),t;const R=1/I;return t[0]=(r*A-c*K+l*O)*R,t[1]=(s*K-a*A-i*O)*R,t[2]=(M*P-w*x+b*m)*R,t[3]=(f*x-h*P-E*m)*R,t[4]=(c*U-n*A-l*k)*R,t[5]=(e*A-s*U+i*k)*R,t[6]=(w*y-p*P-b*g)*R,t[7]=(u*P-f*y+E*g)*R,t[8]=(n*K-r*U+l*S)*R,t[9]=(a*U-e*K-i*S)*R,t[10]=(p*x-M*y+b*v)*R,t[11]=(h*y-u*x-E*v)*R,t[12]=(r*k-n*O-c*S)*R,t[13]=(e*O-a*k+s*S)*R,t[14]=(M*g-p*m-w*v)*R,t[15]=(u*m-h*g+f*v)*R,t}function pe(o,t,e,a){const s=o[0],i=o[1],n=o[2],r=t[0]*s+t[4]*i+t[8]*n+t[12],c=t[1]*s+t[5]*i+t[9]*n+t[13],l=t[2]*s+t[6]*i+t[10]*n+t[14],u=t[3]*s+t[7]*i+t[11]*n+t[15];if(u<=1e-6)return{x:-1e3,y:-1e3,z:1,visible:!1};const h=1/u,f=r*h,E=c*h,p=l*h,M=(f*.5+.5)*e,w=(.5-E*.5)*a,b=p>=-1&&p<=1&&f>=-1&&f<=1&&E>=-1&&E<=1;return{x:M,y:w,z:p,visible:b}}function gt(o,t){if(t===0)return[o[0],o[1],o[2]];const e=Math.cos(t),a=Math.sin(t);return[o[0]*e-o[2]*a,o[1],o[0]*a+o[2]*e]}const Wt=[-8.178,.021,0],Ht=.0285,q=.025,fe=.041,Et=[{id:"sgr-a-star",name:"Sagittarius A*",category:"core",positionKpc:[0,0,0],cameraOffsetKpc:[-.045,.018,.045],distanceFromSolLy:"26,670 ly",classification:"Supermassive Black Hole (4.15 × 10⁶ M☉)",description:"Dynamical center of the Milky Way, surrounded by the dense Nuclear Star Cluster, S-stars orbiting at relativistic speeds, and a warm dusty accretion flow.",omegaRadPerMyr:0},{id:"sol-system",name:"Solar System (Sol)",category:"solar",positionKpc:[...Wt],cameraOffsetKpc:[-.45,.22,.55],distanceFromSolLy:"0 ly",classification:"G2V Main-Sequence Star · Orion–Cygnus Spur",description:"Our home planetary system, located 8.178 kpc from the Galactic Center inside the Local Bubble on the inner edge of the Orion–Cygnus Spur.",omegaRadPerMyr:Ht},{id:"orion-nebula",name:"Orion Nebula (M42)",category:"nebula",positionKpc:[-8.518,-.116,.188],cameraOffsetKpc:[-.32,.18,.42],distanceFromSolLy:"1,344 ly",classification:"Diffuse H-II Emission Nebula · Orion Spur",description:"The closest massive star-forming region to Earth, ionized by the young OB stars of the Trapezium Cluster inside the Orion Molecular Cloud Complex.",omegaRadPerMyr:q},{id:"carina-nebula",name:"Carina Nebula (NGC 3372)",category:"nebula",positionKpc:[-7.39,-.027,2.48],cameraOffsetKpc:[-.65,.35,.75],distanceFromSolLy:"8,500 ly",classification:"Giant H-II Complex · Carina–Sagittarius Arm",description:"One of the largest and brightest diffuse nebulae in our galaxy, hosting hypergiant Eta Carinae and intense O-star feedback carving colossal dust pillars.",omegaRadPerMyr:q},{id:"cygnus-x1",name:"Cygnus X-1",category:"arm",positionKpc:[-7.47,.14,-2.08],cameraOffsetKpc:[-.55,.28,-.65],distanceFromSolLy:"7,200 ly",classification:"High-Mass X-Ray Binary (21.2 M☉ Black Hole)",description:"A landmark stellar-mass black hole accreting wind from blue supergiant HDE 226868 ahead of the Sun along the Cygnus X star-forming complex.",omegaRadPerMyr:.0298},{id:"westerlund-1",name:"Westerlund 1",category:"cluster",positionKpc:[-4.24,-.029,1.47],cameraOffsetKpc:[-.7,.4,.75],distanceFromSolLy:"13,700 ly",classification:"Super Star Cluster · Scutum–Centaurus Arm",description:"The most massive compact young star cluster known in the Milky Way, packed with hypergiants, Wolf–Rayet stars, and magnetars at R ≈ 4.5 kpc.",omegaRadPerMyr:q},{id:"eagle-nebula",name:"Eagle Nebula (M16)",category:"nebula",positionKpc:[-6.5,.045,-.51],cameraOffsetKpc:[-.5,.26,-.55],distanceFromSolLy:"5,700 ly",classification:"Young Open Cluster & H-II Region · Sagittarius Arm",description:"Home to the Pillars of Creation, where ultraviolet radiation from young cluster NGC 6611 photo-evaporates dense molecular hydrogen columns.",omegaRadPerMyr:q},{id:"perseus-double-cluster",name:"Perseus Double Cluster",category:"cluster",positionKpc:[-9.8,-.148,-1.63],cameraOffsetKpc:[-.75,.45,-.85],distanceFromSolLy:"7,500 ly",classification:"Twin Open Clusters (NGC 869 / NGC 884) · Perseus Arm",description:"A pair of rich, 14-million-year-old supergiant open clusters anchoring the outer Perseus Spiral Arm in the galactic anticenter quadrant.",omegaRadPerMyr:q},{id:"omega-centauri",name:"Omega Centauri (NGC 5139)",category:"cluster",positionKpc:[-4.98,1.38,3.93],cameraOffsetKpc:[-.95,.65,1.05],distanceFromSolLy:"17,090 ly",classification:"Massive Globular Cluster (~10⁷ Stars) · Inner Halo",description:"The largest and brightest globular cluster orbiting the Milky Way, widely interpreted as the stripped core of an ancient accreted dwarf galaxy.",omegaRadPerMyr:.011},{id:"47-tucanae",name:"47 Tucanae (NGC 104)",category:"cluster",positionKpc:[-6.31,-3.16,2.58],cameraOffsetKpc:[-.85,-.55,.95],distanceFromSolLy:"14,700 ly",classification:"Core-Collapsed Globular Cluster · Southern Halo",description:"Second brightest globular cluster in Earth’s sky, containing millions of ancient metal-poor stars and millisecond pulsars 3.16 kpc south of the disk.",omegaRadPerMyr:.012},{id:"galactic-bar-tip",name:"Galactic Bar Near Tip",category:"arm",positionKpc:[-3.21,0,-1.63],cameraOffsetKpc:[-1.4,1.1,-1.3],distanceFromSolLy:"17,050 ly",classification:"Triaxial Long Bar End (~27° Sun–GC Offset)",description:"The near end of the Milky Way’s 3.6 kpc stellar bar where gas piles up and feeds the Scutum–Centaurus spiral arm and W43 mini-starburst.",omegaRadPerMyr:fe},{id:"great-rift-vantage",name:"Great Rift Edge-On Vantage",category:"vantage",positionKpc:[-11.8,.16,1.5],cameraOffsetKpc:[-2.4,.35,.4],distanceFromSolLy:"12,800 ly",classification:"Edge-On Interstellar Dust Extinction Sightline",description:"A shallow oblique viewpoint across the outer disk looking inward through the dark molecular dust lanes of the Great Rift toward the glowing bulge.",omegaRadPerMyr:0},{id:"galactic-north-pole",name:"Galactic North Pole Overlook",category:"vantage",positionKpc:[0,18,0],cameraOffsetKpc:[-.5,10,4.5],distanceFromSolLy:"64,400 ly (North Halo)",classification:"Grand-Design Face-On Observatory Vantage",description:"High above the Galactic North Pole (+28 kpc vantage), revealing the four-armed logarithmic spiral structure, Orion Spur, and central barred bulge.",omegaRadPerMyr:0},{id:"m13-hercules",name:"Hercules Cluster (M13)",category:"cluster",positionKpc:[-5.53,4.47,-4.41],cameraOffsetKpc:[-1,.8,-1],distanceFromSolLy:"22,200 ly",classification:"Halo Globular Cluster (NGC 6205)",description:"A dense sphere of ~300,000 ancient Population II stars orbiting 4.47 kpc above the northern galactic plane in the outer halo.",omegaRadPerMyr:.009}];function Gt(o,t){return o.omegaRadPerMyr===0||t===0?[o.positionKpc[0],o.positionKpc[1],o.positionKpc[2]]:gt(o.positionKpc,o.omegaRadPerMyr*t)}const z=5e-4,X=120,ct=-1.52,ut=1.52,Pt=Math.PI*2;function L(o,t,e){return Math.min(e,Math.max(t,o))}function ht(o){let t=(o+Math.PI)%Pt;return t<0&&(t+=Pt),t-Math.PI}const St={overview:{target:[0,0,0],yaw:-.45,pitch:1.04,distanceKpc:32,fovDeg:48},oblique:{target:[0,0,0],yaw:.62,pitch:.42,distanceKpc:24.5,fovDeg:48},edge:{target:[0,0,0],yaw:.14,pitch:.032,distanceKpc:22.5,fovDeg:46},sol:{target:[-8.178,.021,0],yaw:2.35,pitch:.18,distanceKpc:.28,fovDeg:52},core:{target:[0,0,0],yaw:.55,pitch:.24,distanceKpc:.014,fovDeg:50}};class ge{constructor(t="overview"){d(this,"current");d(this,"goal");d(this,"aspect",16/9);d(this,"viewportHeightPx",900);d(this,"nearKpc",.05);d(this,"farKpc",300);d(this,"viewMatrix",J());d(this,"projMatrix",J());d(this,"viewProjMatrix",J());d(this,"invViewProjMatrix",J());d(this,"eyePos",[0,0,0]);d(this,"rightVec",[1,0,0]);d(this,"upVec",[0,1,0]);d(this,"activePointers",new Map);d(this,"lastPinchDist",0);d(this,"lastPinchCenter",null);d(this,"isUserInteracting",!1);d(this,"lastFollowPoint",null);d(this,"followedThisFrame",!1);d(this,"detachFn",null);const e=St[t];this.current={target:[...e.target],yaw:e.yaw,pitch:e.pitch,distanceKpc:e.distanceKpc,fovDeg:e.fovDeg},this.goal={target:[...e.target],yaw:e.yaw,pitch:e.pitch,distanceKpc:e.distanceKpc,fovDeg:e.fovDeg},this.recomputeMatrices()}setViewport(t,e){const a=Math.max(1,t),s=Math.max(1,e);this.aspect=a/s,this.viewportHeightPx=s,this.recomputeMatrices()}setPreset(t){const e=St[t];this.lastFollowPoint=null,this.goal.target=[e.target[0],e.target[1],e.target[2]],this.goal.yaw=this.current.yaw+ht(e.yaw-this.current.yaw),this.goal.pitch=e.pitch,this.goal.distanceKpc=e.distanceKpc,this.goal.fovDeg=e.fovDeg}flyTo(t,e,a,s){if(this.lastFollowPoint=null,this.goal.target=[t[0],t[1],t[2]],Array.isArray(e)){const[i,n,r]=e,c=L(Math.hypot(i,n,r),z,X),l=L(Math.asin(L(n/Math.max(c,1e-6),-.995,.995)),ct,ut),u=Math.atan2(r,i);this.goal.distanceKpc=c,this.goal.pitch=l,this.goal.yaw=this.current.yaw+ht(u-this.current.yaw);return}typeof e=="number"&&Number.isFinite(e)&&(this.goal.distanceKpc=L(e,z,X)),typeof a=="number"&&Number.isFinite(a)&&(this.goal.yaw=this.current.yaw+ht(a-this.current.yaw)),typeof s=="number"&&Number.isFinite(s)&&(this.goal.pitch=L(s,ct,ut))}followPoint(t){if(this.followedThisFrame=!0,this.lastFollowPoint){const e=t[0]-this.lastFollowPoint[0],a=t[1]-this.lastFollowPoint[1],s=t[2]-this.lastFollowPoint[2];this.current.target[0]+=e,this.current.target[1]+=a,this.current.target[2]+=s,this.goal.target[0]+=e,this.goal.target[1]+=a,this.goal.target[2]+=s}else this.goal.target=[t[0],t[1],t[2]];this.lastFollowPoint=[t[0],t[1],t[2]]}update(t,e=!1){const a=L(t,1e-4,.1);this.followedThisFrame||(this.lastFollowPoint=null),this.followedThisFrame=!1,e&&!this.isUserInteracting&&(this.goal.yaw+=a*.085);const s=1-Math.exp(-8.5*a),i=1-Math.exp(-10.5*a),n=1-Math.exp(-11*a);this.current.target[0]+=(this.goal.target[0]-this.current.target[0])*s,this.current.target[1]+=(this.goal.target[1]-this.current.target[1])*s,this.current.target[2]+=(this.goal.target[2]-this.current.target[2])*s,this.current.yaw+=(this.goal.yaw-this.current.yaw)*i,this.current.pitch+=(this.goal.pitch-this.current.pitch)*i;const r=Math.log(Math.max(this.current.distanceKpc,z)),c=Math.log(Math.max(this.goal.distanceKpc,z));this.current.distanceKpc=L(Math.exp(r+(c-r)*n),z,X),this.current.fovDeg+=(this.goal.fovDeg-this.current.fovDeg)*i,this.recomputeMatrices()}getState(){return{target:[this.current.target[0],this.current.target[1],this.current.target[2]],yaw:this.current.yaw,pitch:this.current.pitch,distanceKpc:this.current.distanceKpc,fovDeg:this.current.fovDeg}}getEyePosition(){return[this.eyePos[0],this.eyePos[1],this.eyePos[2]]}getViewMatrix(){return this.viewMatrix}getProjMatrix(){return this.projMatrix}getViewProjMatrix(){return this.viewProjMatrix}getInvViewProjMatrix(){return this.invViewProjMatrix}getRightVector(){return[this.rightVec[0],this.rightVec[1],this.rightVec[2]]}getUpVector(){return[this.upVec[0],this.upVec[1],this.upVec[2]]}getNearFar(){return[this.nearKpc,this.farKpc]}getFocalLengthPx(){const t=this.current.fovDeg*Math.PI/180;return this.viewportHeightPx*.5/Math.tan(t*.5)}attachControls(t){this.detachControls();const e=r=>{var c;r.button!==0&&r.button!==1&&r.button!==2||((c=t.setPointerCapture)==null||c.call(t,r.pointerId),this.activePointers.set(r.pointerId,{x:r.clientX,y:r.clientY,button:r.button,shift:r.shiftKey}),this.isUserInteracting=!0,this.resetPinchTracking())},a=r=>{const c=this.activePointers.get(r.pointerId);if(!c)return;if(this.activePointers.size>=2){this.activePointers.set(r.pointerId,{...c,x:r.clientX,y:r.clientY}),this.handleMultiTouchGesture(t);return}const l=r.clientX-c.x,u=r.clientY-c.y;c.x=r.clientX,c.y=r.clientY,c.shift=r.shiftKey,c.button===2||c.button===1||r.shiftKey?this.panByPixels(l,u,t.clientHeight||this.viewportHeightPx):(this.goal.yaw+=l*.0055,this.goal.pitch=L(this.goal.pitch+u*.0055,ct,ut))},s=r=>{var c;if(this.activePointers.delete(r.pointerId),(c=t.hasPointerCapture)!=null&&c.call(t,r.pointerId))try{t.releasePointerCapture(r.pointerId)}catch{}this.resetPinchTracking(),this.activePointers.size===0&&(this.isUserInteracting=!1)},i=r=>{r.preventDefault();let c=r.deltaY;r.deltaMode===1?c*=18:r.deltaMode===2&&(c*=300),c=L(c,-260,260);const l=Math.exp(c*.00125);this.goal.distanceKpc=L(this.goal.distanceKpc*l,z,X)},n=r=>{r.preventDefault()};return t.addEventListener("pointerdown",e),t.addEventListener("pointermove",a),t.addEventListener("pointerup",s),t.addEventListener("pointercancel",s),t.addEventListener("wheel",i,{passive:!1}),t.addEventListener("contextmenu",n),this.detachFn=()=>{t.removeEventListener("pointerdown",e),t.removeEventListener("pointermove",a),t.removeEventListener("pointerup",s),t.removeEventListener("pointercancel",s),t.removeEventListener("wheel",i),t.removeEventListener("contextmenu",n),this.activePointers.clear(),this.isUserInteracting=!1},()=>this.detachControls()}detachControls(){this.detachFn&&(this.detachFn(),this.detachFn=null)}dispose(){this.detachControls()}resetPinchTracking(){if(this.activePointers.size<2){this.lastPinchDist=0,this.lastPinchCenter=null;return}const t=Array.from(this.activePointers.values()),e=t[0],a=t[1];this.lastPinchDist=Math.hypot(a.x-e.x,a.y-e.y),this.lastPinchCenter={x:(e.x+a.x)*.5,y:(e.y+a.y)*.5}}handleMultiTouchGesture(t){const e=Array.from(this.activePointers.values());if(e.length<2)return;const a=e[0],s=e[1],i=Math.hypot(s.x-a.x,s.y-a.y),n={x:(a.x+s.x)*.5,y:(a.y+s.y)*.5};if(this.lastPinchDist>1&&i>1){const r=this.lastPinchDist/i;this.goal.distanceKpc=L(this.goal.distanceKpc*r,z,X)}this.lastPinchCenter&&this.panByPixels(n.x-this.lastPinchCenter.x,n.y-this.lastPinchCenter.y,t.clientHeight||this.viewportHeightPx),this.lastPinchDist=i,this.lastPinchCenter=n}panByPixels(t,e,a){const s=this.current.fovDeg*Math.PI/180,n=2*this.goal.distanceKpc*Math.tan(s*.5)/Math.max(1,a),r=-t*n,c=e*n;this.goal.target[0]+=this.rightVec[0]*r+this.upVec[0]*c,this.goal.target[1]+=this.rightVec[1]*r+this.upVec[1]*c,this.goal.target[2]+=this.rightVec[2]*r+this.upVec[2]*c,this.goal.target[0]=L(this.goal.target[0],-45,45),this.goal.target[1]=L(this.goal.target[1],-30,30),this.goal.target[2]=L(this.goal.target[2],-45,45)}recomputeMatrices(){const{target:t,yaw:e,pitch:a,distanceKpc:s,fovDeg:i}=this.current,n=Math.cos(a);this.eyePos=[t[0]+s*n*Math.cos(e),t[1]+s*Math.sin(a),t[2]+s*n*Math.sin(e)],this.nearKpc=L(s*.002,5e-5,.5),this.farKpc=Math.max(250,s*8),he(this.eyePos,t,[0,1,0],this.viewMatrix),this.rightVec=[this.viewMatrix[0],this.viewMatrix[4],this.viewMatrix[8]],this.upVec=[this.viewMatrix[1],this.viewMatrix[5],this.viewMatrix[9]];const r=i*Math.PI/180;ue(r,this.aspect,this.nearKpc,this.farKpc,this.projMatrix),de(this.projMatrix,this.viewMatrix,this.viewProjMatrix),me(this.viewProjMatrix,this.invViewProjMatrix)}}function ve(o){const t=o.getExtension("EXT_color_buffer_float"),e=o.getExtension("EXT_color_buffer_half_float");if(!t&&!e)return!1;const a=o.createTexture(),s=o.createFramebuffer();if(!a||!s)return a&&o.deleteTexture(a),s&&o.deleteFramebuffer(s),!1;o.bindTexture(o.TEXTURE_2D,a),o.texImage2D(o.TEXTURE_2D,0,o.RGBA16F,4,4,0,o.RGBA,o.HALF_FLOAT,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.bindFramebuffer(o.FRAMEBUFFER,s),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,a,0);const i=o.checkFramebufferStatus(o.FRAMEBUFFER);return o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindTexture(o.TEXTURE_2D,null),o.deleteFramebuffer(s),o.deleteTexture(a),i===o.FRAMEBUFFER_COMPLETE}function be(o){const t=o.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)throw new Error("WebGL2 is unavailable on this browser or graphics driver. Please enable hardware acceleration or use a WebGL2-capable browser.");t.getExtension("OES_texture_float_linear");const e=ve(t),a=e?t.RGBA16F:t.RGBA8,s=e?t.HALF_FLOAT:t.UNSIGNED_BYTE,i=t.getParameter(t.ALIASED_POINT_SIZE_RANGE),n=i&&i.length>=2?Math.max(1,Number(i[1])):64;return{gl:t,isFloatHdr:e,hdrInternalFormat:a,hdrType:s,maxPointSize:n,backendName:e?"WebGL2 · RGBA16F HDR":"WebGL2 · RGBA8 SDR"}}function Ct(o,t,e,a="shader"){const s=o.createShader(t);if(!s)throw new Error(`Failed to allocate WebGLShader for ${a}`);if(o.shaderSource(s,e),o.compileShader(s),!o.getShaderParameter(s,o.COMPILE_STATUS)){const i=o.getShaderInfoLog(s)??"Unknown compile error";throw o.deleteShader(s),new Error(`WebGL2 shader compile error (${a}): ${i}`)}return s}function _(o,t,e,a="program"){const s=Ct(o,o.VERTEX_SHADER,t,`${a}:vert`),i=Ct(o,o.FRAGMENT_SHADER,e,`${a}:frag`),n=o.createProgram();if(!n)throw o.deleteShader(s),o.deleteShader(i),new Error(`Failed to allocate WebGLProgram for ${a}`);if(o.attachShader(n,s),o.attachShader(n,i),o.linkProgram(n),o.deleteShader(s),o.deleteShader(i),!o.getProgramParameter(n,o.LINK_STATUS)){const r=o.getProgramInfoLog(n)??"Unknown link error";throw o.deleteProgram(n),new Error(`WebGL2 program link error (${a}): ${r}`)}return n}function dt(o,t,e,a,s,i=o.LINEAR){const n=Math.max(1,Math.floor(t)),r=Math.max(1,Math.floor(e)),c=o.createTexture(),l=o.createFramebuffer();if(!c||!l)throw c&&o.deleteTexture(c),l&&o.deleteFramebuffer(l),new Error("Failed to create WebGL2 framebuffer render target");o.bindTexture(o.TEXTURE_2D,c),o.texImage2D(o.TEXTURE_2D,0,a,n,r,0,o.RGBA,s,null),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,i),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,i),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.bindFramebuffer(o.FRAMEBUFFER,l),o.framebufferTexture2D(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,c,0);const u=o.checkFramebufferStatus(o.FRAMEBUFFER);if(o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindTexture(o.TEXTURE_2D,null),u!==o.FRAMEBUFFER_COMPLETE)throw o.deleteFramebuffer(l),o.deleteTexture(c),new Error(`Render target framebuffer incomplete (status=0x${u.toString(16)})`);return{framebuffer:l,texture:c,width:n,height:r,internalFormat:a,type:s,filter:i}}function Tt(o,t,e,a){const s=Math.max(1,Math.floor(e)),i=Math.max(1,Math.floor(a));t.width===s&&t.height===i||(o.bindTexture(o.TEXTURE_2D,t.texture),o.texImage2D(o.TEXTURE_2D,0,t.internalFormat,s,i,0,o.RGBA,t.type,null),o.bindTexture(o.TEXTURE_2D,null),t.width=s,t.height=i)}function kt(o,t){o.deleteFramebuffer(t.framebuffer),o.deleteTexture(t.texture)}const tt=`#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  // Single fullscreen triangle covering clip space [-1, 1] with zero VBO attributes
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  vUv = vec2(x, y) * 0.5 + 0.5;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`,ye=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * valueNoise(p);
    p = rot * p * 2.04 + vec2(17.1, 31.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  // World galactic plane coordinates in [-20, +20] kpc
  vec2 xz = (vUv - 0.5) * 40.0;
  float r = length(xz);
  float theta = atan(xz.y, xz.x);

  // Domain-warped spiral coordinates for feathery filamentary dust lanes
  float warpA = fbm(xz * 0.38 + vec2(4.2, -2.7)) - 0.5;
  float warpB = fbm(xz * 0.92 + vec2(-9.1, 6.4)) - 0.5;
  float filament = fbm(xz * 1.85 + vec2(warpA * 2.6, warpB * 2.6));
  float fineRift = fbm(xz * 4.1 - vec2(warpB * 1.8, warpA * 1.8));

  // Logarithmic 4-arm SBbc spiral model (pitch angle ~12.5 deg => k = 4.51)
  float pitchK = 4.51;
  float rLog = log(max(r, 1.15) / 3.1);
  float spiralAngle = theta + pitchK * rLog + warpA * 0.34;

  // 4 major arms: Scutum-Centaurus, Perseus, Sagittarius-Carina, Norma-Outer
  float armWave = 0.0;
  float h2Wave = 0.0;
  float armOffsets[4] = float[4](0.0, 1.570796, 3.141593, 4.712389);
  float armWeights[4] = float[4](1.05, 1.0, 0.88, 0.82);

  for (int i = 0; i < 4; i++) {
    // Dust shock lane sits slightly on the inner/concave edge (-0.18 rad) of the bright arm
    float dArm = atan(sin(spiralAngle - armOffsets[i]), cos(spiralAngle - armOffsets[i]));
    float dDust = atan(sin(spiralAngle - armOffsets[i] + 0.16), cos(spiralAngle - armOffsets[i] + 0.16));
    float armCore = exp(-(dArm * dArm) / (2.0 * 0.24 * 0.24));
    float dustLane = exp(-(dDust * dDust) / (2.0 * 0.16 * 0.16));
    armWave += armWeights[i] * dustLane;
    h2Wave += armWeights[i] * armCore;
  }

  // Orion-Cygnus local spur matching astro model: theta = PI - 3.6 * ln(r / 8.178)
  float orionTheta = PI - 3.6 * log(max(r, 1.0) / 8.178);
  float dOrion = atan(sin(theta - orionTheta + 0.03), cos(theta - orionTheta + 0.03));
  float orionArcDist = abs(dOrion) * r;
  float orionSpur = exp(-(orionArcDist * orionArcDist) / (2.0 * 0.38 * 0.38))
    * smoothstep(6.2, 7.0, r) * (1.0 - smoothstep(9.6, 10.6, r));
  float orionDust = orionSpur * (0.55 + 0.95 * filament);

  // Molecular ring (3.2 - 5.4 kpc) + inner bar dust lanes (bar tilted ~27 deg from Sun-GC axis)
  float molRing = exp(-pow((r - 4.1) / 1.35, 2.0));
  float barCos = cos(0.4712); // 27 deg
  float barSin = sin(0.4712);
  vec2 barLocal = vec2(xz.x * barCos + xz.y * barSin, -xz.x * barSin + xz.y * barCos);
  float barDust = exp(-pow(abs(barLocal.y) / 0.38, 2.0)) * (1.0 - smoothstep(0.6, 3.4, abs(barLocal.x))) * smoothstep(0.35, 0.9, r);

  // Radial disk dust profile: starts outside nuclear cavity, peaks 3-9 kpc, tapers by 16.5 kpc
  float innerClear = smoothstep(0.30, 1.4, r);
  float outerTaper = 1.0 - smoothstep(11.5, 17.5, r);
  float radialEnv = innerClear * outerTaper;

  // Combine into realistic filamentary Great Rift optical density
  float clump = smoothstep(0.22, 0.88, filament * 0.68 + fineRift * 0.36);
  float dustDensity = radialEnv * (
    0.16 +
    0.68 * armWave * (0.35 + 0.95 * clump) +
    0.34 * molRing * (0.45 + 0.75 * clump) +
    0.55 * orionDust +
    0.45 * barDust * (0.5 + 0.7 * fineRift)
  );
  // Subtle dense nuclear circumnuclear ring at 0.2 - 0.55 kpc
  dustDensity += 0.38 * exp(-pow((r - 0.36) / 0.18, 2.0)) * (0.6 + 0.6 * fineRift);

  float h2Density = radialEnv * (h2Wave * (0.4 + 0.8 * clump) + 0.5 * orionSpur);
  float molecularDensity = radialEnv * (molRing * 0.75 + armWave * 0.45) * (0.4 + 0.6 * fineRift);

  fragColor = vec4(
    clamp(dustDensity, 0.0, 2.2),
    clamp(h2Density, 0.0, 2.0),
    clamp(molecularDensity, 0.0, 2.0),
    1.0
  );
}
`,xe=`#version 300 es
precision highp float;

out vec2 vNdc;

void main() {
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  vNdc = vec2(x, y);
  gl_Position = vec4(x, y, 0.9999, 1.0);
}
`,Me=`#version 300 es
precision highp float;

in vec2 vNdc;
out vec4 fragColor;

uniform mat4 uInvViewProj;
uniform int uWavelength;

float hash31(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p, p.yxz + 19.19);
  return fract((p.x + p.y) * p.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yxz + 19.19);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float backgroundStars(vec3 dir, float scale, float densityThreshold) {
  vec3 grid = dir * scale;
  vec3 id = floor(grid);
  vec3 f = fract(grid) - 0.5;
  vec3 rnd = hash33(id);
  float prob = hash31(id + 7.13);
  if (prob < densityThreshold) return 0.0;
  vec3 offset = (rnd - 0.5) * 0.55;
  float d = length(f - offset);
  float brightness = smoothstep(0.14, 0.0, d) * pow((prob - densityThreshold) / (1.0 - densityThreshold), 2.2);
  return brightness;
}

void main() {
  vec4 farWorld = uInvViewProj * vec4(vNdc, 1.0, 1.0);
  vec4 nearWorld = uInvViewProj * vec4(vNdc, -1.0, 1.0);
  vec3 dir = normalize(farWorld.xyz / farWorld.w - nearWorld.xyz / nearWorld.w);

  // Subtle deep cosmic sky background (purely sub-threshold HDR so Milky Way pops against obsidian cosmos)
  float galLat = abs(dir.y);
  vec3 cosmicBase = mix(vec3(0.0022, 0.0026, 0.0044), vec3(0.0010, 0.0013, 0.0024), galLat);
  if (uWavelength == 1) {
    cosmicBase = vec3(0.0020, 0.0014, 0.0010);
  } else if (uWavelength == 2) {
    cosmicBase = vec3(0.0012, 0.0016, 0.0038);
  }

  // Ultra-faint distant extragalactic field stars locked to infinity
  float s1 = backgroundStars(dir, 175.0, 0.962);
  float s2 = backgroundStars(dir, 320.0, 0.972) * 0.45;
  vec3 starTint = mix(vec3(0.95, 0.88, 0.78), vec3(0.75, 0.85, 1.0), hash31(floor(dir * 175.0)));

  // Faint Local Group companion hints (Andromeda M31 + LMC/SMC soft distant glows)
  vec3 m31Dir = normalize(vec3(0.58, 0.34, -0.74));
  float m31Dot = max(dot(dir, m31Dir), 0.0);
  float m31Glow = pow(m31Dot, 900.0) * 0.08 + pow(m31Dot, 220.0) * 0.015;

  vec3 lmcDir = normalize(vec3(-0.32, -0.51, 0.80));
  float lmcDot = max(dot(dir, lmcDir), 0.0);
  float lmcGlow = pow(lmcDot, 360.0) * 0.025;

  vec3 color = cosmicBase + starTint * (s1 + s2) * 0.35 + vec3(0.92, 0.84, 0.72) * m31Glow + vec3(0.68, 0.78, 0.96) * lmcGlow;
  fragColor = vec4(color, 1.0);
}
`,we=`#version 300 es
precision highp float;

// Instanced attributes per nebula cloud (divisor = 1)
layout(location = 0) in vec4 aPosOmega;     // x0, y0, z0, omega
layout(location = 1) in vec4 aNebulaProps;  // kind, radiusKpc, density, seed

uniform mat4 uViewProj;
uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform float uTimeMyr;
uniform float uCameraDist;
uniform float uDustOpacity;
uniform float uNebulaIntensity;
uniform int uWavelength;
uniform sampler2D uDustMap;

out vec2 vQuadUv;
out vec3 vColor;
out float vAlpha;
out float vSeed;
out float vKind;

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
}

vec3 sampleDustOpticalDepth(vec3 worldPos) {
  if (uDustOpacity <= 0.0001) return vec3(0.0);
  const float H = 0.34;
  vec3 delta = worldPos - uCameraPos;
  float totalDist = length(delta);
  if (totalDist < 0.001) return vec3(0.0);

  float tMin = 0.0;
  float tMax = 1.0;
  if (abs(delta.y) < 1e-5) {
    if (abs(uCameraPos.y) >= H) return vec3(0.0);
  } else {
    float tA = (-H - uCameraPos.y) / delta.y;
    float tB = ( H - uCameraPos.y) / delta.y;
    tMin = max(0.0, min(tA, tB));
    tMax = min(1.0, max(tA, tB));
    if (tMax <= tMin) return vec3(0.0);
  }

  float segLen = totalDist * (tMax - tMin);
  float dt = (tMax - tMin) / 4.0;
  float stepKpc = segLen / 4.0;
  float lod = clamp(log2(max(stepKpc / 0.045, 1.0)), 0.0, 5.0);

  float rotAngle = -uTimeMyr * 0.025;
  float c = cos(rotAngle);
  float s = sin(rotAngle);

  vec3 accum = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float t = tMin + (float(i) + 0.5) * dt;
    vec3 p = uCameraPos + delta * t;
    float verticalWeight = exp(-(p.y * p.y) / (2.0 * 0.115 * 0.115));
    vec2 xzRot = vec2(p.x * c - p.z * s, p.x * s + p.z * c);
    vec2 uv = xzRot / 40.0 + 0.5;
    if (uv.x > 0.01 && uv.x < 0.99 && uv.y > 0.01 && uv.y < 0.99) {
      accum += textureLod(uDustMap, uv, lod).rgb * verticalWeight;
    }
  }
  return accum * (stepKpc * 2.15 * uDustOpacity);
}

void main() {
  // 6 vertices forming a quad: (-1,-1), (1,-1), (1,1), (-1,-1), (1,1), (-1,1)
  vec2 corners[6] = vec2[6](
    vec2(-1.0, -1.0),
    vec2( 1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0,  1.0)
  );
  vec2 corner = corners[gl_VertexID];
  vQuadUv = corner;

  vec3 worldCenter = rotateY(aPosOmega.xyz, aPosOmega.w * uTimeMyr);
  float kind = aNebulaProps.x;
  float radiusKpc = aNebulaProps.y;
  float density = aNebulaProps.z;
  float seed = aNebulaProps.w;
  vSeed = seed;
  vKind = kind;

  float camDist = length(worldCenter - uCameraPos);
  // Fade each billboard relative to its own radiusKpc so close-up cameras never get engulfed by quads
  float closeFade = smoothstep(radiusKpc * 0.75, radiusKpc * 2.5, camDist);
  if (closeFade <= 0.001 || uNebulaIntensity <= 0.001) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    vAlpha = 0.0;
    vColor = vec3(0.0);
    return;
  }

  vec3 worldPos = worldCenter + (uCameraRight * corner.x + uCameraUp * corner.y) * radiusKpc;
  gl_Position = uViewProj * vec4(worldPos, 1.0);

  // Evaluate line-of-sight dust optical depth & extinction
  vec3 dustSample = sampleDustOpticalDepth(worldCenter);
  float tau = dustSample.r;

  vec3 baseColor;
  vec3 extinction;
  float intensityScale = density * uNebulaIntensity * closeFade;

  if (kind < 0.5) {
    // 0: H-II emission nursery (H-alpha #ff3060 + OIII hints)
    baseColor = mix(vec3(1.0, 0.19, 0.38), vec3(0.95, 0.30, 0.55), fract(seed * 3.17));
    intensityScale *= 0.036;
  } else if (kind < 1.5) {
    // 1: Reflection nebula near hot OB clusters (#50a8ff)
    baseColor = mix(vec3(0.28, 0.65, 1.0), vec3(0.45, 0.78, 1.0), fract(seed * 5.71));
    intensityScale *= 0.030;
  } else {
    // 2: Warm unresolved bulge/disk stellar-dust scattering haze (fades away when zoomed inside galaxy)
    float rGal = length(worldCenter.xz);
    vec3 bulgeHue = vec3(1.0, 0.68, 0.34);
    vec3 diskHue = vec3(0.75, 0.72, 0.80);
    baseColor = mix(bulgeHue, diskHue, smoothstep(1.5, 8.0, rGal));
    float hazeZoomFade = smoothstep(0.9, 5.2, uCameraDist);
    intensityScale *= 0.0095 * hazeZoomFade;
  }

  if (uWavelength == 0) {
    // Optical
    extinction = exp(-tau * vec3(1.15, 1.55, 2.25));
  } else if (uWavelength == 1) {
    // Infrared (JWST): dust-penetrating warm amber-gold glow, PAH filaments glow in mid-IR
    extinction = exp(-tau * 0.14 * vec3(0.45, 0.70, 1.0));
    baseColor = mix(vec3(1.0, 0.58, 0.22), vec3(1.0, 0.76, 0.44), kind * 0.45);
    intensityScale *= (kind > 1.5 ? 1.25 : 0.85);
  } else if (uWavelength == 2) {
    // Ultraviolet (GALEX): strong UV dust absorption, highlights young OB reflection nebulae
    extinction = exp(-tau * 1.90 * vec3(1.2, 1.4, 1.8));
    if (kind < 0.5) {
      baseColor = vec3(0.68, 0.52, 1.0);
      intensityScale *= 0.85;
    } else if (kind < 1.5) {
      baseColor = vec3(0.48, 0.74, 1.15);
      intensityScale *= 1.35;
    } else {
      baseColor = vec3(0.40, 0.50, 0.85);
      intensityScale *= 0.35;
    }
  } else {
    // Population diagnostic mode: suppress nebula fog so star populations read crisply
    extinction = exp(-tau * 0.35 * vec3(1.0));
    intensityScale *= 0.22;
  }

  vColor = baseColor * extinction;
  vAlpha = intensityScale;
}
`,Ee=`#version 300 es
precision highp float;

in vec2 vQuadUv;
in vec3 vColor;
in float vAlpha;
in float vSeed;
in float vKind;

out vec4 fragColor;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm3(vec2 p) {
  float s = 0.0;
  float a = 0.55;
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    s += a * noise(p);
    p = m * p * 2.05;
    a *= 0.5;
  }
  return s;
}

void main() {
  if (vAlpha <= 0.0001) discard;
  float r2 = dot(vQuadUv, vQuadUv);
  if (r2 >= 1.0) discard;

  // Rotate UV per cloud seed so every sprite has unique organic orientation
  float ang = vSeed * 6.2831853;
  float c = cos(ang);
  float s = sin(ang);
  vec2 ruv = vec2(vQuadUv.x * c - vQuadUv.y * s, vQuadUv.x * s + vQuadUv.y * c);

  // Soft Gaussian falloff + FBM wisp modulation for emission & reflection clouds
  float gaussian = exp(-r2 * 4.2) * (1.0 - smoothstep(0.65, 1.0, sqrt(r2)));
  float wisp = vKind < 1.5
    ? mix(0.45, 1.35, fbm3(ruv * 2.4 + vec2(vSeed * 13.7, vSeed * 7.3)))
    : mix(0.75, 1.15, fbm3(ruv * 1.5 + vec2(vSeed * 5.1, vSeed * 11.3)));

  float density = gaussian * wisp * vAlpha;
  fragColor = vec4(vColor * density, 1.0);
}
`,Pe=`#version 300 es
precision highp float;

layout(location = 0) in vec4 aPosOmega;  // x0, y0, z0, omega (kpc, rad/Myr)
layout(location = 1) in vec4 aStarProps; // tempK, luminosity, size, population

uniform mat4 uViewProj;
uniform vec3 uCameraPos;
uniform float uTimeMyr;
uniform float uDpr;
uniform float uFocalLengthPx;
uniform float uCameraDist;
uniform float uMaxPointSize;
uniform float uDustOpacity;
uniform float uStarNorm;
uniform int uWavelength;
uniform sampler2D uDustMap;

out vec3 vColor;
out float vLuminance;
out float vPointSize;

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
}

vec3 blackbodyLinear(float tempK) {
  float t = clamp(tempK, 1900.0, 42000.0) / 100.0;
  float r, g, b;
  if (t <= 66.0) {
    r = 1.0;
    g = clamp(0.390081578769 * log(max(t, 1.0)) - 0.631841443788, 0.0, 1.0);
  } else {
    float x = t - 60.0;
    r = clamp(1.29293618606 * pow(max(x, 0.1), -0.1332047592), 0.0, 1.0);
    g = clamp(1.12989086090 * pow(max(x, 0.1), -0.0755148492), 0.0, 1.0);
  }
  if (t >= 66.0) {
    b = 1.0;
  } else if (t <= 19.0) {
    b = 0.0;
  } else {
    b = clamp(0.54320678911 * log(max(t - 10.0, 1.0)) - 1.19625408914, 0.0, 1.0);
  }
  vec3 lin = pow(max(vec3(r, g, b), vec3(0.001)), vec3(2.2));
  float lum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
  return lin / max(lum, 0.15) * 0.72;
}

vec3 sampleDustOpticalDepth(vec3 worldPos) {
  if (uDustOpacity <= 0.0001) return vec3(0.0);
  const float H = 0.34;
  vec3 delta = worldPos - uCameraPos;
  float totalDist = length(delta);
  if (totalDist < 0.001) return vec3(0.0);

  float tMin = 0.0;
  float tMax = 1.0;
  if (abs(delta.y) < 1e-5) {
    if (abs(uCameraPos.y) >= H) return vec3(0.0);
  } else {
    float tA = (-H - uCameraPos.y) / delta.y;
    float tB = ( H - uCameraPos.y) / delta.y;
    tMin = max(0.0, min(tA, tB));
    tMax = min(1.0, max(tA, tB));
    if (tMax <= tMin) return vec3(0.0);
  }

  float segLen = totalDist * (tMax - tMin);
  float dt = (tMax - tMin) / 4.0;
  float stepKpc = segLen / 4.0;
  float lod = clamp(log2(max(stepKpc / 0.045, 1.0)), 0.0, 5.0);

  float rotAngle = -uTimeMyr * 0.025;
  float c = cos(rotAngle);
  float s = sin(rotAngle);

  vec3 accum = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float t = tMin + (float(i) + 0.5) * dt;
    vec3 p = uCameraPos + delta * t;
    float verticalWeight = exp(-(p.y * p.y) / (2.0 * 0.115 * 0.115));
    vec2 xzRot = vec2(p.x * c - p.z * s, p.x * s + p.z * c);
    vec2 uv = xzRot / 40.0 + 0.5;
    if (uv.x > 0.01 && uv.x < 0.99 && uv.y > 0.01 && uv.y < 0.99) {
      accum += textureLod(uDustMap, uv, lod).rgb * verticalWeight;
    }
  }
  return accum * (stepKpc * 2.15 * uDustOpacity);
}

void main() {
  vec3 worldPos = rotateY(aPosOmega.xyz, aPosOmega.w * uTimeMyr);
  vec4 clipPos = uViewProj * vec4(worldPos, 1.0);
  gl_Position = clipPos;

  // Early cull vertices clearly outside clip frustum
  float wAbs = abs(clipPos.w) * 1.18 + 0.05;
  if (clipPos.w <= 0.0 || abs(clipPos.x) > wAbs || abs(clipPos.y) > wAbs) {
    gl_PointSize = 0.0;
    vColor = vec3(0.0);
    vLuminance = 0.0;
    vPointSize = 0.0;
    return;
  }

  float tempK = aStarProps.x;
  float luminosity = aStarProps.y;
  float starSize = aStarProps.z;
  int popId = int(aStarProps.w + 0.5);

  float dist = max(length(worldPos - uCameraPos), 0.00035);
  float refDist = max(uCameraDist, 0.04);

  // Smooth multi-scale apparent brightness curve spanning 0.0005 kpc to 120 kpc
  float distAtten = pow(refDist / max(dist, refDist * 0.06), 0.52);
  distAtten = clamp(distAtten, 0.18, 4.5);

  // Perspective-aware point size scaled cleanly by DPR and clamped to [1.0, 44.0] * DPR
  float perspFactor = pow(max(uFocalLengthPx / max(dist, 0.002), 1.0), 0.50);
  float sizePx = clamp(0.90 + starSize * 0.020 * perspFactor, 1.0, 44.0);
  float dprPointSize = clamp(sizePx * uDpr, 1.0, uMaxPointSize);
  gl_PointSize = dprPointSize;
  vPointSize = sizePx;

  // Real-time 4-tap midplane dust optical depth
  vec3 dustSample = sampleDustOpticalDepth(worldPos);
  float tau = dustSample.r;

  vec3 starRgb;
  vec3 extinction;
  float modeGain = 1.0;

  if (uWavelength == 0) {
    // Optical (V-band / RGB) with physical interstellar reddening
    starRgb = blackbodyLinear(tempK);
    extinction = exp(-tau * vec3(1.15, 1.55, 2.25));
  } else if (uWavelength == 1) {
    // Near-Infrared (JWST / 2MASS): penetrates dust lanes, reveals inner bar & cool K/M giants
    extinction = exp(-tau * 0.14 * vec3(0.45, 0.70, 1.0));
    float coolBias = mix(1.35, 0.55, smoothstep(3500.0, 18000.0, tempK));
    starRgb = mix(vec3(1.0, 0.62, 0.25), vec3(1.0, 0.88, 0.68), smoothstep(2800.0, 7500.0, tempK));
    modeGain = coolBias * 1.15;
  } else if (uWavelength == 2) {
    // Ultraviolet (GALEX): strong dust absorption, boosts hot OB stars (> 9000K) & dims cool giants
    extinction = exp(-tau * 1.90 * vec3(1.20, 1.40, 1.80));
    float uvBoost = mix(0.14, 2.75, smoothstep(5800.0, 18000.0, tempK));
    starRgb = mix(vec3(0.55, 0.42, 0.92), vec3(0.52, 0.78, 1.25), smoothstep(9000.0, 30000.0, tempK));
    modeGain = uvBoost;
  } else {
    // Population diagnostic map
    extinction = exp(-tau * 0.35 * vec3(1.0));
    if (popId == 0) {
      starRgb = vec3(1.0, 0.68, 0.18); // Amber-gold Bulge/Bar
    } else if (popId == 1) {
      starRgb = vec3(0.20, 0.78, 1.0); // Cyan-blue Spiral OB
    } else if (popId == 2) {
      starRgb = vec3(0.88, 0.91, 0.97); // Silver-white Thin Disk
    } else if (popId == 3) {
      starRgb = vec3(0.68, 0.38, 0.98); // Violet Thick Disk
    } else {
      starRgb = vec3(0.20, 0.90, 0.55); // Emerald Halo/Globulars
    }
    modeGain = 1.05;
  }

  // Conserve integrated energy across sprite area (sizePx^1.78) and prevent core whiteout
  float areaNorm = 1.0 / pow(max(sizePx, 1.0), 1.78);
  float closeCrowdAtten = mix(0.24, 1.0, smoothstep(0.015, 0.45, uCameraDist));
  float finalLum = luminosity * distAtten * uStarNorm * modeGain * areaNorm * closeCrowdAtten * 0.36;

  vColor = starRgb * extinction * finalLum;
  vLuminance = luminosity * distAtten * modeGain;
}
`,Se=`#version 300 es
precision highp float;

in vec3 vColor;
in float vLuminance;
in float vPointSize;

out vec4 fragColor;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;

  // Sub-pixel / pinpoint crispness for distant stars transitioning to Airy PSF for larger stars
  float crispDot = exp(-r2 * 3.1);
  float airyCore = exp(-r2 * 8.0) + 0.24 * exp(-r2 * 2.6);
  float psf = mix(crispDot, airyCore, smoothstep(1.6, 4.5, vPointSize));

  // Subtle 4-point telescope diffraction spikes ONLY on bright nearby/large point sprites
  if (vPointSize > 6.5 && vLuminance > 1.5) {
    float spikeH = exp(-abs(uv.y) * 15.0) * exp(-abs(uv.x) * 3.2);
    float spikeV = exp(-abs(uv.x) * 15.0) * exp(-abs(uv.y) * 3.2);
    float spikeWeight = smoothstep(6.5, 13.0, vPointSize) * smoothstep(1.5, 3.8, vLuminance) * 0.42;
    psf += (spikeH + spikeV) * spikeWeight;
  }

  float edgeFade = 1.0 - smoothstep(0.76, 1.0, sqrt(r2));
  fragColor = vec4(vColor * psf * edgeFade, 1.0);
}
`,Ce=`#version 300 es
precision highp float;

uniform mat4 uViewProj;
uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;

out vec2 vUv;
out float vCamDist;

void main() {
  vec2 corners[6] = vec2[6](
    vec2(-1.0, -1.0),
    vec2( 1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0, -1.0),
    vec2( 1.0,  1.0),
    vec2(-1.0,  1.0)
  );
  vec2 c = corners[gl_VertexID];
  vUv = c;

  float camDist = length(uCameraPos);
  vCamDist = camDist;

  // Physical/observatory scale billboard centered at Sgr A* [0, 0, 0]
  // Clearly resolves below 0.25 kpc while smoothly becoming nuclear core point glow from afar
  float worldRadius = clamp(camDist * 0.22, 0.0022, 0.042);
  vec3 worldPos = (uCameraRight * c.x + uCameraUp * c.y) * worldRadius;
  gl_Position = uViewProj * vec4(worldPos, 1.0);
}
`,Te=`#version 300 es
precision highp float;

in vec2 vUv;
in float vCamDist;

out vec4 fragColor;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform float uRealTimeSec;
uniform int uWavelength;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.12);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float swirlFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p *= 2.08;
    a *= 0.5;
  }
  return v;
}

void main() {
  float r = length(vUv);
  if (r > 1.0) discard;

  // Fade out event horizon detail smoothly above 0.25 kpc, leaving warm nuclear cluster glow
  float closeMix = 1.0 - smoothstep(0.04, 0.28, vCamDist);

  // Project view orientation onto a tilted accretion disk normal (galactic inclination)
  vec3 viewDir = normalize(-uCameraPos);
  vec3 diskNormal = normalize(vec3(0.18, 0.92, 0.34));
  float cosTilt = abs(dot(viewDir, diskNormal));
  float squashY = mix(0.28, 0.92, cosTilt);

  // Event Horizon Shadow radius + gravitationally lensed photon ring
  float shadowRadius = 0.19;
  float shadowMask = (1.0 - smoothstep(shadowRadius * 0.88, shadowRadius * 1.08, r)) * closeMix;

  // Einstein photon ring surrounding the black hole shadow (brightest at r ~ 0.225)
  float ringDist = abs(r - 0.225);
  float photonRing = exp(-(ringDist * ringDist) / (2.0 * 0.016 * 0.016)) * 2.4 * closeMix;

  // Secondary upper/lower lensed halo arch created by light bending around the black hole
  float haloDist = abs(r - 0.28);
  float lensedHalo = exp(-(haloDist * haloDist) / (2.0 * 0.045 * 0.045)) * 0.85 * closeMix;

  // Tilted swirling accretion disk
  vec2 diskCoord = vec2(vUv.x, vUv.y / squashY);
  float diskR = length(diskCoord);
  float diskAng = atan(diskCoord.y, diskCoord.x);

  // Animated differential Keplerian shear in plasma rings
  float shearSpeed = uRealTimeSec * (0.85 / max(diskR, 0.18));
  float spiralPhase = diskAng + 6.0 * log(max(diskR, 0.15)) - shearSpeed;
  float plasma = swirlFbm(vec2(cos(spiralPhase) * 2.5 + diskR * 9.0, sin(spiralPhase) * 2.5 + diskR * 9.0));

  float diskRadialEnv = smoothstep(0.19, 0.27, diskR) * exp(-max(diskR - 0.26, 0.0) * 5.2);
  float diskIntensity = diskRadialEnv * (0.55 + 0.95 * plasma) * closeMix;

  // Relativistic Doppler beaming: approaching side (+X) boosted and hotter; receding side (-X) dimmed & redshifted
  float doppler = clamp(1.0 + 0.62 * (-vUv.x / max(r, 0.15)) * (1.0 - 0.4 * cosTilt), 0.35, 1.75);
  diskIntensity *= doppler;

  // Distant nuclear star cluster core glow (> 0.20 kpc)
  float farCoreGlow = exp(-r * r * 14.0) * (1.0 - closeMix) * 0.65;

  // Palette per wavelength mode
  vec3 hotColor = vec3(1.0, 0.88, 0.56);
  vec3 warmColor = vec3(1.0, 0.42, 0.08);
  if (uWavelength == 1) {
    hotColor = vec3(1.0, 0.78, 0.36);
    warmColor = vec3(0.95, 0.30, 0.06);
  } else if (uWavelength == 2) {
    hotColor = vec3(0.75, 0.90, 1.25);
    warmColor = vec3(0.48, 0.36, 1.0);
  } else if (uWavelength == 3) {
    hotColor = vec3(1.0, 0.75, 0.25);
    warmColor = vec3(0.85, 0.45, 0.10);
  }

  vec3 diskCol = mix(warmColor, hotColor, clamp((doppler - 0.5) * 0.85 + photonRing * 0.18, 0.0, 1.0));
  vec3 emission = diskCol * (diskIntensity * 2.1 + lensedHalo) + hotColor * photonRing + vec3(1.0, 0.78, 0.46) * farCoreGlow;

  // Premultiplied alpha: inside event horizon shadowMask=1 darkens background stars to pure black,
  // while outside shadow emission glows cleanly into the HDR buffer
  float edgeTaper = 1.0 - smoothstep(0.75, 1.0, r);
  float horizonClear = mix(1.0, smoothstep(0.165, 0.205, r), closeMix);
  emission *= edgeTaper * horizonClear;
  fragColor = vec4(emission, clamp(shadowMask, 0.0, 1.0));
}
`,ke=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSourceTex;
uniform vec2 uTexelSize;
uniform int uMipLevel;
uniform float uThreshold;

float luminance(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec3 karisWeight(vec3 c) {
  return c / (1.0 + luminance(c));
}

void main() {
  vec2 ts = uTexelSize;

  // 13-tap CoD:AW / Jimenez downsample filter to eliminate bloom firefly shimmering
  vec3 a = texture(uSourceTex, vUv + vec2(-2.0,  2.0) * ts).rgb;
  vec3 b = texture(uSourceTex, vUv + vec2( 0.0,  2.0) * ts).rgb;
  vec3 c = texture(uSourceTex, vUv + vec2( 2.0,  2.0) * ts).rgb;
  vec3 d = texture(uSourceTex, vUv + vec2(-1.0,  1.0) * ts).rgb;
  vec3 e = texture(uSourceTex, vUv + vec2( 1.0,  1.0) * ts).rgb;
  vec3 f = texture(uSourceTex, vUv + vec2(-2.0,  0.0) * ts).rgb;
  vec3 g = texture(uSourceTex, vUv).rgb;
  vec3 h = texture(uSourceTex, vUv + vec2( 2.0,  0.0) * ts).rgb;
  vec3 i = texture(uSourceTex, vUv + vec2(-1.0, -1.0) * ts).rgb;
  vec3 j = texture(uSourceTex, vUv + vec2( 1.0, -1.0) * ts).rgb;
  vec3 k = texture(uSourceTex, vUv + vec2(-2.0, -2.0) * ts).rgb;
  vec3 l = texture(uSourceTex, vUv + vec2( 0.0, -2.0) * ts).rgb;
  vec3 m = texture(uSourceTex, vUv + vec2( 2.0, -2.0) * ts).rgb;

  vec3 downsample;
  if (uMipLevel == 0) {
    // Karis average across 5 sub-groups suppresses single-pixel star aliasing
    vec3 g0 = karisWeight((a + b + f + g) * 0.25) * 0.125;
    vec3 g1 = karisWeight((b + c + g + h) * 0.25) * 0.125;
    vec3 g2 = karisWeight((f + g + k + l) * 0.25) * 0.125;
    vec3 g3 = karisWeight((g + h + l + m) * 0.25) * 0.125;
    vec3 g4 = karisWeight((d + e + i + j) * 0.25) * 0.5;
    downsample = g0 + g1 + g2 + g3 + g4;

    // Soft HDR knee threshold on first bloom level
    float br = max(downsample.r, max(downsample.g, downsample.b));
    float knee = uThreshold * 0.65;
    float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
    soft = (soft * soft) / (4.0 * max(knee, 1e-4));
    float contrib = max(soft, br - uThreshold) / max(br, 1e-4);
    downsample *= clamp(contrib, 0.0, 1.0);
  } else {
    downsample = g * 0.125;
    downsample += (a + c + k + m) * 0.03125;
    downsample += (b + f + h + l) * 0.0625;
    downsample += (d + e + i + j) * 0.125;
  }

  fragColor = vec4(max(downsample, vec3(0.0)), 1.0);
}
`,Re=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSourceTex;
uniform vec2 uTexelSize;
uniform float uFilterRadius;
uniform float uSpreadWeight;

void main() {
  vec2 r = uTexelSize * uFilterRadius;

  // 9-tap tent filter [1,2,1; 2,4,2; 1,2,1] / 16
  vec3 s = vec3(0.0);
  s += texture(uSourceTex, vUv + vec2(-r.x,  r.y)).rgb * 1.0;
  s += texture(uSourceTex, vUv + vec2( 0.0,  r.y)).rgb * 2.0;
  s += texture(uSourceTex, vUv + vec2( r.x,  r.y)).rgb * 1.0;

  s += texture(uSourceTex, vUv + vec2(-r.x,  0.0)).rgb * 2.0;
  s += texture(uSourceTex, vUv).rgb * 4.0;
  s += texture(uSourceTex, vUv + vec2( r.x,  0.0)).rgb * 2.0;

  s += texture(uSourceTex, vUv + vec2(-r.x, -r.y)).rgb * 1.0;
  s += texture(uSourceTex, vUv + vec2( 0.0, -r.y)).rgb * 2.0;
  s += texture(uSourceTex, vUv + vec2( r.x, -r.y)).rgb * 1.0;

  fragColor = vec4((s / 16.0) * uSpreadWeight, 1.0);
}
`,Ae=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uSceneTex;
uniform sampler2D uBloomTex;
uniform float uExposure;
uniform float uBloomIntensity;

vec3 acesFilmic(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float ditherHash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 scene = texture(uSceneTex, vUv).rgb;
  vec3 bloom = texture(uBloomTex, vUv).rgb;

  vec3 hdr = scene + bloom * (uBloomIntensity * 0.36);
  hdr *= uExposure;

  // ACES Filmic tone mapping
  vec3 mapped = acesFilmic(hdr);

  // Subtle observatory edge vignette
  vec2 centered = vUv * 2.0 - 1.0;
  float vig = 1.0 - dot(centered, centered) * 0.11;
  mapped *= clamp(vig, 0.72, 1.0);

  // Linear -> sRGB + 8-bit triangular dither to prevent dark cosmic gradient banding
  vec3 srgb = pow(max(mapped, vec3(0.0)), vec3(1.0 / 2.2));
  float dither = (ditherHash(gl_FragCoord.xy) - 0.5) / 255.0;
  fragColor = vec4(clamp(srgb + dither, 0.0, 1.0), 1.0);
}
`,et=1024,at=5,Rt=10,pt=4,Le=8,st=Le*pt;function De(o){switch(o){case"optical":return 0;case"infrared":return 1;case"ultraviolet":return 2;case"population":return 3}}class Ue{constructor(t){d(this,"canvas");d(this,"glInfo");d(this,"gl");d(this,"fullscreenVao");d(this,"starChunks",new Map);d(this,"nebulaVao",null);d(this,"nebulaVbo",null);d(this,"nebulaCount",0);d(this,"dustMapTex");d(this,"sceneTarget");d(this,"bloomTargets",[]);d(this,"widthPx",1);d(this,"heightPx",1);d(this,"dpr",1);d(this,"totalLoadedStars",0);d(this,"lastDrawnStars",0);d(this,"disposed",!1);d(this,"dustProgram");d(this,"skyProgram");d(this,"nebulaProgram");d(this,"starProgram");d(this,"sgrAProgram");d(this,"bloomDownProgram");d(this,"bloomUpProgram");d(this,"compositeProgram");d(this,"skyUniforms");d(this,"nebulaUniforms");d(this,"starUniforms");d(this,"sgrAUniforms");d(this,"bloomDownUniforms");d(this,"bloomUpUniforms");d(this,"compositeUniforms");this.canvas=t,this.glInfo=be(t),this.gl=this.glInfo.gl;const e=this.gl,a=e.createVertexArray();if(!a)throw new Error("Failed to create fullscreen VAO");this.fullscreenVao=a,this.dustProgram=_(e,tt,ye,"dust-map"),this.skyProgram=_(e,xe,Me,"sky"),this.nebulaProgram=_(e,we,Ee,"nebula"),this.starProgram=_(e,Pe,Se,"star"),this.sgrAProgram=_(e,Ce,Te,"sgra"),this.bloomDownProgram=_(e,tt,ke,"bloom-down"),this.bloomUpProgram=_(e,tt,Re,"bloom-up"),this.compositeProgram=_(e,tt,Ae,"composite"),this.skyUniforms={uInvViewProj:e.getUniformLocation(this.skyProgram,"uInvViewProj"),uWavelength:e.getUniformLocation(this.skyProgram,"uWavelength")},this.nebulaUniforms={uViewProj:e.getUniformLocation(this.nebulaProgram,"uViewProj"),uCameraPos:e.getUniformLocation(this.nebulaProgram,"uCameraPos"),uCameraRight:e.getUniformLocation(this.nebulaProgram,"uCameraRight"),uCameraUp:e.getUniformLocation(this.nebulaProgram,"uCameraUp"),uTimeMyr:e.getUniformLocation(this.nebulaProgram,"uTimeMyr"),uCameraDist:e.getUniformLocation(this.nebulaProgram,"uCameraDist"),uDustOpacity:e.getUniformLocation(this.nebulaProgram,"uDustOpacity"),uNebulaIntensity:e.getUniformLocation(this.nebulaProgram,"uNebulaIntensity"),uWavelength:e.getUniformLocation(this.nebulaProgram,"uWavelength"),uDustMap:e.getUniformLocation(this.nebulaProgram,"uDustMap")},this.starUniforms={uViewProj:e.getUniformLocation(this.starProgram,"uViewProj"),uCameraPos:e.getUniformLocation(this.starProgram,"uCameraPos"),uTimeMyr:e.getUniformLocation(this.starProgram,"uTimeMyr"),uDpr:e.getUniformLocation(this.starProgram,"uDpr"),uFocalLengthPx:e.getUniformLocation(this.starProgram,"uFocalLengthPx"),uCameraDist:e.getUniformLocation(this.starProgram,"uCameraDist"),uMaxPointSize:e.getUniformLocation(this.starProgram,"uMaxPointSize"),uDustOpacity:e.getUniformLocation(this.starProgram,"uDustOpacity"),uStarNorm:e.getUniformLocation(this.starProgram,"uStarNorm"),uWavelength:e.getUniformLocation(this.starProgram,"uWavelength"),uDustMap:e.getUniformLocation(this.starProgram,"uDustMap")},this.sgrAUniforms={uViewProj:e.getUniformLocation(this.sgrAProgram,"uViewProj"),uCameraPos:e.getUniformLocation(this.sgrAProgram,"uCameraPos"),uCameraRight:e.getUniformLocation(this.sgrAProgram,"uCameraRight"),uCameraUp:e.getUniformLocation(this.sgrAProgram,"uCameraUp"),uRealTimeSec:e.getUniformLocation(this.sgrAProgram,"uRealTimeSec"),uWavelength:e.getUniformLocation(this.sgrAProgram,"uWavelength")},this.bloomDownUniforms={uSourceTex:e.getUniformLocation(this.bloomDownProgram,"uSourceTex"),uTexelSize:e.getUniformLocation(this.bloomDownProgram,"uTexelSize"),uMipLevel:e.getUniformLocation(this.bloomDownProgram,"uMipLevel"),uThreshold:e.getUniformLocation(this.bloomDownProgram,"uThreshold")},this.bloomUpUniforms={uSourceTex:e.getUniformLocation(this.bloomUpProgram,"uSourceTex"),uTexelSize:e.getUniformLocation(this.bloomUpProgram,"uTexelSize"),uFilterRadius:e.getUniformLocation(this.bloomUpProgram,"uFilterRadius"),uSpreadWeight:e.getUniformLocation(this.bloomUpProgram,"uSpreadWeight")},this.compositeUniforms={uSceneTex:e.getUniformLocation(this.compositeProgram,"uSceneTex"),uBloomTex:e.getUniformLocation(this.compositeProgram,"uBloomTex"),uExposure:e.getUniformLocation(this.compositeProgram,"uExposure"),uBloomIntensity:e.getUniformLocation(this.compositeProgram,"uBloomIntensity")},this.dustMapTex=this.generateDustMapTexture();const s=Math.max(1,t.clientWidth||t.width||1280),i=Math.max(1,t.clientHeight||t.height||720),n=Math.min(typeof window<"u"&&window.devicePixelRatio||1,2);this.dpr=n,this.widthPx=Math.max(1,Math.round(s*n)),this.heightPx=Math.max(1,Math.round(i*n)),t.width=this.widthPx,t.height=this.heightPx,this.sceneTarget=dt(e,this.widthPx,this.heightPx,this.glInfo.hdrInternalFormat,this.glInfo.hdrType,e.LINEAR),this.bloomTargets=this.createBloomMipChain(this.widthPx,this.heightPx)}getBackendName(){return this.glInfo.backendName}getLoadedStarCount(){return this.totalLoadedStars}getActiveDrawnStars(){return this.lastDrawnStars}resize(t,e,a){if(this.disposed)return{width:this.widthPx,height:this.heightPx,dpr:this.dpr};const s=Math.max(1,t??(this.canvas.clientWidth||1)),i=Math.max(1,e??(this.canvas.clientHeight||1)),n=Math.min(2,Math.max(1,a??(typeof window<"u"&&window.devicePixelRatio||1))),r=this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS),c=r?Number(r[0]):8192,l=r?Number(r[1]):8192,u=Math.min(c,Math.max(1,Math.round(s*n))),h=Math.min(l,Math.max(1,Math.round(i*n)));if(this.dpr=n,u===this.widthPx&&h===this.heightPx)return{width:this.widthPx,height:this.heightPx,dpr:this.dpr};this.widthPx=u,this.heightPx=h,this.canvas.width=u,this.canvas.height=h,Tt(this.gl,this.sceneTarget,u,h);for(let f=0;f<at;f++){const E=Math.max(1,u>>f+1),p=Math.max(1,h>>f+1);Tt(this.gl,this.bloomTargets[f],E,p)}return{width:this.widthPx,height:this.heightPx,dpr:this.dpr}}uploadStarChunk(t){if(this.disposed)return;const e=this.gl,a=this.starChunks.get(t.chunkIndex);if(a){e.bindBuffer(e.ARRAY_BUFFER,a.vbo),e.bufferData(e.ARRAY_BUFFER,t.buffer,e.STATIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,null),this.totalLoadedStars+=t.starCount-a.starCount,a.starCount=t.starCount;return}const s=e.createVertexArray(),i=e.createBuffer();if(!s||!i)throw s&&e.deleteVertexArray(s),i&&e.deleteBuffer(i),new Error(`Failed to allocate GPU buffers for star chunk ${t.chunkIndex}`);e.bindVertexArray(s),e.bindBuffer(e.ARRAY_BUFFER,i),e.bufferData(e.ARRAY_BUFFER,t.buffer,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,st,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,st,4*pt),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),this.starChunks.set(t.chunkIndex,{chunkIndex:t.chunkIndex,starCount:t.starCount,vao:s,vbo:i}),this.totalLoadedStars+=t.starCount}uploadNebulaClouds(t){if(this.disposed)return;const e=this.gl;if(!this.nebulaVao||!this.nebulaVbo){const a=e.createVertexArray(),s=e.createBuffer();if(!a||!s)throw a&&e.deleteVertexArray(a),s&&e.deleteBuffer(s),new Error("Failed to allocate GPU buffers for nebula clouds");this.nebulaVao=a,this.nebulaVbo=s}e.bindVertexArray(this.nebulaVao),e.bindBuffer(e.ARRAY_BUFFER,this.nebulaVbo),e.bufferData(e.ARRAY_BUFFER,t.buffer,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,st,0),e.vertexAttribDivisor(0,1),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,st,4*pt),e.vertexAttribDivisor(1,1),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),this.nebulaCount=t.count}render(t,e,a,s=performance.now()*.001){if(this.disposed)return 0;const i=this.gl,n=this.canvas.clientWidth,r=this.canvas.clientHeight;if(n>0&&r>0){const P=Math.min(2,Math.max(1,typeof window<"u"&&window.devicePixelRatio||1)),S=Math.max(1,Math.round(n*P)),k=Math.max(1,Math.round(r*P));(S!==this.widthPx||k!==this.heightPx||P!==this.dpr)&&this.resize(n,r,P),t.setViewport(n,r)}const c=this.widthPx,l=this.heightPx,u=De(e.wavelength),h=t.getViewProjMatrix(),f=t.getInvViewProjMatrix(),E=t.getEyePosition(),p=t.getRightVector(),M=t.getUpVector(),w=t.getState().distanceKpc,b=t.getFocalLengthPx();let v=e.starCountTier,g=0;for(let P=0;P<Rt&&v>0;P++){const S=this.starChunks.get(P);if(!S)continue;const k=Math.min(S.starCount,v);g+=k,v-=k}this.lastDrawnStars=g;const y=Math.max(g,Math.min(e.starCountTier,5e5)),m=Math.min(2.1,Math.max(.55,Math.pow(2e6/y,.42)));if(i.disable(i.DEPTH_TEST),i.disable(i.CULL_FACE),i.bindFramebuffer(i.FRAMEBUFFER,this.sceneTarget.framebuffer),i.viewport(0,0,c,l),i.disable(i.BLEND),i.useProgram(this.skyProgram),i.uniformMatrix4fv(this.skyUniforms.uInvViewProj,!1,f),i.uniform1i(this.skyUniforms.uWavelength,u),i.bindVertexArray(this.fullscreenVao),i.drawArrays(i.TRIANGLES,0,3),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.dustMapTex),this.nebulaVao&&this.nebulaCount>0&&e.nebulaIntensity>.001&&(i.enable(i.BLEND),i.blendFunc(i.ONE,i.ONE),i.useProgram(this.nebulaProgram),i.uniformMatrix4fv(this.nebulaUniforms.uViewProj,!1,h),i.uniform3fv(this.nebulaUniforms.uCameraPos,E),i.uniform3fv(this.nebulaUniforms.uCameraRight,p),i.uniform3fv(this.nebulaUniforms.uCameraUp,M),i.uniform1f(this.nebulaUniforms.uTimeMyr,a),i.uniform1f(this.nebulaUniforms.uCameraDist,w),i.uniform1f(this.nebulaUniforms.uDustOpacity,e.dustOpacity),i.uniform1f(this.nebulaUniforms.uNebulaIntensity,e.nebulaIntensity),i.uniform1i(this.nebulaUniforms.uWavelength,u),i.uniform1i(this.nebulaUniforms.uDustMap,0),i.bindVertexArray(this.nebulaVao),i.drawArraysInstanced(i.TRIANGLES,0,6,this.nebulaCount)),g>0){i.enable(i.BLEND),i.blendFunc(i.ONE,i.ONE),i.useProgram(this.starProgram),i.uniformMatrix4fv(this.starUniforms.uViewProj,!1,h),i.uniform3fv(this.starUniforms.uCameraPos,E),i.uniform1f(this.starUniforms.uTimeMyr,a),i.uniform1f(this.starUniforms.uDpr,this.dpr),i.uniform1f(this.starUniforms.uFocalLengthPx,b),i.uniform1f(this.starUniforms.uCameraDist,w),i.uniform1f(this.starUniforms.uMaxPointSize,Math.min(48*this.dpr,this.glInfo.maxPointSize)),i.uniform1f(this.starUniforms.uDustOpacity,e.dustOpacity),i.uniform1f(this.starUniforms.uStarNorm,m),i.uniform1i(this.starUniforms.uWavelength,u),i.uniform1i(this.starUniforms.uDustMap,0);let P=e.starCountTier;for(let S=0;S<Rt&&P>0;S++){const k=this.starChunks.get(S);if(!k)continue;const U=Math.min(k.starCount,P);U<=0||(i.bindVertexArray(k.vao),i.drawArrays(i.POINTS,0,U),P-=U)}}if(i.enable(i.BLEND),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.useProgram(this.sgrAProgram),i.uniformMatrix4fv(this.sgrAUniforms.uViewProj,!1,h),i.uniform3fv(this.sgrAUniforms.uCameraPos,E),i.uniform3fv(this.sgrAUniforms.uCameraRight,p),i.uniform3fv(this.sgrAUniforms.uCameraUp,M),i.uniform1f(this.sgrAUniforms.uRealTimeSec,s),i.uniform1i(this.sgrAUniforms.uWavelength,u),i.bindVertexArray(this.fullscreenVao),i.drawArrays(i.TRIANGLES,0,6),e.bloomIntensity>.001)this.renderBloomChain();else{const P=this.bloomTargets[0];i.bindFramebuffer(i.FRAMEBUFFER,P.framebuffer),i.viewport(0,0,P.width,P.height),i.clearColor(0,0,0,1),i.clear(i.COLOR_BUFFER_BIT)}return i.bindFramebuffer(i.FRAMEBUFFER,null),i.viewport(0,0,c,l),i.disable(i.BLEND),i.useProgram(this.compositeProgram),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.sceneTarget.texture),i.uniform1i(this.compositeUniforms.uSceneTex,0),i.activeTexture(i.TEXTURE1),i.bindTexture(i.TEXTURE_2D,this.bloomTargets[0].texture),i.uniform1i(this.compositeUniforms.uBloomTex,1),i.uniform1f(this.compositeUniforms.uExposure,e.exposure),i.uniform1f(this.compositeUniforms.uBloomIntensity,e.bloomIntensity),i.bindVertexArray(this.fullscreenVao),i.drawArrays(i.TRIANGLES,0,3),i.bindVertexArray(null),g}projectLandmarks(t,e,a,s,i){const n=e.getViewProjMatrix(),r=e.getEyePosition(),c=new Array(t.length);for(let l=0;l<t.length;l++){const u=t[l],h=Gt(u,a),f=pe(h,n,s,i),E=Math.hypot(h[0]-r[0],h[1]-r[1],h[2]-r[2]);c[l]={landmark:u,screenX:f.x,screenY:f.y,visible:f.visible,distanceKpc:E}}return c}dispose(){if(this.disposed)return;this.disposed=!0;const t=this.gl;for(const e of this.starChunks.values())t.deleteVertexArray(e.vao),t.deleteBuffer(e.vbo);this.starChunks.clear(),this.nebulaVao&&t.deleteVertexArray(this.nebulaVao),this.nebulaVbo&&t.deleteBuffer(this.nebulaVbo),this.nebulaVao=null,this.nebulaVbo=null,t.deleteVertexArray(this.fullscreenVao),t.deleteTexture(this.dustMapTex),kt(t,this.sceneTarget);for(const e of this.bloomTargets)kt(t,e);this.bloomTargets.length=0,t.deleteProgram(this.dustProgram),t.deleteProgram(this.skyProgram),t.deleteProgram(this.nebulaProgram),t.deleteProgram(this.starProgram),t.deleteProgram(this.sgrAProgram),t.deleteProgram(this.bloomDownProgram),t.deleteProgram(this.bloomUpProgram),t.deleteProgram(this.compositeProgram)}generateDustMapTexture(){const t=this.gl,e=dt(t,et,et,this.glInfo.hdrInternalFormat,this.glInfo.hdrType,t.LINEAR);for(t.bindFramebuffer(t.FRAMEBUFFER,e.framebuffer),t.viewport(0,0,et,et),t.disable(t.BLEND),t.disable(t.DEPTH_TEST),t.useProgram(this.dustProgram),t.bindVertexArray(this.fullscreenVao),t.drawArrays(t.TRIANGLES,0,3),t.bindVertexArray(null),t.bindFramebuffer(t.FRAMEBUFFER,null),t.deleteFramebuffer(e.framebuffer);t.getError()!==t.NO_ERROR;);return t.bindTexture(t.TEXTURE_2D,e.texture),t.generateMipmap(t.TEXTURE_2D),t.getError()===t.NO_ERROR?t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR):t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.bindTexture(t.TEXTURE_2D,null),e.texture}createBloomMipChain(t,e){const a=this.gl,s=[];for(let i=0;i<at;i++){const n=Math.max(1,t>>i+1),r=Math.max(1,e>>i+1);s.push(dt(a,n,r,this.glInfo.hdrInternalFormat,this.glInfo.hdrType,a.LINEAR))}return s}renderBloomChain(){const t=this.gl;t.bindVertexArray(this.fullscreenVao),t.disable(t.BLEND),t.useProgram(this.bloomDownProgram),t.uniform1f(this.bloomDownUniforms.uThreshold,1.12);let e=this.sceneTarget.texture,a=this.sceneTarget.width,s=this.sceneTarget.height;for(let i=0;i<at;i++){const n=this.bloomTargets[i];t.bindFramebuffer(t.FRAMEBUFFER,n.framebuffer),t.viewport(0,0,n.width,n.height),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,e),t.uniform1i(this.bloomDownUniforms.uSourceTex,0),t.uniform2f(this.bloomDownUniforms.uTexelSize,1/a,1/s),t.uniform1i(this.bloomDownUniforms.uMipLevel,i),t.drawArrays(t.TRIANGLES,0,3),e=n.texture,a=n.width,s=n.height}t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE),t.useProgram(this.bloomUpProgram),t.uniform1f(this.bloomUpUniforms.uFilterRadius,1.15),t.uniform1f(this.bloomUpUniforms.uSpreadWeight,.84);for(let i=at-1;i>0;i--){const n=this.bloomTargets[i],r=this.bloomTargets[i-1];t.bindFramebuffer(t.FRAMEBUFFER,r.framebuffer),t.viewport(0,0,r.width,r.height),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,n.texture),t.uniform1i(this.bloomUpUniforms.uSourceTex,0),t.uniform2f(this.bloomUpUniforms.uTexelSize,1/n.width,1/n.height),t.drawArrays(t.TRIANGLES,0,3)}}}const Fe="modulepreload",Ie=function(o){return"/"+o},At={},_e=function(t,e,a){let s=Promise.resolve();if(e&&e.length>0){let n=function(l){return Promise.all(l.map(u=>Promise.resolve(u).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),c=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));s=n(e.map(l=>{if(l=Ie(l),l in At)return;At[l]=!0;const u=l.endsWith(".css"),h=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${h}`))return;const f=document.createElement("link");if(f.rel=u?"stylesheet":Fe,u||(f.as="script"),f.crossOrigin="",f.href=l,c&&f.setAttribute("nonce",c),document.head.appendChild(f),u)return new Promise((E,p)=>{f.addEventListener("load",E),f.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${l}`)))})}))}function i(n){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=n,window.dispatchEvent(r),!r.defaultPrevented)throw n}return s.then(n=>{for(const r of n||[])r.status==="rejected"&&i(r.reason);return t().catch(i)})},Lt={optical:"Visible photospheres with Great Rift interstellar dust reddening.",infrared:"JWST/2MASS near-IR penetrates Galactic dust to reveal the hidden bar.",ultraviolet:"GALEX ultraviolet isolates young hot O/B associations along spiral arms.",population:"Diagnostic map: Bulge amber, Arms cyan, Thin white, Thick violet, Halo green."},Oe={1:"overview",2:"oblique",3:"edge",4:"sol",5:"core"};let Dt=!1;function Ke(){Dt||typeof HTMLInputElement>"u"||(Dt=!0,"switch"in HTMLInputElement.prototype||_e(()=>import("./input-switch-polyfill-B34Wr1l0.js"),[]))}function Be(){return`
    <div class="hud-shell" data-hud-shell>
      <div id="landmark-overlay" class="landmark-overlay" aria-label="3D galactic landmark markers"></div>
      <header class="hud-header glass-panel" data-hud-chrome>
        <div class="header-title-row">
          <h1 class="observatory-title">Milky Way Observatory</h1>
          <span class="galaxy-tag">SBbc</span>
        </div>
        <dl class="telemetry-grid" aria-label="Live observatory telemetry">
          <div class="telemetry-cell"><dt>FPS</dt><dd data-telemetry="fps">--</dd></div>
          <div class="telemetry-cell"><dt>Stars</dt><dd data-telemetry="stars">0.00M</dd></div>
          <div class="telemetry-cell"><dt>Clock</dt><dd data-telemetry="clock">+0.0 Myr</dd></div>
          <div class="telemetry-cell"><dt>Gal R</dt><dd data-telemetry="radius">-- kpc</dd></div>
          <div class="telemetry-cell"><dt>Gal Z</dt><dd data-telemetry="height">-- kpc</dd></div>
          <div class="telemetry-cell"><dt>Sol Dist</dt><dd data-telemetry="sol-dist">-- ly</dd></div>
        </dl>
        <div class="streaming-row" data-streaming-container>
          <div class="streaming-meta">
            <span class="streaming-status" data-telemetry="loading-status">Streaming star catalog…</span>
            <span class="backend-badge" data-telemetry="backend">WebGL2</span>
          </div>
          <progress class="loading-progress" data-telemetry="progress" max="1" value="0" aria-label="Star catalog loading progress"></progress>
        </div>
      </header>
      <article class="landmark-card glass-panel" data-landmark-card data-hud-chrome hidden aria-label="Selected galactic landmark details">
        <div class="card-header">
          <span class="card-category" data-card-category></span>
          <button type="button" class="ghost-btn compact-btn" data-action="close-card">Dismiss</button>
        </div>
        <h2 class="card-title" data-card-title></h2>
        <p class="card-classification" data-card-classification></p>
        <dl class="card-metrics">
          <div class="card-metric"><dt>Sol Distance</dt><dd data-card-distance></dd></div>
          <div class="card-metric"><dt>Galactocentric (X, Y, Z)</dt><dd data-card-coords></dd></div>
        </dl>
        <p class="card-description" data-card-description></p>
        <div class="card-actions">
          <button type="button" class="primary-btn compact-btn" data-action="refocus-landmark">Fly To Landmark</button>
        </div>
      </article>
      <nav class="preset-nav glass-panel" data-hud-chrome aria-label="Camera presets and observatory actions">
        <div class="preset-toolbar" role="toolbar" aria-label="Quick camera presets">
          <button type="button" class="preset-btn" data-preset="overview"><span>Overview</span><kbd>1</kbd></button>
          <button type="button" class="preset-btn" data-preset="oblique"><span>Oblique</span><kbd>2</kbd></button>
          <button type="button" class="preset-btn" data-preset="edge"><span>Edge-On Rift</span><kbd>3</kbd></button>
          <button type="button" class="preset-btn" data-preset="sol"><span>Solar System</span><kbd>4</kbd></button>
          <button type="button" class="preset-btn" data-preset="core"><span>Sgr A* Core</span><kbd>5</kbd></button>
        </div>
        <div class="toolbar-divider" aria-hidden="true"></div>
        <div class="toolbar-actions">
          <button type="button" class="ghost-btn" data-action="reset-view">Reset</button>
          <button type="button" class="ghost-btn" popovertarget="spectral-legend-popover">Legend</button>
          <button type="button" class="ghost-btn" data-action="open-guide"><span>Guide</span><kbd>?</kbd></button>
          <button type="button" class="ghost-btn" data-action="toggle-hud"><span>Hide HUD</span><kbd>H</kbd></button>
          <button type="button" class="ghost-btn" data-action="toggle-drawer" aria-expanded="true" aria-controls="observatory-drawer">Controls</button>
        </div>
      </nav>
      <button type="button" class="hud-restore-pill glass-panel" data-action="restore-hud" hidden><span>Show HUD</span><kbd>H</kbd></button>
      <aside id="observatory-drawer" class="control-drawer glass-panel" data-hud-chrome aria-label="Observatory simulation controls">
        <div class="drawer-header">
          <span class="drawer-title">Observatory Controls</span>
          <button type="button" class="ghost-btn compact-btn" data-action="toggle-drawer">Collapse</button>
        </div>
        <div class="drawer-scroll">
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Simulation Scale</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <fieldset class="segmented-fieldset">
                <legend class="field-legend">Star Count Tier</legend>
                <div class="tier-grid">
                  <label class="segment-option"><input type="radio" name="star-tier" value="500000"><span>500K</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="1000000"><span>1M</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="2000000" checked><span>2M</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="3500000"><span>3.5M</span></label>
                  <label class="segment-option"><input type="radio" name="star-tier" value="5000000"><span>5M</span></label>
                </div>
              </fieldset>
              <div class="slider-control">
                <div class="slider-header"><label for="slider-timescale">Time Warp</label><output for="slider-timescale" data-output="timescale">1.5 Myr/s</output></div>
                <input id="slider-timescale" type="range" min="0" max="15" step="0.1" value="1.5" data-setting="timeScaleMyrPerSec">
              </div>
              <div class="playback-row">
                <button type="button" class="primary-btn playback-btn" data-action="toggle-pause" aria-pressed="false"><span data-pause-label>Pause Simulation</span><kbd>Space</kbd></button>
              </div>
              <div class="switch-list">
                <label class="switch-row" for="switch-auto-orbit"><span>Auto-Orbit Camera</span><input id="switch-auto-orbit" type="checkbox" switch data-setting="autoOrbit"></label>
                <label class="switch-row" for="switch-follow-sol"><span>Follow Sol Orbit</span><input id="switch-follow-sol" type="checkbox" switch data-setting="followSol"></label>
              </div>
            </div>
          </details>
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Spectral Wavelength</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <fieldset class="segmented-fieldset">
                <legend class="field-legend">Observatory Bandpass</legend>
                <div class="wavelength-grid">
                  <label class="segment-option"><input type="radio" name="wavelength" value="optical" checked><span>Optical</span></label>
                  <label class="segment-option"><input type="radio" name="wavelength" value="infrared"><span>Near-IR (JWST)</span></label>
                  <label class="segment-option"><input type="radio" name="wavelength" value="ultraviolet"><span>Ultraviolet</span></label>
                  <label class="segment-option"><input type="radio" name="wavelength" value="population"><span>Population Map</span></label>
                </div>
              </fieldset>
              <p class="bandpass-note" data-wavelength-note></p>
            </div>
          </details>
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Optics &amp; ISM</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <div class="optics-grid">
                <div class="slider-control"><div class="slider-header"><label for="slider-exposure">Exposure</label><output for="slider-exposure" data-output="exposure">1.15 EV</output></div><input id="slider-exposure" type="range" min="0.3" max="3.0" step="0.05" value="1.15" data-setting="exposure"></div>
                <div class="slider-control"><div class="slider-header"><label for="slider-bloom">Bloom Intensity</label><output for="slider-bloom" data-output="bloom">75%</output></div><input id="slider-bloom" type="range" min="0" max="2.0" step="0.05" value="0.75" data-setting="bloomIntensity"></div>
                <div class="slider-control"><div class="slider-header"><label for="slider-dust">Dust Opacity</label><output for="slider-dust" data-output="dust">100%</output></div><input id="slider-dust" type="range" min="0" max="2.5" step="0.05" value="1.0" data-setting="dustOpacity"></div>
                <div class="slider-control"><div class="slider-header"><label for="slider-nebula">H-II Nebula Glow</label><output for="slider-nebula" data-output="nebula">85%</output></div><input id="slider-nebula" type="range" min="0" max="2.5" step="0.05" value="0.85" data-setting="nebulaIntensity"></div>
              </div>
              <div class="switch-list"><label class="switch-row" for="switch-landmarks"><span>Landmark Markers</span><input id="switch-landmarks" type="checkbox" switch checked data-setting="showLandmarks"></label></div>
            </div>
          </details>
          <details class="control-group" open>
            <summary class="control-summary"><span class="summary-label">Galactic Landmarks</span><span class="summary-indicator" aria-hidden="true"></span></summary>
            <div class="control-body">
              <search class="landmark-search"><label class="visually-hidden" for="landmark-filter">Filter galactic landmarks</label><input id="landmark-filter" type="search" placeholder="Filter nebulae, clusters, core…" autocomplete="off" data-landmark-search></search>
              <ul class="landmark-list" data-landmark-list aria-label="Galactic landmarks directory"></ul>
            </div>
          </details>
        </div>
      </aside>
      <section id="spectral-legend-popover" popover="auto" class="legend-popover glass-panel" aria-labelledby="legend-popover-title">
        <div class="popover-header"><h2 id="legend-popover-title">Spectral &amp; Population Key</h2><button type="button" class="ghost-btn compact-btn" popovertarget="spectral-legend-popover" popovertargetaction="hide">Close</button></div>
      </section>
      <dialog id="astrophysics-dialog" class="help-dialog glass-panel" closedby="any" aria-labelledby="astrophysics-dialog-title">
        <form method="dialog" class="dialog-header"><h2 id="astrophysics-dialog-title">Milky Way Astrophysics &amp; Navigation</h2><button type="submit" class="ghost-btn compact-btn">Close</button></form>
        <div class="dialog-body"><p>Milky Way Observatory WebGL2 Simulation.</p></div>
      </dialog>
      <section class="error-banner glass-panel" data-error-banner role="alert" hidden>
        <h2>Observatory Renderer Unavailable</h2>
        <p data-error-message></p>
      </section>
    </div>
  `}class ze{constructor(t,e,a,s){d(this,"root");d(this,"landmarks");d(this,"callbacks");d(this,"abortController",new AbortController);d(this,"settings");d(this,"selectedLandmark",null);d(this,"hudHidden",!1);d(this,"drawerCollapsed",!1);d(this,"activeFilter","");d(this,"shellEl");d(this,"overlayEl");d(this,"restorePillEl");d(this,"helpDialogEl");d(this,"errorBannerEl");d(this,"errorMessageEl");d(this,"fpsEl");d(this,"starsEl");d(this,"clockEl");d(this,"radiusEl");d(this,"heightEl");d(this,"solDistEl");d(this,"loadingStatusEl");d(this,"backendEl");d(this,"streamingContainerEl");d(this,"progressEl");d(this,"pauseButtonEl");d(this,"pauseLabelEl");d(this,"wavelengthNoteEl");d(this,"drawerToggleButtons");d(this,"presetButtons");d(this,"landmarkSearchEl");d(this,"landmarkListEl");d(this,"landmarkCardEl");d(this,"cardCategoryEl");d(this,"cardTitleEl");d(this,"cardClassificationEl");d(this,"cardDistanceEl");d(this,"cardCoordsEl");d(this,"cardDescriptionEl");d(this,"tierRadios");d(this,"wavelengthRadios");d(this,"sliderInputs",new Map);d(this,"sliderOutputs",new Map);d(this,"switchInputs",new Map);d(this,"pinElements",new Map);d(this,"directoryButtons",new Map);Ke(),this.root=t,this.landmarks=e,this.settings={...a},this.callbacks=s,this.root.querySelector("[data-hud-shell]")||(this.root.innerHTML=Be()),this.shellEl=this.requireElement("[data-hud-shell]"),this.overlayEl=this.requireElement("#landmark-overlay"),this.restorePillEl=this.requireElement('[data-action="restore-hud"]'),this.helpDialogEl=this.requireElement("#astrophysics-dialog"),this.errorBannerEl=this.requireElement("[data-error-banner]"),this.errorMessageEl=this.requireElement("[data-error-message]"),this.fpsEl=this.requireElement('[data-telemetry="fps"]'),this.starsEl=this.requireElement('[data-telemetry="stars"]'),this.clockEl=this.requireElement('[data-telemetry="clock"]'),this.radiusEl=this.requireElement('[data-telemetry="radius"]'),this.heightEl=this.requireElement('[data-telemetry="height"]'),this.solDistEl=this.requireElement('[data-telemetry="sol-dist"]'),this.loadingStatusEl=this.requireElement('[data-telemetry="loading-status"]'),this.backendEl=this.requireElement('[data-telemetry="backend"]'),this.streamingContainerEl=this.requireElement("[data-streaming-container]"),this.progressEl=this.requireElement('[data-telemetry="progress"]'),this.pauseButtonEl=this.requireElement('[data-action="toggle-pause"]'),this.pauseLabelEl=this.requireElement("[data-pause-label]"),this.wavelengthNoteEl=this.requireElement("[data-wavelength-note]"),this.drawerToggleButtons=Array.from(this.shellEl.querySelectorAll('[data-action="toggle-drawer"]')),this.presetButtons=Array.from(this.shellEl.querySelectorAll("[data-preset]")),this.landmarkSearchEl=this.requireElement("[data-landmark-search]"),this.landmarkListEl=this.requireElement("[data-landmark-list]"),this.landmarkCardEl=this.requireElement("[data-landmark-card]"),this.cardCategoryEl=this.requireElement("[data-card-category]"),this.cardTitleEl=this.requireElement("[data-card-title]"),this.cardClassificationEl=this.requireElement("[data-card-classification]"),this.cardDistanceEl=this.requireElement("[data-card-distance]"),this.cardCoordsEl=this.requireElement("[data-card-coords]"),this.cardDescriptionEl=this.requireElement("[data-card-description]"),this.tierRadios=Array.from(this.shellEl.querySelectorAll('input[name="star-tier"]')),this.wavelengthRadios=Array.from(this.shellEl.querySelectorAll('input[name="wavelength"]')),this.indexSlidersAndSwitches(),this.renderLandmarkDirectory(),this.bindEvents(),this.syncSettings(this.settings)}updateTelemetry(t){this.fpsEl.textContent=t.fps>0?String(Math.round(t.fps)):"--",this.starsEl.textContent=`${(t.activeStars/1e6).toFixed(2)}M`;const e=t.simTimeMyr>=0?"+":"";this.clockEl.textContent=`${e}${t.simTimeMyr.toFixed(1)} Myr`,this.radiusEl.textContent=`${t.cameraRadiusKpc.toFixed(2)} kpc`;const a=t.cameraHeightKpc>=0?"+":"";this.heightEl.textContent=`${a}${t.cameraHeightKpc.toFixed(2)} kpc`,this.solDistEl.textContent=this.formatSolDistance(t.cameraDistFromSolLy),this.backendEl.textContent=t.webglBackend||"WebGL2";const s=t.targetStars>0?Math.max(0,Math.min(1,t.loadedStars/t.targetStars)):1,i=t.loadingProgress>1?t.loadingProgress/100:t.loadingProgress,n=t.targetStars>0?s:Math.max(0,Math.min(1,Number.isFinite(i)?i:1)),r=n>=.999||t.targetStars>0&&t.loadedStars>=t.targetStars;if(this.progressEl.value=r?1:n,this.streamingContainerEl.dataset.complete=r?"true":"false",r)this.loadingStatusEl.textContent=`${(t.loadedStars/1e6).toFixed(2)}M stars streamed`;else{const c=(t.loadedStars/1e6).toFixed(2),l=(t.targetStars/1e6).toFixed(2);this.loadingStatusEl.textContent=`Streaming ${c}M / ${l}M (${Math.round(n*100)}%)`}}updateProjectedLandmarks(t){var a;if(!this.settings.showLandmarks||this.hudHidden){for(const s of this.pinElements.values())s.hidden=!0;return}const e=new Set;for(const s of t){const{landmark:i,screenX:n,screenY:r,visible:c}=s;e.add(i.id);const l=this.getOrCreatePin(i);if(!c||!Number.isFinite(n)||!Number.isFinite(r)){l.hidden=!0;continue}l.hidden=!1,l.style.setProperty("--pin-x",`${n.toFixed(1)}px`),l.style.setProperty("--pin-y",`${r.toFixed(1)}px`),l.dataset.selected=((a=this.selectedLandmark)==null?void 0:a.id)===i.id?"true":"false"}for(const[s,i]of this.pinElements)e.has(s)||(i.hidden=!0)}syncSettings(t){this.settings={...t};for(const e of this.tierRadios)e.checked=Number(e.value)===t.starCountTier;for(const e of this.wavelengthRadios)e.checked=e.value===t.wavelength;if(this.wavelengthNoteEl.textContent=Lt[t.wavelength],this.syncRangeElement("timeScaleMyrPerSec",t.timeScaleMyrPerSec),this.syncRangeElement("exposure",t.exposure),this.syncRangeElement("bloomIntensity",t.bloomIntensity),this.syncRangeElement("dustOpacity",t.dustOpacity),this.syncRangeElement("nebulaIntensity",t.nebulaIntensity),this.syncSwitchElement("autoOrbit",t.autoOrbit),this.syncSwitchElement("followSol",t.followSol),this.syncSwitchElement("showLandmarks",t.showLandmarks),this.pauseButtonEl.setAttribute("aria-pressed",String(t.paused)),this.pauseLabelEl.textContent=t.paused?"Resume Simulation":"Pause Simulation",!t.showLandmarks)for(const e of this.pinElements.values())e.hidden=!0}showError(t){this.errorMessageEl.textContent=t,this.errorBannerEl.hidden=!1,this.loadingStatusEl.textContent="Renderer initialization failed",this.streamingContainerEl.dataset.complete="true"}dispose(){this.abortController.abort(),this.overlayEl.replaceChildren(),this.pinElements.clear(),this.directoryButtons.clear()}requireElement(t){const e=this.root.querySelector(t);if(!e)throw new Error(`ObservatoryHud missing required element: ${t}`);return e}indexSlidersAndSwitches(){const t=["timeScaleMyrPerSec","exposure","bloomIntensity","dustOpacity","nebulaIntensity"];for(const a of t){const s=this.shellEl.querySelector(`input[type="range"][data-setting="${a}"]`);if(s){this.sliderInputs.set(a,s);const i=this.shellEl.querySelector(`output[for="${s.id}"]`);i&&this.sliderOutputs.set(a,i)}}const e=["autoOrbit","followSol","showLandmarks"];for(const a of e){const s=this.shellEl.querySelector(`input[type="checkbox"][data-setting="${a}"]`);s&&this.switchInputs.set(a,s)}}bindEvents(){const{signal:t}=this.abortController;for(const r of this.tierRadios)r.addEventListener("change",()=>{if(!r.checked)return;const c=Number(r.value);this.settings.starCountTier=c,this.callbacks.onSettingsChange({starCountTier:c})},{signal:t});for(const r of this.wavelengthRadios)r.addEventListener("change",()=>{if(!r.checked)return;const c=r.value;this.settings.wavelength=c,this.wavelengthNoteEl.textContent=Lt[c],this.callbacks.onSettingsChange({wavelength:c})},{signal:t});for(const[r,c]of this.sliderInputs)c.addEventListener("input",()=>{const l=Number(c.value);this.syncRangeElement(r,l),this.settings[r]=l,this.callbacks.onSettingsChange({[r]:l})},{signal:t});for(const[r,c]of this.switchInputs)c.addEventListener("change",()=>{const l=c.checked;if(this.settings[r]=l,r==="showLandmarks"&&!l)for(const u of this.pinElements.values())u.hidden=!0;this.callbacks.onSettingsChange({[r]:l})},{signal:t});this.pauseButtonEl.addEventListener("click",()=>this.togglePaused(),{signal:t});for(const r of this.presetButtons)r.addEventListener("click",()=>{const c=r.dataset.preset;c&&this.triggerCameraPreset(c)},{signal:t});const e=this.shellEl.querySelector('[data-action="reset-view"]');e==null||e.addEventListener("click",()=>{this.clearPresetHighlight(),this.callbacks.onResetView()},{signal:t});const a=this.shellEl.querySelector('[data-action="open-guide"]');a==null||a.addEventListener("click",()=>this.openHelpDialog(),{signal:t});const s=this.shellEl.querySelector('[data-action="toggle-hud"]');s==null||s.addEventListener("click",()=>this.setHudHidden(!0),{signal:t}),this.restorePillEl.addEventListener("click",()=>this.setHudHidden(!1),{signal:t});for(const r of this.drawerToggleButtons)r.addEventListener("click",()=>this.setDrawerCollapsed(!this.drawerCollapsed),{signal:t});this.landmarkSearchEl.addEventListener("input",()=>{this.activeFilter=this.landmarkSearchEl.value.trim().toLowerCase(),this.renderLandmarkDirectory()},{signal:t});const i=this.shellEl.querySelector('[data-action="close-card"]');i==null||i.addEventListener("click",()=>{this.selectedLandmark=null,this.landmarkCardEl.hidden=!0,this.syncSelectedLandmarkStates()},{signal:t});const n=this.shellEl.querySelector('[data-action="refocus-landmark"]');n==null||n.addEventListener("click",()=>{this.selectedLandmark&&this.callbacks.onSelectLandmark(this.selectedLandmark)},{signal:t}),this.helpDialogEl.addEventListener("click",r=>{r.target===this.helpDialogEl&&this.helpDialogEl.close()},{signal:t}),window.addEventListener("keydown",r=>this.handleKeyDown(r),{signal:t})}handleKeyDown(t){if(t.ctrlKey||t.metaKey||t.altKey)return;const e=t.target;if(e instanceof HTMLTextAreaElement||e instanceof HTMLSelectElement||(e==null?void 0:e.isContentEditable)===!0||e instanceof HTMLInputElement&&e.type!=="range"&&e.type!=="checkbox"&&e.type!=="radio")return;if(t.key==="?"&&!this.helpDialogEl.open){t.preventDefault(),this.openHelpDialog();return}if(this.helpDialogEl.open)return;if(t.key==="h"||t.key==="H"){t.preventDefault(),this.setHudHidden(!this.hudHidden);return}const s=Oe[t.key];if(s){t.preventDefault(),this.triggerCameraPreset(s);return}if(t.code==="Space"){if(e instanceof HTMLButtonElement||e instanceof HTMLAnchorElement||(e==null?void 0:e.tagName)==="SUMMARY"||e instanceof HTMLInputElement&&(e.type==="checkbox"||e.type==="radio"))return;t.preventDefault(),this.togglePaused()}}togglePaused(){const t=!this.settings.paused;this.settings.paused=t,this.pauseButtonEl.setAttribute("aria-pressed",String(t)),this.pauseLabelEl.textContent=t?"Resume Simulation":"Pause Simulation",this.callbacks.onSettingsChange({paused:t})}triggerCameraPreset(t){for(const e of this.presetButtons)e.dataset.active=e.dataset.preset===t?"true":"false";this.callbacks.onCameraPreset(t)}clearPresetHighlight(){for(const t of this.presetButtons)t.dataset.active="false"}setHudHidden(t){if(this.hudHidden=t,this.shellEl.dataset.hudHidden=t?"true":"false",this.restorePillEl.hidden=!t,t){for(const a of this.pinElements.values())a.hidden=!0;const e=this.shellEl.querySelector("#spectral-legend-popover");if(e&&"hidePopover"in e)try{e.hidePopover()}catch{}}}setDrawerCollapsed(t){this.drawerCollapsed=t,this.shellEl.dataset.drawerCollapsed=t?"true":"false";for(const e of this.drawerToggleButtons)e.hasAttribute("aria-expanded")&&e.setAttribute("aria-expanded",String(!t))}openHelpDialog(){this.helpDialogEl.open||this.helpDialogEl.showModal()}selectLandmark(t){this.selectedLandmark=t,this.clearPresetHighlight(),this.syncSelectedLandmarkStates(),this.cardCategoryEl.textContent=t.category,this.cardTitleEl.textContent=t.name,this.cardClassificationEl.textContent=t.classification,this.cardDistanceEl.textContent=t.distanceFromSolLy;const[e,a,s]=t.positionKpc;this.cardCoordsEl.textContent=`${e.toFixed(2)}, ${a.toFixed(2)}, ${s.toFixed(2)} kpc`,this.cardDescriptionEl.textContent=t.description,this.landmarkCardEl.hidden=!1,this.callbacks.onSelectLandmark(t)}syncSelectedLandmarkStates(){var e;const t=((e=this.selectedLandmark)==null?void 0:e.id)??"";for(const[a,s]of this.directoryButtons)s.dataset.selected=a===t?"true":"false";for(const[a,s]of this.pinElements)s.dataset.selected=a===t?"true":"false"}renderLandmarkDirectory(){var e;this.landmarkListEl.replaceChildren(),this.directoryButtons.clear();const t=this.activeFilter?this.landmarks.filter(a=>`${a.name} ${a.classification} ${a.category} ${a.description}`.toLowerCase().includes(this.activeFilter)):this.landmarks;if(t.length===0){const a=document.createElement("li");a.className="landmark-empty",a.textContent="No matching galactic landmarks.",this.landmarkListEl.appendChild(a);return}for(const a of t){const s=document.createElement("li"),i=document.createElement("button");i.type="button",i.className="landmark-item-btn",i.dataset.landmarkId=a.id,i.dataset.selected=((e=this.selectedLandmark)==null?void 0:e.id)===a.id?"true":"false";const n=document.createElement("span");n.className="landmark-item-name",n.textContent=a.name;const r=document.createElement("span");r.className="landmark-item-dist",r.textContent=a.distanceFromSolLy,i.append(n,r),i.addEventListener("click",()=>this.selectLandmark(a),{signal:this.abortController.signal}),s.appendChild(i),this.landmarkListEl.appendChild(s),this.directoryButtons.set(a.id,i)}}getOrCreatePin(t){const e=this.pinElements.get(t.id);if(e)return e;const a=document.createElement("button");a.type="button",a.className="landmark-pin",a.dataset.landmarkId=t.id,a.dataset.category=t.category,a.hidden=!0;const s=document.createElement("span");return s.textContent=t.name,a.appendChild(s),a.addEventListener("click",()=>this.selectLandmark(t),{signal:this.abortController.signal}),this.overlayEl.appendChild(a),this.pinElements.set(t.id,a),a}syncRangeElement(t,e){const a=this.sliderInputs.get(t);if(!a)return;a.value=String(e),a.style.setProperty("--attr-min",a.min||"0"),a.style.setProperty("--attr-max",a.max||"100"),a.style.setProperty("--control-value",a.value);const s=this.formatSliderValue(t,e);a.setAttribute("aria-valuetext",s.ariaText);const i=this.sliderOutputs.get(t);i&&(i.textContent=s.displayText)}syncSwitchElement(t,e){const a=this.switchInputs.get(t);a&&(a.checked=e)}formatSliderValue(t,e){switch(t){case"timeScaleMyrPerSec":return{displayText:`${e.toFixed(1)} Myr/s`,ariaText:`${e.toFixed(1)} million years per second`};case"exposure":return{displayText:`${e.toFixed(2)} EV`,ariaText:`${e.toFixed(2)} exposure value`};case"bloomIntensity":{const a=Math.round(e*100);return{displayText:`${a}%`,ariaText:`${a} percent bloom intensity`}}case"dustOpacity":{const a=Math.round(e*100);return{displayText:`${a}%`,ariaText:`${a} percent interstellar dust opacity`}}case"nebulaIntensity":{const a=Math.round(e*100);return{displayText:`${a}%`,ariaText:`${a} percent H-II nebula glow`}}}}formatSolDistance(t){return!Number.isFinite(t)||t<0?"-- ly":t<1e3?`${t.toFixed(1)} ly`:t<1e5?`${Math.round(t).toLocaleString("en-US")} ly`:`${(t/1e3).toFixed(1)}k ly`}}const Ne=3261.563777,Ve=100,We={starCountTier:2e6,paused:!1,timeScaleMyrPerSec:1.5,wavelength:"optical",exposure:1.15,bloomIntensity:.75,dustOpacity:1,nebulaIntensity:.85,showLandmarks:!0,autoOrbit:!1,followSol:!1};function Ut(o){return gt(Wt,Ht*o)}function He(){const o=document.getElementById("galaxy-canvas"),t=document.getElementById("hud-root");if(!o||!t)throw new Error("Milky Way Observatory requires #galaxy-canvas and #hud-root elements.");let e={...We},a=0,s=0,i=e.starCountTier,n=0,r=0,c=!1;const l=new ge("overview");let u=null,h=null,f=null;const E={onSettingsChange(m){const x=e.starCountTier;e={...e,...m},m.starCountTier!==void 0&&m.starCountTier!==x&&(i=e.starCountTier,h==null||h.ensureStars(e.starCountTier)),p.syncSettings(e)},onSelectLandmark(m){m.id!=="sol-system"&&e.followSol&&(e={...e,followSol:!1},p.syncSettings(e));const x=Gt(m,a),P=gt(m.cameraOffsetKpc,m.omegaRadPerMyr*a);l.flyTo(x,P)},onCameraPreset(m){m!=="sol"&&e.followSol&&(e={...e,followSol:!1},p.syncSettings(e)),l.setPreset(m),m==="sol"&&l.flyTo(Ut(a))},onResetView(){e.followSol&&(e={...e,followSol:!1},p.syncSettings(e)),l.setPreset("overview")}},p=new ze(t,Et,e,E);try{u=new Ue(o)}catch(m){const x=m instanceof Error?m.message:"WebGL2 HDR initialization failed on this device.";return p.showError(x),()=>{p.dispose()}}const M=()=>{const m=Math.max(1,o.clientWidth||window.innerWidth||1),x=Math.max(1,o.clientHeight||window.innerHeight||1),P=Math.min(2,Math.max(1,window.devicePixelRatio||1));u==null||u.resize(m,x,P),l.setViewport(m,x)};M(),f=l.attachControls(o);const w=()=>M(),b=m=>{m.preventDefault(),cancelAnimationFrame(r),p.showError("WebGL2 GPU context was lost. Reload the page to reinitialize the observatory.")};window.addEventListener("resize",w),o.addEventListener("webglcontextlost",b),h=new ce,u.uploadNebulaClouds(h.getNebulaCloudBuffer(16e3)),h.startGeneration(e.starCountTier,m=>{u==null||u.uploadStarChunk(m)},(m,x)=>{s=m,i=x});let v=null,g=-1/0;const y=m=>{if(c||!u||!h)return;let x=1/60;if(v!==null){const A=(m-v)*.001;if(A>5e-4){if(x=A,x<.5){const I=Math.min(240,1/x);n=n===0?I:n*.88+I*.12}}else x=5e-4}v=m;const P=Math.min(x,.1);e.paused||(a+=P*e.timeScaleMyrPerSec);const S=Ut(a);e.followSol&&l.followPoint(S),l.update(P,e.autoOrbit);const k=u.render(l,e,a,m*.001),U=Math.max(1,o.clientWidth||window.innerWidth||1),O=Math.max(1,o.clientHeight||window.innerHeight||1),K=u.projectLandmarks(Et,l,a,U,O);if(p.updateProjectedLandmarks(K),m-g>=Ve){g=m;const A=l.getEyePosition(),I=h.getLoadedStarCount(),R=e.starCountTier,qt=Math.hypot(A[0]-S[0],A[1]-S[1],A[2]-S[2]),Xt={fps:n,activeStars:k,loadedStars:I||s,targetStars:R||i,loadingProgress:R>0?Math.min(1,I/R):1,simTimeMyr:a,cameraRadiusKpc:Math.hypot(A[0],A[2]),cameraHeightKpc:A[1],cameraDistFromSolLy:qt*Ne,webglBackend:u.getBackendName()};p.updateTelemetry(Xt)}r=requestAnimationFrame(y)};return r=requestAnimationFrame(y),()=>{c||(c=!0,cancelAnimationFrame(r),window.removeEventListener("resize",w),o.removeEventListener("webglcontextlost",b),f==null||f(),l.dispose(),h==null||h.dispose(),u==null||u.dispose(),p.dispose())}}let j=null;function Ft(){j=He()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ft,{once:!0}):Ft();window.addEventListener("pagehide",()=>{j==null||j(),j=null});
