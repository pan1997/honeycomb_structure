var container;
var camera,scene,renderer,controls;


var showThreads=[];

var nbond=3;
var nfree=3;
var ncell=2*(nbond+nfree);
var dw=20;
var theta=60*math.pi/180;
var gap=20;

var weft_thread_rad=2;
var warp_thread_rad=2;
var nlayers=4;
var nrep=2*ncell;
var nsteps=350;

var cellx=2*nbond*dw+2*nfree*dw*math.cos(theta);
var celly=(dw*math.sin(theta)*nfree+gap);
init();


//thread turing point above/below layer number at waft_number 

//weft type
//{layer_no,weft_number}
// lower weft is just(x-1,y)

//(x,y)
function pos_of_weft(w){
	var ns=w.weft_number%ncell;
	var x=cellx*(w.weft_number-ns)/ncell;
	for(var i=0;ns>0&&i<nbond;ns--,i++)
		x+=dw;
	for(var i=0;ns>0&&i<nfree;ns--,i++)
		x+=dw*math.cos(theta);
	for(var i=0;ns>0&&i<nbond;ns--,i++)
		x+=dw;
	for(var i=0;ns>0&&i<nfree;ns--,i++)
		x+=dw*math.cos(theta);
	var y=celly*w.layer_number;
	var sign=1;
	if(w.layer_number%2==1)
		sign=-1;
	y=y+sign*(celly-gap)/2;
	ns=w.weft_number%ncell;

	ns-=nbond;
	if(ns>0){
		y-=sign*dw*math.sin(theta)*math.min(ns,nfree);
		ns-=nfree;
	}
	ns-=nbond;
	if(ns>0){
		y+=sign*dw*math.sin(theta)*math.min(ns,nfree);
		ns-=nfree;
	}
	return {x:x-cellx/2*(nrep/ncell),y:y-celly*(nlayers/4)};
}


function getCircle(){
	var cir=new THREE.Shape();
	cir.moveTo(warp_thread_rad,0);
	cir.absarc(0,0,warp_thread_rad,2*math.pi,false);
	return cir;
}
function init3D(){
	renderer=new THREE.WebGLRenderer();
	renderer.setClearColor(0x333F47, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth,window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	scene=new THREE.Scene();
	camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,20000);


	window.addEventListener('resize', function() {
      		var WIDTH = window.innerWidth,HEIGHT = window.innerHeight;
      		renderer.setSize(WIDTH, HEIGHT);
      		camera.aspect = WIDTH / HEIGHT;
      		camera.updateProjectionMatrix();
    	});
	camera.position.set(0,0,1000);
	controls=new THREE.TrackballControls(camera,renderer.domElement);
	controls.minDistance=20;
	controls.maxDistance=10000;
	var light=new THREE.PointLight(0xFFFFFF);
	light.position.set(-cellx*(nrep/ncell),-celly*(nlayers/2),0);
	scene.add(light);
	light=new THREE.PointLight(0xFFFFFF);
	light.position.set(cellx*(nrep/ncell),celly*(nlayers/2),0);
	scene.add(light);

	//weft threads
	
	for(var i=0;i<nlayers;i++){
		for(var j=0;j<nrep;j++){
			var point=pos_of_weft({weft_number:j,layer_number:i});
			var geom=new THREE.CylinderGeometry(weft_thread_rad,weft_thread_rad,2*gap*nlayers,32);
			geom.applyMatrix(new THREE.Matrix4().makeTranslation(point.x,0,point.y));
			//var mat=new THREE.MeshBasicMaterial({color:0x00FF00});
			var mat=new THREE.MeshLambertMaterial({color:0x00FF00});
			var thd=new THREE.Mesh(geom,mat);
			
			scene.add(thd);
		}
	}
	
	for(var i=0;i<nlayers;i++){
		var above=true;
		var layer=i;
		if(showThreads[i].first){
		
		var plist=[];

		for(var j=0;j<nrep;j++){
			var point=pos_of_weft({weft_number:j,layer_number:layer});
			plist.push(new THREE.Vector3(point.x,gap*(2*i-nlayers),point.y+(above?6:-6)));

			var loc=j%ncell;
			if(loc<=nbond){
				var mid=(above==(layer%2==0));
				if(mid==false){
					layer=layer+(above?-1:1);
					above=(above?false:true);
				}
			}else if(loc<nbond+nfree){
				above=(above?false:true);
			}else if(loc<=nbond+nfree+nbond){

				if(i==0||i==nlayers-1){
					above=above?false:true;
				}
				else{
				var mid=(above==(layer%2==1));
				if(mid==false){
					layer=layer+(above?-1:1);
					above=(above?false:true);
				}
				}
			}else
				above=(above?false:true);
		}
		var curve=new THREE.SplineCurve3(plist);
		var TG=new THREE.ExtrudeGeometry(getCircle(),{steps:nsteps,extrudePath:curve});
		var TO=new THREE.Mesh(TG,new THREE.MeshLambertMaterial({color:0x0000FF}));
		scene.add(TO);
		}
		above=false;
		layer=i;
		if(showThreads[i].second){
		var plist=[];
		for(var j=0;j<nrep;j++){
			var point=pos_of_weft({weft_number:j,layer_number:layer});			
			plist.push(new THREE.Vector3(point.x,gap*(2*i+1-nlayers),point.y+(above?6:-6)));
			var loc=j%ncell;
			if(loc<=nbond){
				var mid=(above==(layer%2==0));
				if(mid==false){
					layer=layer+(above?-1:1);
					above=(above?false:true);
				}
			}else if(loc<nbond+nfree){
				above=(above?false:true);
			}else if(loc<=nbond+nfree+nbond){
				if(i==0||i==nlayers-1){
					above=above?false:true;
				}
				else{
					var mid=(above==(layer%2==1));
					if(mid==false){
						layer=layer+(above?-1:1);
						above=(above?false:true);
					}
				}
			}else
				above=(above?false:true);
		}
		var curve=new THREE.SplineCurve3(plist);
		var TG=new THREE.ExtrudeGeometry(getCircle(),{steps:nsteps,extrudePath:curve});
		var TO=new THREE.Mesh(TG,new THREE.MeshLambertMaterial({color:0x0000FF}));
		scene.add(TO);
		}
	}
	var exporter=new THREE.OBJExporter();
	var exportJson=JSON.stringify(exporter.parse(scene));
	download(exportJson,"object.json","text/json");	
}

function animate(){
	requestAnimationFrame(animate);
	renderer.render(scene,camera);
	controls.update();
}

function change(i){
	showThreads[i].first=(showThreads[i].first?false:true);
	showThreads[i].second=(showThreads[i].second?false:true);
}
function init(){
	var controls=document.getElementById("buttons");
	for(var i=0;i<nlayers;i++){
		var but=document.createElement("BUTTON");
		but.type="button";
		//but.value=i;
		var txt=document.createTextNode(i);
		showThreads.push({first:true,second:true});
		but.onclick=new Function("change("+i+")");
		but.appendChild(txt);
		controls.appendChild(but);
	}
	//showThreads[1].first=true;
	//showThreads[1].second=true;
	init3D();
	animate();
	//repaint();
}
