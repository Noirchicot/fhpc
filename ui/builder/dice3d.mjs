/* ══ LE PLATEAU DE DÉS 3D — COPIE PORTÉE, PAS RÉÉCRITURE ═══════════════
   Source : `fh-phb`, `docs/javascripts/fh-static-dice.js`, commit
   `07b2d80e29019de3c136f6fcde973712abd4536b` (2026-08-04). Empreinte du
   fichier d'origine : `c900b146984ae014881d4a6d403de311ae12f16e…`.

   ⭐ POURQUOI UNE COPIE ET PAS UNE RÉÉCRITURE. Eric a validé ce rendu à
   l'œil — « polygon rendering, material, lighting, proportions, perspective
   and stationary rolling mechanic » (`Static Dice Tray`, vault, 2026-07-29).
   Une réécriture jetterait cette validation. Le corps est donc repris
   VERBATIM, et l'écart avec l'amont tient en DEUX gestes, tous deux notés :

   1. `import.meta.url` remplace l'accès au script courant pour trouver les
      sons (voir le commentaire PORTAGE, plus bas) — un module ES n'a pas de
      `<script>` courant ;
   2. l'objet global posé sur `window` devient des exports nommés (en bas).

   ⛔ NE RETOUCHE PAS LE CORPS. Si un défaut de rendu apparaît, il se corrige
   EN AMONT dans `fh-phb`, et on recopie. Deux copies qui divergent, c'est la
   faute que la loi du dépôt nomme, et ici elle coûterait la validation d'Eric.

   📌 CE QUI EST PORTÉ ET QU'AUCUN ÉCRAN N'APPELLE AUJOURD'HUI : les
   géométries d4/d8/d10/d12/d20/d100, les douze matières, et « la vague »
   (`data-wave`, le tirage par rangées qui contourne le plafond de ~16
   contextes WebGL). Elles ne coûtent rien : `geometryFor` ne construit que
   la forme demandée, et la vague ne s'arme que si `data-wave` est posé —
   ce que l'écran Abilities ne fait pas (trois dés en place, pas trente).
   ⚠️ C'est une exception ASSUMÉE à la règle « rien qu'un écran ne demande
   aujourd'hui » (SOCLE.md) : elle vaut pour le socle, qu'on écrit ; pas pour
   un composant validé qu'on recopie entier plutôt que de le disséquer.

   ══ COMMENT ON S'EN SERT ═══════════════════════════════════════════════
   L'interface est DÉCLARATIVE, par le DOM — c'est ce qui la rend compatible
   avec la loi « pas de mini-framework ». On pose un hôte, on appelle
   `mount(scope)` :

     <div class="fh-cd-static-die"
          data-sides="6" data-result="4" data-material="ivory"
          data-animate="1" data-index="0"></div>

   `data-animate="1"` anime (960 ms) ; sans lui, le dé prend la pose du
   résultat. `data-index` décale le départ de 42 ms par dé, pour que trois
   dés ne tombent pas à l'unisson. Le résultat est RÉSOLU AVANT l'animation :
   le hasard appartient à l'appelant, jamais à ce fichier. */


  var SUPPORTED_SIDES = [4,6,8,10,12,20,100];
  var MATERIALS = {
    ivory:{fill:"#f3ead6",light:"#fffaf0",dark:"#c6b78f",rim:"#76551e",num:"#58180d"},
    gold:{fill:"#d9b25e",light:"#f3d98c",dark:"#97701d",rim:"#62420c",num:"#3a2606"},
    green:{fill:"#3d7d56",light:"#72aa83",dark:"#193d27",rim:"#10271a",num:"#f2ead2"},
    crit:{fill:"#f0c550",light:"#ffe49b",dark:"#b87918",rim:"#62420c",num:"#3a2606"},
    fumble:{fill:"#b51d25",light:"#e35559",dark:"#600c12",rim:"#41090d",num:"#fff0ee"},
    chaos:{fill:"#8f1118",light:"#d02d35",dark:"#350306",rim:"#ff6c73",num:"#fff0ee"},
    crimson:{fill:"#93303a",light:"#c05a63",dark:"#51121b",rim:"#3d0c13",num:"#ffeceb"},
    azure:{fill:"#2f5f86",light:"#6596bb",dark:"#12334d",rim:"#0d2334",num:"#eef6fd"},
    violet:{fill:"#5c3d7e",light:"#906db0",dark:"#301a42",rim:"#1d1029",num:"#f5edff"},
    slate:{fill:"#4a4f55",light:"#7b828a",dark:"#25292e",rim:"#171a1d",num:"#f0f2f4"},
    white:{fill:"#fbf8f1",light:"#ffffff",dark:"#d9cfb9",rim:"#8b7546",num:"#5a4a2a"},
    // The plain-bonus tint (Eric, ratified 2026-08-03: "bonus lambda gris clair").
    ash:{fill:"#c9cdd2",light:"#eceef1",dark:"#9aa0a8",rim:"#6b7178",num:"#3a3f45"}
  };
  var geometryCache = {};
  var soundMuted = readStoredMute();
  var soundVolume=.55,soundCursor=0,activeSounds=[];
  var ROLL_DURATION_MS=960;
  var SOUND_SAMPLES = [
    {file:"dice-throw-1.mp3",duration:.574694},
    {file:"dice-throw-2.mp3",duration:.679184},
    {file:"dice-throw-3.mp3",duration:.783673},
    {file:"die-throw-3.mp3",duration:.626939}
  ];
  /* PORTAGE — le <script> courant n'existe pas pour un module ES : la
     propriete `currentScript` du document y vaut toujours `null`, elle ne
     designe que les scripts classiques. `import.meta.url` est l'adresse du
     module lui-meme, donc l'equivalent exact — et il ne depend plus du
     chemin `/javascripts/` du site MkDocs d'ou ce fichier vient. */
  var soundBase=new URL("./assets/audio/dice/",import.meta.url).href;

  function readStoredMute(){
    try{return Boolean(window.localStorage&&window.localStorage.getItem("fh-static-dice-muted")==="1");}
    catch(error){return false;}
  }
  function setSoundMuted(muted){
    soundMuted=Boolean(muted);
    if(soundMuted){
      activeSounds.forEach(function(audio){try{audio.pause();}catch(error){}});
      activeSounds=[];
    }
    try{if(window.localStorage)window.localStorage.setItem("fh-static-dice-muted",soundMuted?"1":"0");}
    catch(error){}
    return soundMuted;
  }
  function setSoundVolume(volume){
    soundVolume=Math.max(0,Math.min(1,Number(volume)||0));
    return soundVolume;
  }
  function playRollSound(sides,index){
    if(soundMuted||typeof window.Audio!=="function")return false;
    var sample=SOUND_SAMPLES[soundCursor++%SOUND_SAMPLES.length],audio;
    try{audio=new window.Audio(soundBase+sample.file);}
    catch(error){return false;}
    audio.preload="auto";
    audio.volume=soundVolume;
    audio.playbackRate=sample.duration/(ROLL_DURATION_MS/1000);
    /* Browsers that support pitch preservation can lengthen these short,
       recorded throws to the approved 960 ms roll without lowering pitch. */
    audio.preservesPitch=true;
    audio.webkitPreservesPitch=true;
    audio.mozPreservesPitch=true;
    audio.onended=function(){activeSounds=activeSounds.filter(function(item){return item!==audio;});};
    activeSounds.push(audio);
    function begin(){
      try{
        var playback=audio.play();
        if(playback&&playback.catch)playback.catch(function(){});
      }catch(error){}
    }
    var delay=Math.max(0,Number(index)||0)*42;
    if(delay&&typeof window.setTimeout==="function")window.setTimeout(begin,delay);
    else begin();
    return true;
  }

  function hexRgb(hex) {
    var value=parseInt(String(hex||"#ffffff").replace("#",""),16);
    return [((value>>16)&255)/255,((value>>8)&255)/255,(value&255)/255];
  }
  function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
  function scaleVector(v,amount){return [v[0]*amount,v[1]*amount,v[2]*amount];}
  function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function length(v){return Math.sqrt(dot(v,v));}
  function normalize(v){var amount=length(v)||1;return [v[0]/amount,v[1]/amount,v[2]/amount];}
  function subtract(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function centreOf(points){
    var sum=points.reduce(function(total,point){return add(total,point);},[0,0,0]);
    return scaleVector(sum,1/points.length);
  }
  function quaternionNormalize(q){var amount=Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3])||1;return [q[0]/amount,q[1]/amount,q[2]/amount,q[3]/amount];}
  function quaternionMultiply(a,b){
    return [
      a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
      a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
      a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
      a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]
    ];
  }
  function quaternionAxis(axis,angle){
    var unit=normalize(axis),half=angle*.5,sine=Math.sin(half);
    return [unit[0]*sine,unit[1]*sine,unit[2]*sine,Math.cos(half)];
  }
  function quaternionBetween(from,to){
    var a=normalize(from),b=normalize(to),cosine=dot(a,b);
    if(cosine<-0.999999){
      var fallback=Math.abs(a[0])<.8?cross(a,[1,0,0]):cross(a,[0,1,0]);
      return quaternionAxis(fallback,Math.PI);
    }
    var axis=cross(a,b);
    return quaternionNormalize([axis[0],axis[1],axis[2],1+cosine]);
  }
  function quaternionMatrix(q){
    q=quaternionNormalize(q);
    var x=q[0],y=q[1],z=q[2],w=q[3],xx=x*x,yy=y*y,zz=z*z,xy=x*y,xz=x*z,yz=y*z,wx=w*x,wy=w*y,wz=w*z;
    return new Float32Array([
      1-2*(yy+zz),2*(xy+wz),2*(xz-wy),
      2*(xy-wz),1-2*(xx+zz),2*(yz+wx),
      2*(xz+wy),2*(yz-wx),1-2*(xx+yy)
    ]);
  }
  function quaternionRotate(q,v){
    q=quaternionNormalize(q);
    var vector=[q[0],q[1],q[2]],scalar=q[3];
    return add(add(scaleVector(vector,2*dot(vector,v)),scaleVector(v,scalar*scalar-dot(vector,vector))),scaleVector(cross(vector,v),2*scalar));
  }
  function pushVertex(store,position,normal){
    store.positions.push(position[0],position[1],position[2]);
    store.normals.push(normal[0],normal[1],normal[2]);
  }
  function pushFlatTriangle(store,a,b,c,normal){
    pushVertex(store,a,normal);pushVertex(store,b,normal);pushVertex(store,c,normal);
  }
  function pushSmoothTriangle(store,a,b,c){
    var orientation=cross(subtract(b.position,a.position),subtract(c.position,a.position));
    if(dot(orientation,centreOf([a.position,b.position,c.position]))<0){var swap=b;b=c;c=swap;}
    pushVertex(store,a.position,a.normal);pushVertex(store,b.position,b.normal);pushVertex(store,c.position,c.normal);
  }
  function pushEdge(store,a,b){store.edges.push(a[0],a[1],a[2],b[0],b[1],b[2]);}

  function polygonGeometry(vertices,faces){
    var store={positions:[],normals:[],edges:[],faceNormals:[],faceUps:[]},seen={};
    faces.forEach(function(originalFace){
      var face=originalFace.slice(),upAnchor=vertices[originalFace[0]],points=face.map(function(index){return vertices[index];});
      var normal=normalize(cross(subtract(points[1],points[0]),subtract(points[2],points[0])));
      if(dot(normal,centreOf(points))<0){
        face.reverse();points=face.map(function(index){return vertices[index];});
        normal=normalize(cross(subtract(points[1],points[0]),subtract(points[2],points[0])));
      }
      store.faceNormals.push(normal);
      store.faceUps.push(normalize(subtract(upAnchor,centreOf(points))));
      for(var triangle=1;triangle<points.length-1;triangle++)pushFlatTriangle(store,points[0],points[triangle],points[triangle+1],normal);
      for(var edge=0;edge<face.length;edge++){
        var a=face[edge],b=face[(edge+1)%face.length],key=Math.min(a,b)+":"+Math.max(a,b);
        if(!seen[key]){seen[key]=true;pushEdge(store,vertices[a],vertices[b]);}
      }
    });
    return store;
  }

  /* Find the planar hull faces of a small, centred convex polyhedron. This
     keeps the source readable for solids such as the d12's dodecahedron. */
  function convexFaces(vertices){
    var epsilon=.00001,faces=[],seen={};
    for(var a=0;a<vertices.length-2;a++)for(var b=a+1;b<vertices.length-1;b++)for(var c=b+1;c<vertices.length;c++){
      var raw=cross(subtract(vertices[b],vertices[a]),subtract(vertices[c],vertices[a]));
      if(length(raw)<epsilon)continue;
      var normal=normalize(raw),distance=dot(normal,vertices[a]),positive=false,negative=false;
      vertices.forEach(function(vertex){
        var side=dot(normal,vertex)-distance;
        if(side>epsilon)positive=true;if(side<-epsilon)negative=true;
      });
      if(positive&&negative)continue;
      var indices=[];
      vertices.forEach(function(vertex,index){if(Math.abs(dot(normal,vertex)-distance)<epsilon)indices.push(index);});
      if(indices.length<3)continue;
      var key=indices.slice().sort(function(x,y){return x-y;}).join(":");
      if(seen[key])continue;seen[key]=true;
      var faceCentre=centreOf(indices.map(function(index){return vertices[index];}));
      if(dot(normal,faceCentre)<0)normal=scaleVector(normal,-1);
      var basisU=normalize(subtract(vertices[indices[0]],faceCentre)),basisV=cross(normal,basisU);
      indices.sort(function(left,right){
        var l=subtract(vertices[left],faceCentre),r=subtract(vertices[right],faceCentre);
        return Math.atan2(dot(l,basisV),dot(l,basisU))-Math.atan2(dot(r,basisV),dot(r,basisU));
      });
      faces.push(indices);
    }
    return faces;
  }

  function cubeGeometry(){
    var size=.72,vertices=[
      [-size,-size,-size],[size,-size,-size],[size,size,-size],[-size,size,-size],
      [-size,-size,size],[size,-size,size],[size,size,size],[-size,size,size]
    ];
    var store=polygonGeometry(vertices,[
      [4,5,6,7],[1,0,3,2],[5,1,2,6],
      [0,4,7,3],[7,6,2,3],[0,1,5,4]
    ]);
    store.faceUps=[[0,1,0],[0,1,0],[0,0,1],[0,0,1],[1,0,0],[1,0,0]];
    return store;
  }

  function roundedCubeGeometry(){
    var outer=.76,radius=.16,core=outer-radius,steps=8;
    var store={positions:[],normals:[],edges:[],faceNormals:[],faceUps:[]};
    var faces=[
      {normal:[0,0,1],u:[1,0,0],v:[0,1,0]},
      {normal:[0,0,-1],u:[-1,0,0],v:[0,1,0]},
      {normal:[1,0,0],u:[0,1,0],v:[0,0,1]},
      {normal:[-1,0,0],u:[0,-1,0],v:[0,0,1]},
      {normal:[0,1,0],u:[0,0,1],v:[1,0,0]},
      {normal:[0,-1,0],u:[0,0,-1],v:[1,0,0]}
    ];
    function surfacePoint(face,u,v){
      var raw=add(scaleVector(face.normal,outer),add(scaleVector(face.u,u),scaleVector(face.v,v)));
      var clamped=raw.map(function(value){return Math.max(-core,Math.min(core,value));});
      var delta=subtract(raw,clamped),normal=normalize(delta);
      return {position:add(clamped,scaleVector(normal,radius)),normal:normal};
    }
    faces.forEach(function(face){
      store.faceNormals.push(face.normal);
      store.faceUps.push(face.v);
      for(var row=0;row<steps;row++)for(var column=0;column<steps;column++){
        var u0=-outer+2*outer*column/steps,u1=-outer+2*outer*(column+1)/steps;
        var v0=-outer+2*outer*row/steps,v1=-outer+2*outer*(row+1)/steps;
        var p00=surfacePoint(face,u0,v0),p10=surfacePoint(face,u1,v0),p11=surfacePoint(face,u1,v1),p01=surfacePoint(face,u0,v1);
        pushSmoothTriangle(store,p00,p10,p11);pushSmoothTriangle(store,p00,p11,p01);
      }
      var corners=[[-core,-core],[core,-core],[core,core],[-core,core]];
      corners.forEach(function(corner,index){
        var next=corners[(index+1)%corners.length];
        pushEdge(store,surfacePoint(face,corner[0],corner[1]).position,surfacePoint(face,next[0],next[1]).position);
      });
    });
    return store;
  }
  function tetrahedronGeometry(){
    var vertices=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]].map(function(vertex){return scaleVector(normalize(vertex),.88);});
    return polygonGeometry(vertices,[[0,1,2],[0,3,1],[0,2,3],[1,3,2]]);
  }
  function octahedronGeometry(){
    var vertices=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(function(vertex){return scaleVector(vertex,.91);});
    return polygonGeometry(vertices,convexFaces(vertices));
  }
  function trapezohedronGeometry(){
    /* A real d10 is a pentagonal trapezohedron: ten kites around a broad
       equator. Keeping the poles lower avoids the stretched-d8 silhouette. */
    var pole=.70,radius=.84,ringHeight=pole/9.472135955;
    var vertices=[[0,0,pole],[0,0,-pole]];
    for(var i=0;i<5;i++)vertices.push([Math.cos(i*Math.PI*2/5)*radius,Math.sin(i*Math.PI*2/5)*radius,ringHeight]);
    for(var j=0;j<5;j++)vertices.push([Math.cos((j+.5)*Math.PI*2/5)*radius,Math.sin((j+.5)*Math.PI*2/5)*radius,-ringHeight]);
    var faces=[];
    for(var face=0;face<5;face++){
      var upper=2+face,nextUpper=2+(face+1)%5,lower=7+face,nextLower=7+(face+1)%5;
      faces.push([0,upper,lower,nextUpper]);
      faces.push([1,lower,nextUpper,nextLower]);
    }
    return polygonGeometry(vertices,faces);
  }
  function dodecahedronGeometry(){
    var phi=(1+Math.sqrt(5))/2,inverse=1/phi,raw=[];
    [-1,1].forEach(function(x){[-1,1].forEach(function(y){[-1,1].forEach(function(z){raw.push([x,y,z]);});});});
    [-1,1].forEach(function(a){[-1,1].forEach(function(b){
      raw.push([0,a*inverse,b*phi]);raw.push([a*inverse,b*phi,0]);raw.push([a*phi,0,b*inverse]);
    });});
    var vertices=raw.map(function(vertex){return scaleVector(vertex,.89/Math.sqrt(3));});
    return polygonGeometry(vertices,convexFaces(vertices));
  }
  function icosahedronGeometry(){
    var phi=(1+Math.sqrt(5))/2;
    var vertices=[
      [-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],
      [0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],
      [phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]
    ].map(function(vertex){return scaleVector(normalize(vertex),.89);});
    var faces=[
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    return polygonGeometry(vertices,faces);
  }
  function geometryFor(sides){
    sides=Number(sides);
    if(!geometryCache[sides]){
      if(sides===4)geometryCache[sides]=tetrahedronGeometry();
      else if(sides===6)geometryCache[sides]=cubeGeometry();
      else if(sides===8)geometryCache[sides]=octahedronGeometry();
      else if(sides===10||sides===100)geometryCache[sides]=trapezohedronGeometry();
      else if(sides===12)geometryCache[sides]=dodecahedronGeometry();
      else geometryCache[sides]=icosahedronGeometry();
    }
    return geometryCache[sides];
  }
  function shader(gl,type,source){
    var item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);
    if(!gl.getShaderParameter(item,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(item)||"Dice shader failed");
    return item;
  }
  function program(gl,vertexSource,fragmentSource){
    var item=gl.createProgram();
    gl.attachShader(item,shader(gl,gl.VERTEX_SHADER,vertexSource));
    gl.attachShader(item,shader(gl,gl.FRAGMENT_SHADER,fragmentSource));
    gl.linkProgram(item);
    if(!gl.getProgramParameter(item,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(item)||"Dice program failed");
    return item;
  }
  function buffer(gl,data){
    /* bindBuffer takes (target, buffer), not (gl, target, buffer). Same bug,
       same place, third time on this branch (fixed on the audit branch at
       9f8fd76 for V1, again at 4e8cbd7 for V2; V3 was written fresh from
       64237e6 again and reintroduced it a third time). Throws a TypeError on
       the first draw call, silently caught in mountDie, every die falls back
       to SVG -- undetectable by the Node/linkedom test suite, which has no
       WebGL context. */
    var item=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,item);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return item;
  }
  var MESH_VERTEX_SRC="attribute vec3 aPosition;attribute vec3 aNormal;uniform mat3 uRotation;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 p=uRotation*aPosition;float depth=1.0+p.z*.10;vNormal=normalize(uRotation*aNormal);vPosition=p;gl_Position=vec4(p.xy*.89*depth,-p.z*.22,1.0);}";
  var MESH_FRAGMENT_SRC="precision mediump float;uniform vec3 uFill;uniform vec3 uLight;uniform vec3 uDark;varying vec3 vNormal;varying vec3 vPosition;void main(){vec3 n=normalize(vNormal);vec3 key=normalize(vec3(-.48,.72,1.0));vec3 fillLight=normalize(vec3(.68,-.28,.52));vec3 view=vec3(0.0,0.0,1.0);float diffuse=max(dot(n,key),0.0);float bounce=max(dot(n,fillLight),0.0);float shade=clamp(.16+.68*diffuse+.16*bounce,0.0,1.0);float specular=pow(max(dot(n,normalize(key+view)),0.0),28.0);float fresnel=pow(1.0-max(dot(n,view),0.0),3.0);vec3 colour=mix(uDark,uFill,shade);colour=mix(colour,uLight,clamp(specular*.32+fresnel*.075,0.0,.38));gl_FragColor=vec4(colour,1.0);}";
  var LINE_VERTEX_SRC="attribute vec3 aPosition;uniform mat3 uRotation;void main(){vec3 p=uRotation*aPosition;float depth=1.0+p.z*.10;gl_Position=vec4(p.xy*.89*depth,-p.z*.22-.001,1.0);}";
  var LINE_FRAGMENT_SRC="precision mediump float;uniform vec3 uRim;void main(){gl_FragColor=vec4(uRim,1.0);}";
  function prepareRenderer(canvas,sides,materialName,sizePx){
    var gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true});
    if(!gl)throw new Error("WebGL unavailable");
    var geo=geometryFor(sides),material=MATERIALS[materialName]||MATERIALS.ivory;
    var meshProgram=program(gl,MESH_VERTEX_SRC,MESH_FRAGMENT_SRC);
    var lineProgram=program(gl,LINE_VERTEX_SRC,LINE_FRAGMENT_SRC);
    var positionBuffer=buffer(gl,geo.positions),normalBuffer=buffer(gl,geo.normals),edgeBuffer=buffer(gl,geo.edges);
    /* canvas (and, for the d100 pair, its .fh-cd-static-die-part parent) are
       both display:none until is-webgl reveals them, which only happens
       AFTER this function returns -- so getBoundingClientRect() is always
       0x0 here and every die silently got the ||52 fallback regardless of
       its real size. Worse for d100 than for a single die: measuring
       canvas.parentElement doesn't help there either, because the part
       wrapper is the hidden element. The caller already knows the true
       target size (it built the inline --fh-static-die-size style), so it
       is passed straight through instead of re-derived from layout. */
    var pixelRatio=Math.max(1,Math.min(2,window.devicePixelRatio||1)),size=Math.max(32,Math.round(sizePx||canvas.getBoundingClientRect().width||52));
    canvas.width=Math.round(size*pixelRatio);canvas.height=Math.round(size*pixelRatio);
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
    gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
    if(gl.POLYGON_OFFSET_FILL!=null&&gl.polygonOffset){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);}
    if(gl.lineWidth)gl.lineWidth(Math.max(1,pixelRatio));
    function attribute(programObject,name,item,sizeValue){
      var location=gl.getAttribLocation(programObject,name);gl.bindBuffer(gl.ARRAY_BUFFER,item);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,sizeValue,gl.FLOAT,false,0,0);
    }
    return {
      geo:geo,
      draw:function(rotation){
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
        gl.useProgram(meshProgram);
        attribute(meshProgram,"aPosition",positionBuffer,3);attribute(meshProgram,"aNormal",normalBuffer,3);
        gl.uniformMatrix3fv(gl.getUniformLocation(meshProgram,"uRotation"),false,rotation);
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uFill"),hexRgb(material.fill));
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uLight"),hexRgb(material.light));
        gl.uniform3fv(gl.getUniformLocation(meshProgram,"uDark"),hexRgb(material.dark));
        gl.drawArrays(gl.TRIANGLES,0,geo.positions.length/3);
        gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);
        gl.useProgram(lineProgram);attribute(lineProgram,"aPosition",edgeBuffer,3);
        gl.uniformMatrix3fv(gl.getUniformLocation(lineProgram,"uRotation"),false,rotation);
        gl.uniform3fv(gl.getUniformLocation(lineProgram,"uRim"),hexRgb(material.rim));
        gl.drawArrays(gl.LINES,0,geo.edges.length/3);
      }
    };
  }
  function faceRotation(geo,faceIndex,renderSides){
    var target=normalize(Number(renderSides)===6?[0,.28,1]:[0,-.12,1]),normal=geo.faceNormals[faceIndex]||[0,0,1];
    var base=quaternionBetween(normal,target),up=geo.faceUps[faceIndex]||[0,1,0],rotatedUp=quaternionRotate(base,up);
    var roll=quaternionAxis(target,Math.PI*.5-Math.atan2(rotatedUp[1],rotatedUp[0]));
    return quaternionMultiply(roll,base);
  }
  /* Picker buttons (Destiny row, white-dice console row) want the same
     shapes as the tray but never a live context: browsers cap simultaneous
     WebGL contexts (~16 in Chrome), and the tray alone can already reach 7
     (6 dice, d100=2 canvases). One shared temporary canvas renders every
     picker image a render pass needs into a cache, then the caller releases
     its context explicitly -- see releasePickerContext below -- instead of
     leaving that to the garbage collector's unpredictable timing. */
  var pickerCache={},pickerGenerator=null;
  function pickerAttribute(gl,programObject,name,item,sizeValue){
    var location=gl.getAttribLocation(programObject,name);
    gl.bindBuffer(gl.ARRAY_BUFFER,item);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,sizeValue,gl.FLOAT,false,0,0);
  }
  function drawPickerShape(gl,programs,geo,material,rotation,viewportRect){
    gl.viewport(viewportRect[0],viewportRect[1],viewportRect[2],viewportRect[3]);
    var positionBuffer=buffer(gl,geo.positions),normalBuffer=buffer(gl,geo.normals),edgeBuffer=buffer(gl,geo.edges);
    gl.useProgram(programs.mesh);
    pickerAttribute(gl,programs.mesh,"aPosition",positionBuffer,3);pickerAttribute(gl,programs.mesh,"aNormal",normalBuffer,3);
    gl.uniformMatrix3fv(gl.getUniformLocation(programs.mesh,"uRotation"),false,rotation);
    gl.uniform3fv(gl.getUniformLocation(programs.mesh,"uFill"),hexRgb(material.fill));
    gl.uniform3fv(gl.getUniformLocation(programs.mesh,"uLight"),hexRgb(material.light));
    gl.uniform3fv(gl.getUniformLocation(programs.mesh,"uDark"),hexRgb(material.dark));
    gl.drawArrays(gl.TRIANGLES,0,geo.positions.length/3);
    gl.useProgram(programs.line);pickerAttribute(gl,programs.line,"aPosition",edgeBuffer,3);
    gl.uniformMatrix3fv(gl.getUniformLocation(programs.line,"uRotation"),false,rotation);
    gl.uniform3fv(gl.getUniformLocation(programs.line,"uRim"),hexRgb(material.rim));
    gl.drawArrays(gl.LINES,0,geo.edges.length/3);
  }
  /* Releases the shared generator context. Callers invoke this once at the
     end of a render pass (after every pickerImage call it needed has run),
     not on a timer -- the generation phase has a clear end, the caller
     knows it. A no-op once nothing is left to release. */
  function releasePickerContext(){
    if(!pickerGenerator)return false;
    var canvas=pickerGenerator.canvas;
    pickerGenerator=null;
    try{
      var gl=canvas.getContext("webgl");
      var ext=gl&&gl.getExtension&&gl.getExtension("WEBGL_lose_context");
      if(ext&&ext.loseContext){ext.loseContext();return true;}
    }catch(error){}
    return false;
  }
  function pickerImage(sides,materialName,sizePx){
    sides=Number(sides);
    if(SUPPORTED_SIDES.indexOf(sides)<0)return null;
    materialName=materialName||"ivory";
    var pixelRatio=Math.max(1,Math.min(2,(typeof window!=="undefined"&&window.devicePixelRatio)||1));
    var size=Math.max(16,Math.round(sizePx||26));
    var key=sides+"|"+materialName+"|"+size+"|"+pixelRatio+"|ready";
    if(pickerCache[key])return pickerCache[key];
    if(!pickerGenerator){
      if(typeof document==="undefined"||!document.createElement)return null;
      pickerGenerator={canvas:document.createElement("canvas")};
    }
    var canvas=pickerGenerator.canvas,dataUrl=null;
    try{
      var gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true});
      if(!gl)throw new Error("WebGL unavailable");
      var full=Math.round(size*pixelRatio);
      canvas.width=full;canvas.height=full;
      gl.clearColor(0,0,0,0);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
      gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
      if(gl.POLYGON_OFFSET_FILL!=null&&gl.polygonOffset){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);}
      if(gl.lineWidth)gl.lineWidth(Math.max(1,pixelRatio));
      gl.viewport(0,0,full,full);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      var programs={mesh:program(gl,MESH_VERTEX_SRC,MESH_FRAGMENT_SRC),line:program(gl,LINE_VERTEX_SRC,LINE_FRAGMENT_SRC)};
      var material=MATERIALS[materialName]||MATERIALS.ivory;
      if(sides===100){
        /* Each half keeps a SQUARE viewport (matching every other shape's
           projection, which assumes square pixels) and only the pair's
           horizontal placement overlaps -- a non-square viewport here would
           stretch the geometry instead of just repositioning it.
           At .58 the two silhouettes just touch: the drawn shape spans
           part*.89, the centres sit (full-part) apart, so the pair reads as
           two dice resting against each other rather than one blob or two
           strangers. The depth buffer is cleared between them so the right
           die sits cleanly in front instead of z-fighting its twin in the
           overlap, which is what made the seam look notched. */
        var geo=geometryFor(10),part=Math.round(full*.58),vOffset=Math.round((full-part)/2),inset=full-part;
        var rotation=quaternionMatrix(faceRotation(geo,0,10));
        drawPickerShape(gl,programs,geo,material,rotation,[0,vOffset,part,part]);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        drawPickerShape(gl,programs,geo,material,rotation,[inset,vOffset,part,part]);
      }else{
        var geo=geometryFor(sides);
        var rotation=quaternionMatrix(faceRotation(geo,0,sides));
        drawPickerShape(gl,programs,geo,material,rotation,[0,0,full,full]);
      }
      dataUrl=canvas.toDataURL("image/png");
    }catch(error){dataUrl=null;}
    if(!dataUrl)return null;
    pickerCache[key]=dataUrl;
    return dataUrl;
  }
  function displayValue(sides,result){
    return Number(sides)===10&&Number(result)===10?"0":String(result);
  }
  /* A settled die as a bitmap: the same mesh, the same pose the live canvas
     would settle into, drawn once through the picker's shared generator and
     cached. This is what the Dice Tray's Static Area uses (rolls 5-10): a
     zone that can hold six lines of dice must not hold six lines of WebGL
     contexts -- the ~16-context browser cap is the whole reason pickerImage
     exists, and the Static Area is the same problem wearing a result. */
  function resultImage(sides,result,materialName,sizePx){
    sides=Number(sides);
    if(SUPPORTED_SIDES.indexOf(sides)<0)return null;
    materialName=materialName||"ivory";
    result=Math.max(1,Math.min(sides,Number(result)||1));
    var pixelRatio=Math.max(1,Math.min(2,(typeof window!=="undefined"&&window.devicePixelRatio)||1));
    var size=Math.max(16,Math.round(sizePx||26));
    var key=sides+"|"+materialName+"|"+size+"|"+pixelRatio+"|r"+result;
    if(pickerCache[key])return pickerCache[key];
    if(!pickerGenerator){
      if(typeof document==="undefined"||!document.createElement)return null;
      pickerGenerator={canvas:document.createElement("canvas")};
    }
    var canvas=pickerGenerator.canvas,dataUrl=null;
    try{
      var gl=canvas.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true});
      if(!gl)throw new Error("WebGL unavailable");
      var full=Math.round(size*pixelRatio);
      canvas.width=full;canvas.height=full;
      gl.clearColor(0,0,0,0);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
      gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);gl.cullFace(gl.BACK);gl.disable(gl.BLEND);
      if(gl.POLYGON_OFFSET_FILL!=null&&gl.polygonOffset){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);}
      if(gl.lineWidth)gl.lineWidth(Math.max(1,pixelRatio));
      gl.viewport(0,0,full,full);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      var programs={mesh:program(gl,MESH_VERTEX_SRC,MESH_FRAGMENT_SRC),line:program(gl,LINE_VERTEX_SRC,LINE_FRAGMENT_SRC)};
      var material=MATERIALS[materialName]||MATERIALS.ivory;
      if(sides===100){
        // Same paired layout as pickerImage, but each half wears its digit's face.
        var geo=geometryFor(10),part=Math.round(full*.58),vOffset=Math.round((full-part)/2),inset=full-part;
        var percentile=result===100?"00":String(result).padStart(2,"0");
        var tensDigit=Number(percentile.charAt(0)),unitDigit=Number(percentile.charAt(1));
        drawPickerShape(gl,programs,geo,material,quaternionMatrix(faceRotation(geo,tensDigit===0?9:tensDigit-1,10)),[0,vOffset,part,part]);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        drawPickerShape(gl,programs,geo,material,quaternionMatrix(faceRotation(geo,unitDigit===0?9:unitDigit-1,10)),[inset,vOffset,part,part]);
      }else{
        var solid=geometryFor(sides);
        var rotation=quaternionMatrix(faceRotation(solid,(result-1)%solid.faceNormals.length,sides));
        drawPickerShape(gl,programs,solid,material,rotation,[0,0,full,full]);
      }
      dataUrl=canvas.toDataURL("image/png");
    }catch(error){dataUrl=null;}
    if(!dataUrl)return null;
    pickerCache[key]=dataUrl;
    return dataUrl;
  }
  function animatePart(host,canvas,number,renderSides,faceIndex,seedResult,sequenceIndex,materialName,animate,sizePx){
    var renderer;
    try{renderer=prepareRenderer(canvas,renderSides,materialName,sizePx);}
    catch(error){return false;}
    number.style.color=(MATERIALS[materialName]||MATERIALS.ivory).num;
    var finalRotation=faceRotation(renderer.geo,faceIndex,renderSides);
    var startRotation=faceRotation(renderer.geo,0,renderSides);
    var duration=ROLL_DURATION_MS,delay=animate?sequenceIndex*42:0,start=null;
    function drawFrame(now){
      if(!canvas.isConnected)return;
      if(start===null)start=now+delay;
      var elapsed=now-start;
      if(elapsed<0){renderer.draw(quaternionMatrix(startRotation));requestAnimationFrame(drawFrame);return;}
      var progress=animate?Math.max(0,Math.min(1,elapsed/duration)):1;
      var eased=1-Math.pow(1-progress,3),remaining=1-eased;
      var seed=(seedResult*17+sequenceIndex*11+renderSides)%23;
      var qx=quaternionAxis([1,.22,.08],remaining*Math.PI*2*(2.75+(seed%5)*.18));
      var qy=quaternionAxis([.12,1,.31],remaining*Math.PI*2*(2.35+(seed%7)*.14));
      var qz=quaternionAxis([.05,.18,1],remaining*Math.PI*2*(.35+(seed%3)*.11));
      var rotation=quaternionMultiply(qz,quaternionMultiply(qy,quaternionMultiply(qx,finalRotation)));
      renderer.draw(quaternionMatrix(rotation));
      /* The number waits for the die to stop. It used to fade in at 72% of
         the roll, while the die was still turning; Eric asked for the result
         to arrive after the dice have rolled, not during. */
      if(progress<1)requestAnimationFrame(drawFrame);
      else host.classList.add("is-settled");
    }
    requestAnimationFrame(drawFrame);
    return true;
  }
  /* The snapshot path: no live context, ever. The host swaps its canvas for
     a cached bitmap of the settled pose and shows the numeral immediately --
     dice never animate in the Static Area, so nothing here is lost. Falls
     back to the SVG face (returns false) exactly like a failed context. */
  function mountSnapshot(host,sides,result,materialName,pending,hostSizePx){
    var canvas=host.querySelector("canvas"),number=host.querySelector(".fh-cd-static-die-result");
    if(!canvas||!number)return false;
    var dataUrl=resultImage(sides,pending?1:result,materialName,hostSizePx);
    if(!dataUrl)return false;
    var image=host.querySelector("img.fh-cd-static-snap");
    if(!image){
      image=document.createElement("img");
      image.className="fh-cd-static-snap";image.alt="";
      canvas.parentNode.insertBefore(image,canvas);
    }
    image.src=dataUrl;
    // A snapshot d100 is one host with one numeral slot (core emits no part
    // pair for it), so the two digits print together, percentile-style.
    number.textContent=pending?"":sides===100?(result===100?"00":String(result).padStart(2,"0")):displayValue(sides,result);
    number.style.color=(MATERIALS[materialName]||MATERIALS.ivory).num;
    host.classList.add("is-webgl");host.classList.add("is-settled");
    /* The canvas must go, and this line was MISSING -- measured 2026-08-16 in
       the FHPC builder, the first place to take this path from the outside.
       `is-webgl` is what turns the canvas back on (`.is-webgl canvas {
       display: block }`), and a block canvas beside a block image STACK: the
       host renders at DOUBLE height (51 x 136 where a square was expected).
       The animated path never showed it, because `settleToSnapshot` hides the
       canvas itself right after calling us -- a line this path never had.
       No `loseCanvasContext` here, deliberately: in the snapshot path the
       canvas never got a context, and asking for one just to drop it would
       create the very thing this path exists to avoid. */
    canvas.style.display="none";
    return true;
  }
  function mountDie(host){
    var sides=Number(host.dataset.sides)||20,result=Math.max(1,Math.min(sides,Number(host.dataset.result)||1));
    var materialName=host.dataset.material||"ivory",pending=host.dataset.pending==="1";
    var animate=!pending&&host.dataset.animate==="1"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index=Number(host.dataset.index)||0;
    if(host.dataset.snapshot==="1"){
      var snapSizePx=parseFloat(host.style&&host.style.getPropertyValue("--fh-static-die-size"))||52;
      mountSnapshot(host,sides,result,materialName,pending,snapSizePx);
      return;
    }
    /* Read straight off the inline style the markup already carries, rather
       than measuring the DOM: host itself is laid out, but its children
       (canvas, and for d100 the .fh-cd-static-die-part halves) are all
       display:none at this point, so any rect-based measurement of them
       is 0x0 regardless of what the CSS says their eventual size will be. */
    var hostSizePx=parseFloat(host.style&&host.style.getPropertyValue("--fh-static-die-size"))||52;
    if(sides===100){
      var parts=host.querySelectorAll(".fh-cd-static-die-part");
      if(!parts||parts.length!==2)return;
      var partSizePx=hostSizePx*.78; /* matches the .78 ratio in companion-dock.css */
      var percentile=result===100?"00":String(result).padStart(2,"0"),mounted=true;
      parts.forEach(function(part,partIndex){
        var canvas=part.querySelector("canvas"),number=part.querySelector(".fh-cd-static-die-result");
        var digit=Number(percentile.charAt(partIndex)),faceIndex=digit===0?9:digit-1;
        if(!canvas||!number){mounted=false;return;}
        number.textContent=pending?"":String(digit);
        if(!animatePart(host,canvas,number,10,faceIndex,result,index*2+partIndex,materialName,animate,partSizePx))mounted=false;
      });
      if(mounted){
        host.classList.add("is-webgl");host.classList.add("is-percentile");
        if(animate)playRollSound(sides,index);
      }
      return;
    }
    var canvas=host.querySelector("canvas"),number=host.querySelector(".fh-cd-static-die-result");
    if(!canvas||!number)return;
    number.textContent=pending?"":displayValue(sides,result);
    if(animatePart(host,canvas,number,sides,(result-1)%geometryFor(sides).faceNormals.length,result,index,materialName,animate,hostSizePx)){
      host.classList.add("is-webgl");
      if(animate)playRollSound(sides,index);
    }
  }
  /* Frees one canvas's WebGL context deterministically instead of waiting on
     the garbage collector — the same discipline releasePickerContext applies
     to the shared generator, per die. */
  function loseCanvasContext(canvas){
    try{
      var gl=canvas.getContext("webgl");
      var ext=gl&&gl.getExtension&&gl.getExtension("WEBGL_lose_context");
      if(ext&&ext.loseContext){ext.loseContext();return true;}
    }catch(error){}
    return false;
  }
  /* The stop of Eric's roll-small-stop-zoom (2026-08-04): once a die has
     settled, its live canvas is swapped for the cached bitmap of the same
     pose at the SETTLED size (data-settle-size), the size change riding a
     CSS transition — the die grows and the row tightens. The freed context
     is what lets the next wave row start rolling. d100 keeps its live pair:
     its two-part markup has no single snapshot slot, and it is rare. */
  function settleToSnapshot(host){
    if(host.dataset.snapped==="1")return;
    var sides=Number(host.dataset.sides)||20;
    if(sides===100)return;
    var result=Math.max(1,Math.min(sides,Number(host.dataset.result)||1));
    var materialName=host.dataset.material||"ivory";
    var settleSize=parseFloat(host.dataset.settleSize)||parseFloat(host.style&&host.style.getPropertyValue("--fh-static-die-size"))||52;
    var canvas=host.querySelector("canvas");
    if(!mountSnapshot(host,sides,result,materialName,false,settleSize))return;
    host.dataset.snapped="1";
    host.style.setProperty("--fh-static-die-size",settleSize+"px");
    if(canvas){canvas.style.display="none";loseCanvasContext(canvas);}
  }
  /* The wave (Eric, 2026-08-04): a hand too large for the ~16-context cap
     rolls ROW BY ROW — each data-wave group tumbles in real 3D, settles,
     snapshots (freeing its contexts), and only then does the next row start.
     A longer animation, deliberately: everyone rolls in 3D, just not all at
     once. Dice without data-wave keep the old immediate mount, and still
     settle to snapshots so their contexts never linger. */
  var WAVE_GAP_MS=140;
  function mount(scope){
    if(!scope||!scope.querySelectorAll)return;
    var waves={};
    scope.querySelectorAll(".fh-cd-static-die:not([data-mounted])").forEach(function(host){
      host.setAttribute("data-mounted","1");
      var wave=host.dataset.wave;
      if(wave!=null&&wave!==""&&host.dataset.animate==="1"&&host.dataset.snapshot!=="1"){
        (waves[wave]=waves[wave]||[]).push(host);
      }else{
        mountDie(host);
        if(host.dataset.animate==="1"&&host.dataset.snapshot!=="1"&&host.dataset.settleSize){
          window.setTimeout(function(){if(host.isConnected)settleToSnapshot(host);},
            ROLL_DURATION_MS+Number(host.dataset.index||0)*42+120);
        }
      }
    });
    var rows=Object.keys(waves).sort(function(a,b){return Number(a)-Number(b);});
    var delay=0;
    rows.forEach(function(row){
      var hosts=waves[row];
      var span=ROLL_DURATION_MS+hosts.length*42;
      window.setTimeout(function(){
        hosts.forEach(function(host){if(host.isConnected)mountDie(host);});
        window.setTimeout(function(){hosts.forEach(function(host){if(host.isConnected)settleToSnapshot(host);});},span+80);
      },delay);
      delay+=span+WAVE_GAP_MS;
    });
  }

