var Barcode2DTypes=[
	{type:'QRCODE',sub_types:[
		['L',0],['M',1],['Q',2],['H',3],
		]},
	{type:'DATAMATRIX',sub_types:[['DATAMATRIX','DATAMATRIX']]},
	{type:'PDF417',sub_types:[['PDF417','PDF417']]},
];

fabric.Barcode2D = fabric.util.createClass(fabric.Image, {
	type: 'Barcode2D',
	// initialize can be of type function(options) or function(property, options), like for text.
	// no other signatures allowed.
	initialize: function(options) {
		options || (options = { });
		this.callSuper('initialize', options);
		this.set('label', options.label || '');
		this.set('barcode_type',options.barcode_type);
		this.set('barcode_sub_type',options.barcode_sub_type);
		this.set('src','');
		this.set('left',options.left);
		this.set('top',options.top);
		this.set('scaleX',options.scaleX);
		this.set('scaleY',options.scaleY);
		this.set('angle',options.angle);
		this.set('opacity',options.opacity);
	},
	toObject: function() {
		return fabric.util.object.extend(this.callSuper('toObject'), {
		  label: this.get('label'),
		  barcode_type:this.get('barcode_type'),
		  barcode_sub_type:this.get('barcode_sub_type'),
		  src:'',
		});
	},

	_render: function(ctx) {
		if(this.loaded==true){
			this.callSuper('_render', ctx);
		}
//		ctx.font = '20px Helvetica';
//		ctx.fillStyle = '#333';
//		ctx.fillText(this.label, -this.width/2, -this.height/2 + 20);
	}

});

fabric.Barcode2D.fromObject = function(object, callback) {
	return fabric.Object._fromObject('Barcode2D', object, callback);
}

function canvasToSVG(canvas) {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
 
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', canvas.width);
  svg.setAttribute('height', canvas.height);
  svg.setAttribute('version', '1.1');
 
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const r = data.data[index];
      const g = data.data[index + 1];
      const b = data.data[index + 2];
      const a = data.data[index + 3];
 
      if (a > 0) {
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', 1);
        rect.setAttribute('height', 1);
        rect.setAttribute('fill', `rgba(${r},${g},${b},${a / 255})`);
        svg.appendChild(rect);
      }
    }
  }
 
  return new XMLSerializer().serializeToString(svg);
}
 
