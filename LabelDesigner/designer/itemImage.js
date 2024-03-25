fabric.Bitmap = fabric.util.createClass(fabric.Image, {
	type: 'Bitmap',
	// initialize can be of type function(options) or function(property, options), like for text.
	// no other signatures allowed.
	initialize: function(options) {
		options || (options = { });
		this.callSuper('initialize', options);
		this.set('label', options.label || '');
		this.set('barcode_type',options.barcode_type);
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
		  src:this.src,
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

fabric.Bitmap.fromObject = function(object, callback) {
	return fabric.Object._fromObject('Bitmap', object, callback);
}

function item_bitmap_update_attribute(obj){
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
			var zoom=Math.round(obj.scaleX);
			if(zoom<1)zoom=1;
			if(zoom>4)zoom=4;
			obj.scaleX=zoom;
			obj.scaleY=zoom;
			
		});
		
		try{
			if(obj.src==''){
				var base64='data:image/png;base64,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';
				obj.setSrc(base64, function(img){
					obj.loaded=true;
					label.canvas.renderAll();
				});
			}
			/*
			if(obj.barcode_type=="DATAMATRIX"){
				var svg = DATAMatrix({
					 msg :  obj.label
					,dim :   256
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
			*/
		}catch(e){
			console.log(e);
		}
	};
	obj.update_attribute(obj);
}

/*
function item_action_bitmap_set_types(obj,menuItemTypeSelect)
{
	var barcode_types=[
		'QRCODE',
		'DATAMATRIX',
		'PDF417',
		];
	menuItemTypeSelect.options.length = 0;
	for (let barcode_type of barcode_types) {
		menuItemTypeSelect.innerHTML+='<option value="'+barcode_type+'">'+barcode_type+'</option>';
	}
	menuItemTypeSelect.value = obj.barcode_type;
	menuItemTypeSelect.onchange = function(e) {
		const selectedOption = menuItemTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemTypeSelect.selectedIndex=menuItemTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			obj.barcode_type=selectedOption;
			item_bitmap_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}
*/

function bitmap_add(){
	var obj = new fabric.Bitmap({
		src:'',
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
	item_bitmap_update_attribute(obj);
	label.canvas.add(obj);
	label.canvas.renderAll();
	label.save_to_session();
}