/* ══ LE CONSTRUCTEUR D'HÔTE — la moitié manquante du contrat ════════════
   🔴 MESURÉ AU NAVIGATEUR, 2026-08-15, ET C'EST CE QUI A RATÉ AU PREMIER
   ESSAI : `mountDie` ne CONSTRUIT pas le dé, il le REMPLIT. Il fait
   `host.querySelector("canvas")` — si le canvas n'est pas déjà là, il pose
   `data-mounted="1"` et ne fait rien. Trois hôtes vides, zéro erreur en
   console, zéro pixel. Un échec parfaitement silencieux.

   À l'amont, ce DOM est écrit à la main dans `fh-player-sheet.js` (des
   chaînes de HTML, quatre endroits). Le recopier ici laisserait les noms de
   classes internes à la charge de chaque appelant — et deux écrans qui
   écrivent la même structure divergent au premier changement. **Le module
   qui lit ces noms est celui qui doit les écrire.**

   ⛔ C'est le SEUL ajout de ce fichier au-delà de la copie. Il ne touche pas
   au rendu : il pose la structure que le corps ci-dessus attend déjà. */

const CLASSE_HOTE = "fh-cd-static-die";

/**
 * Fabrique un hôte conforme, prêt pour `mount()`.
 * @param {object} o
 * @param {number} o.sides    le nombre de faces (6 pour Abilities)
 * @param {number} o.result   ⚠️ RÉSOLU AVANT L'ANIMATION — le hasard
 *                            appartient à l'appelant, jamais à ce module
 * @param {number} [o.sizePx] la taille en px ; elle pose `--fh-static-die-size`,
 *                            dont TOUTE la feuille dérive le reste
 * @param {string} [o.material] une des `materialNames` (défaut `ivory`)
 * @param {number} [o.index]  le rang du dé : décale son départ de 42 ms, pour
 *                            que trois dés ne tombent pas à l'unisson
 * @param {boolean} [o.animate] `false` → le dé prend la pose du résultat, sans
 *                            tomber (c'est aussi ce que fait
 *                            `prefers-reduced-motion`, géré par le corps)
 * @param {number} [o.settleSizePx] ⭐ **CE QUI REND `ROLL 10` POSSIBLE.** Posé,
 *                            le dé se fige en image dès la fin du jet ET
 *                            LIBÈRE SON CONTEXTE WebGL (`settleToSnapshot` →
 *                            `loseCanvasContext`). Le navigateur en plafonne
 *                            ~16 : sans ça, dix jets de trois dés en épuisent
 *                            la réserve et le plateau cesse de rendre, sans
 *                            une erreur. Avec, il n'y en a jamais plus de
 *                            trois vivants. La valeur est la taille de
 *                            l'image figée — la même que `sizePx` garde le
 *                            dé tel quel, une plus grande le fait grandir en
 *                            se posant (la feuille anime la transition).
 * @returns {HTMLElement} à insérer, PUIS à passer par `mount(scope)`
 */