function item_barcode2d_update_attribute(obj){
	obj.update_attribute=function(obj){
		var step = 90;
		var angle= Math.round(obj.angle/step) * step;
		obj.angle = angle;
		obj.snapAngle = 90;
		obj.flipX = false;
		obj.flipY = false;
		obj.lockScalingFlip=true;
	//	obj.lockScalingX=true;
	//	obj.lockScalingY=true;
	//	obj.lockRotation=true;
		obj['setControlVisible']('mr',false);
		obj['setControlVisible']('mb',false);
		obj['setControlVisible']('br',true);
		obj['setControlVisible']('mtr',false);

		obj.on("scaling", function(e) {
			console.log(obj.width);
			var zoom=Math.round(obj.scaleX*1);
			if(zoom<2)zoom=2;
			if(zoom>8)zoom=8;
			obj.scaleX=zoom/1;
			obj.scaleY=zoom/1;
		});
		
		try{
			if(obj.barcode_type=="QRCODE"){
				if(typeof obj.svg==='undefined'){
					obj.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				}
				var correct=QRCode.CorrectLevel.L;
				if(obj.barcode_sub_type==0){correct=QRCode.CorrectLevel.L;};
				if(obj.barcode_sub_type==1){correct=QRCode.CorrectLevel.M;};
				if(obj.barcode_sub_type==2){correct=QRCode.CorrectLevel.Q;};
				if(obj.barcode_sub_type==3){correct=QRCode.CorrectLevel.H;};
				var qrcode = new QRCode(obj.svg, {
					text: "http://jindo.dev.naver.com/collie",
					width: 64,
					height: 64,
					colorDark : "#000000",
					colorLight : "#ffffff",
					correctLevel : correct,
					useSVG:true,
					onRenderingEnd:function(svg){
						var xml = new XMLSerializer().serializeToString(svg);
						var base64 = 'data:image/svg+xml;base64,' + btoa(xml);
						obj.setSrc(base64, function(img){
							obj.loaded=true;
							label.canvas.renderAll();
						});
					},
				});
			}
			if(obj.barcode_type=="DATAMATRIX"){
				var bit_size=1;
				var svg = DATAMatrix({
					 msg :  obj.label
					,dim :   bit_size
					,rct :   0
					,pad :   0
					,pal : ["#000000", "#ffffff"]
					,vrb :   0
					});
				var xml = new XMLSerializer().serializeToString(svg);
				svg.style.display='none';
				var base64 = 'data:image/svg+xml;base64,' + btoa(xml);
				obj.setSrc(base64, function(img){
					obj.loaded=true;
					label.canvas.renderAll();
				});
			}
			if(obj.barcode_type=="PDF417"){
				if(typeof obj.pdf417_canvas==='undefined'){
					obj.pdf417_canvas = document.createElement('canvas');
					//obj.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				}
                PDF417.draw(obj.label, obj.pdf417_canvas,1,-1,1,'rgb(0,0,0)');
				const svgString = canvasToSVG(obj.pdf417_canvas);
				var base64 = 'data:image/svg+xml;base64,' + btoa(svgString);
				obj.setSrc(base64, function(img){
					obj.loaded=true;
					label.canvas.renderAll();
				});
			}
		}catch(e){
			console.log(e);
		}
	};
	obj.update_attribute(obj);
}

function item_action_barcode2d_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect)
{
	var barcode_types=[];
	for(let Barcode2DType of Barcode2DTypes){
		barcode_types[barcode_types.length]=Barcode2DType.type;
	}
	//console.log(barcode_types);

	
	menuItemTypeSelect.options.length = 0;
	for (let barcode_type of barcode_types) {
		menuItemTypeSelect.innerHTML+='<option value="'+barcode_type+'">'+barcode_type+'</option>';
	}
	menuItemTypeSelect.value = obj.barcode_type;
	item_action_barcode2d_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);

	menuItemTypeSelect.onchange = function(e) {
		const selectedOption = menuItemTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemTypeSelect.selectedIndex=menuItemTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			item_action_barcode2d_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
			obj.barcode_type=selectedOption;
			obj.barcode_sub_type=menuItemSubTypeSelect.value;
			item_barcode2d_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}

function item_action_barcode2d_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect)
{
	var barcode_sub_types=[];
	for(let Barcode2DType of Barcode2DTypes){
		if(Barcode2DType.type==menuItemTypeSelect.value){
			barcode_sub_types=Barcode2DType.sub_types;
		}
	}
	//console.log(barcode_sub_types);
	menuItemSubTypeSelect.options.length = 0;
	for (let barcode_sub_type of barcode_sub_types) {
		menuItemSubTypeSelect.innerHTML+='<option value="'+barcode_sub_type[1]+'">'+barcode_sub_type[0]+'</option>';
	}
	for (let barcode_sub_type of barcode_sub_types) {
		if(barcode_sub_type[1]==obj.barcode_sub_type){
			menuItemSubTypeSelect.value = barcode_sub_type[1];
			break;
		}
	}
	menuItemSubTypeSelect.onchange = function(e) {
		var selectedOption = menuItemSubTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemSubTypeSelect.selectedIndex=menuItemSubTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			obj.barcode_sub_type=selectedOption;
			//console.log('barcode_sub_type:'+obj.barcode_sub_type);
			item_barcode2d_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}


function barcode2d_add(){
	var obj = new fabric.Barcode2D({
		label:'12345678',
		barcode_type:Barcode2DTypes[0].type,
		originX: "left",
		originY: "top",
		left: 100,
		top: 100,
		width: 100,
		height: 100,
		snapAngle:90,
		lockScalingFlip:true,
		scaleX:1,
		scaleY:1,
		opacity:1,
		angle:0,
	});	
	item_barcode2d_update_attribute(obj);
	label.canvas.add(obj);
	label.canvas.renderAll();
	label.save_to_session();
}

