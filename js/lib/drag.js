var t={dragStart:!0},e=(u,c={})=>{let g,f,{bounds:h,axis:p="both",gpuAcceleration:m=!0,legacyTranslate:$=!0,transform:b,applyUserSelectHack:y=!0,disabled:w=!1,ignoreMultitouch:_=!1,recomputeBounds:x=t,grid:v,position:S,cancel:C,handle:D,defaultClass:A="neodrag",defaultClassDragging:B="neodrag-dragging",defaultClassDragged:E="neodrag-dragged",defaultPosition:R={x:0,y:0},onDragStart:I,onDrag:X,onDragEnd:Y,deadzone:N={width:0,height:0},stuck:P=!1}=c,k=!1,q=0,z=0,H=0,T=0,M=0,U=0,{x:W,y:j}=S?{x:S?.x??0,y:S?.y??0}:R;tt(W,j);let L,O,F,G,J,K="",Q=!!S;x={...t,...x};let V=document.body.style,Z=u.classList;function tt(c=q,g=z){if(!b){if($&&!P){let f=`${+c}px, ${+g}px`;return s(u,"transform",m?`translate3d(${f}, 0)`:`translate(${f})`)}return s(u,"translate",`${+c}px ${+g}px ${m?"1px":""}`)}let h=b({offsetX:c,offsetY:g,rootNode:u});r(h)&&s(u,"transform",h)}let te=(c,g)=>{let f={offsetX:q,offsetY:z,rootNode:u,currentNode:J};u.dispatchEvent(new CustomEvent(c,{detail:f})),g?.(f)},tn=addEventListener;tn("pointerdown",tr,!1),tn("pointerup",ti,!1),tn("pointermove",ta,!1),s(u,"touch-action","none");let to=()=>{let c=u.offsetWidth/O.width;return isNaN(c)&&(c=1),c};function tr(c){if(w||2===c.button||_&&!c.isPrimary)return;if(x.dragStart&&(L=a(h,u)),r(D)&&r(C)&&D===C)throw Error("`handle` selector can't be same as `cancel` selector");if(Z.add(A),F=function(u,c){if(!u)return[c];if(d(u))return[u];if(Array.isArray(u))return u;let g=c.querySelectorAll(u);if(null===g)throw Error("Selector passed for `handle` option should be child of the element on which the action is applied");return Array.from(g.values())}(D,u),G=function(u,c){if(!u)return[];if(d(u))return[u];if(Array.isArray(u))return u;let g=c.querySelectorAll(u);if(null===g)throw Error("Selector passed for `cancel` option should be child of the element on which the action is applied");return Array.from(g.values())}(C,u),g=/(both|x)/.test(p),f=/(both|y)/.test(p),i(G,F))throw Error("Element being dragged can't be a child of the element on which `cancel` is applied");let m=c.composedPath()[0];if(!F.some(u=>u.contains(m)||u.shadowRoot?.contains(m))||i(G,[m]))return;J=1===F.length?u:F.find(u=>u.contains(m)),k=!0,O=u.getBoundingClientRect(),y&&(K=V.userSelect,V.userSelect="none"),te("neodrag:start",I);let{clientX:$,clientY:b}=c,v=to();g&&(H=$-W/v),f&&(T=b-j/v),L&&(M=$-O.left,U=b-O.top)}function ti(){k&&(x.dragEnd&&(L=a(h,u)),Z.remove(B),Z.add(E),y&&(V.userSelect=K),te("neodrag:end",Y),g&&(H=q),f&&(T=z),k=!1)}function ta(c){if(!k)return;x.drag&&(L=a(h,u)),Z.add(B),c.preventDefault(),O=u.getBoundingClientRect();let p=c.clientX,m=c.clientY,$=to();if(L){let b={left:L.left+M,top:L.top+U,right:L.right+M-O.width,bottom:L.bottom+U-O.height};p=n(p,b.left,b.right),m=n(m,b.top,b.bottom)}if(Array.isArray(v)){let[y,w]=v;if(isNaN(+y)||y<0)throw Error("1st argument of `grid` must be a valid positive number");if(isNaN(+w)||w<0)throw Error("2nd argument of `grid` must be a valid positive number");let _=p-H,S=m-T;[_,S]=o([y/$,w/$],_,S),p=H+_,m=T+S}let C=parseFloat(getComputedStyle(document.documentElement).fontSize)*N.width,D=parseFloat(getComputedStyle(document.documentElement).fontSize)*N.height,A=window.getComputedStyle(u),E=new WebKitCSSMatrix(A.transform),R=E.m42,I=E.m41,F=c.clientY-R,G=c.clientX-I;if(!(Math.abs(F-T)<D&&Math.abs(G-H)<C)||Q){if(P){te("neodrag:end",Y);return}Q=!0,g&&(q=Math.round((p-H)*$)),f&&(z=Math.round((m-T)*$)),W=q,j=z,te("neodrag",X),tt()}}return{destroy(){let u=removeEventListener;u("pointerdown",tr,!1),u("pointerup",ti,!1),u("pointermove",ta,!1)},update(u){p=u.axis||"both",w=u.disabled??!1,_=u.ignoreMultitouch??!1,D=u.handle,h=u.bounds,x=u.recomputeBounds??t,C=u.cancel,y=u.applyUserSelectHack??!0,v=u.grid,m=u.gpuAcceleration??!0,$=u.legacyTranslate??!0,b=u.transform;let c=Z.contains(E);Z.remove(A,E),A=u.defaultClass??"neodrag",B=u.defaultClassDragging??"neodrag-dragging",E=u.defaultClassDragged??"neodrag-dragged",Z.add(A),c&&Z.add(E),Q&&(W=q=u.position?.x??q,j=z=u.position?.y??z,tt())}}},n=(u,c,g)=>Math.min(Math.max(u,c),g),r=u=>"string"==typeof u,o=([u,c],g,f)=>{let h=(u,c)=>0===c?0:Math.ceil(u/c)*c;return[h(g,u),h(f,c)]},i=(u,c)=>u.some(u=>c.some(c=>u.contains(c)));function a(u,c){if(void 0===u)return;if(d(u))return u.getBoundingClientRect();if("object"==typeof u){let{top:g=0,left:f=0,right:h=0,bottom:p=0}=u;return{top:g,right:window.innerWidth-h,bottom:window.innerHeight-p,left:f}}if("parent"===u)return c.parentNode.getBoundingClientRect();let m=document.querySelector(u);if(null===m)throw Error("The selector provided for bound doesn't exists in the document.");return m.getBoundingClientRect()}var s=(u,c,g)=>u.style.setProperty(c,g),d=u=>u instanceof HTMLElement,l=class{constructor(u,c={}){this.node=u,this._dragInstance=e(u,this._options=c)}_dragInstance;_options={};updateOptions(u){this._dragInstance.update(Object.assign(this._options,u))}set options(u){this._dragInstance.update(this._options=u)}get options(){return this._options}destroy(){this._dragInstance.destroy()}};export default null;export{l as Draggable};