export function createDieHost({ sides, result, sizePx = 52, material = "ivory", index = 0, animate = true, settleSizePx = null, snapshot = false }) {
  const host = document.createElement("span");
  host.className = CLASSE_HOTE + (Number(sides) === 100 ? " is-percentile" : "");
  host.dataset.sides = String(sides);
  host.dataset.result = String(result);
  host.dataset.material = material;
  host.dataset.index = String(index);
  host.dataset.animate = animate ? "1" : "0";
  host.dataset.pending = "0";
  /* ⭐ LE CHEMIN IMAGE — exposé au lot 80, et c'est un besoin MESURÉ, pas un
     confort. Le corps le portait déjà (`mountDie` : `if (host.dataset.snapshot
     === "1") return mountSnapshot(…)`, « no live context, ever ») ; seul le
     ruban ES module ne le laissait pas passer.
     🔴 CE QU'IL RÉPARE : `settleToSnapshot` ne part QUE sur un dé ANIMÉ
     (`host.dataset.animate === "1"`, voir `mount`). Un dé posé sans animation
     — le vivier des caractéristiques, la palette FREE, le fantôme du glisser —
     garde donc son contexte WebGL VIVANT, indéfiniment. Compté pour l'écran
     Abilities de FREE : 16 dés de palette + 6 dés posés = **22 contextes**,
     pour un plafond navigateur de ~16. Le plateau serait devenu noir SANS UNE
     SEULE ERREUR — le mode de panne exact que `settleSizePx` existe déjà pour
     éviter ailleurs.
     ⛔ CE N'EST PAS UNE RETOUCHE DU CŒUR COPIÉ : ces lignes-ci sont le ruban
     local (le corps `var`/`function` au-dessus est la copie verbatim de
     `fh-phb`, et un défaut s'y corrige EN AMONT — garde 7 des jetons). On ne
     fait que poser l'attribut que le corps lisait déjà. */
  if (snapshot) host.dataset.snapshot = "1";
  if (settleSizePx !== null) host.dataset.settleSize = String(settleSizePx);
  host.style.setProperty("--fh-static-die-size", `${sizePx}px`);
  host.setAttribute("role", "img");
  host.setAttribute("aria-label", `d${sides} result ${result}`);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");

  const chiffre = document.createElement("b");
  chiffre.className = CLASSE_HOTE + "-result";
  chiffre.setAttribute("aria-hidden", "true");

  /* LE REPLI, quand WebGL manque. L'amont y met un dé en SVG dessiné par
     `dieSvg()`, qui vit dans sa feuille de personnage et tirerait tout le
     fichier derrière lui. Ici : le nombre, lisible, centré. La feuille
     l'efface d'elle-même dès que le rendu prend (`.is-webgl` l'éteint), donc
     il ne se voit que s'il sert vraiment.
     📌 Son style est POSÉ ICI, en ligne, et pas dans `dice3d.css` : cette
     feuille-là est une copie de l'amont, et on n'y ajoute rien à nous. */
  const repli = document.createElement("span");
  repli.className = CLASSE_HOTE + "-fallback";
  repli.textContent = String(result);
  /* ⛔ AUCUN `display` ICI — MESURÉ AU NAVIGATEUR, 2026-08-15. Un
     `display:grid` en ligne l'emporte sur la feuille, et la règle
     `.is-webgl .fh-cd-static-die-fallback{display:none}` cessait de mordre :
     le repli restait affiché SOUS les trois dés, alors que le rendu marchait.
     Le `display` appartient à la feuille — elle seule sait si WebGL a pris. */
  repli.style.cssText =
    "width:100%;height:100%;text-align:center;" +
    "line-height:var(--fh-static-die-size);" +
    "font-size:calc(var(--fh-static-die-size) * .34);font-weight:700;";

  host.append(canvas, chiffre, repli);
  return host;
}

/* ══ LES EXPORTS — ce que l'amont posait sur `window.FHStaticDice` ══════ */

export { mount, pickerImage, resultImage, releasePickerContext };

/** Les faces qu'une géométrie sait rendre. Abilities n'en emploie qu'une (6). */
export const supportedSides = SUPPORTED_SIDES.slice();

/** Les noms de matière acceptés par `data-material`. */
export const materialNames = Object.keys(MATERIALS);

/** La durée d'une animation, en ms — 960, calibrée avec les sons.
 *  ⛔ Elle est LUE par l'écran, jamais recopiée : les deux nombres vivaient
 *  dans deux fichiers sans se connaître au lot 77, et rallonger l'un rognait
 *  l'autre en silence. Une seule source. */
export const rollDurationMs = ROLL_DURATION_MS;

/** Le son : coupé/rétabli, et la coupure SURVIT au rechargement
 *  (`localStorage`). `preview` joue un échantillon sans lancer de dé. */
export const sound = {
  isMuted() { return soundMuted; },
  setMuted: setSoundMuted,
  setVolume: setSoundVolume,
  preview(sides) { return playRollSound(Number(sides) || 20, 0); },
  samples: SOUND_SAMPLES.map((sample) => sample.file),
  rollDurationMs: ROLL_DURATION_MS
};
