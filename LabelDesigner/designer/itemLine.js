function item_line_update_attribute(obj){
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
		obj['setControlVisible']('mr',true);
		obj['setControlVisible']('mb',false);
		obj['setControlVisible']('br',false);
		obj['setControlVisible']('mtr',true);
		obj.on("scaling", function(e) {
			var newWidth=obj.width*obj.scaleX;
			obj.scaleX=1;
			obj.setWidth(newWidth);
			var newHeight=obj.height*obj.scaleY;
			obj.scaleY=1;
			obj.setHeight(newHeight);
		});
		obj.set('fill','transparent');
		obj.set('padding',4);
		if(obj.line_type==1){
			obj.set('strokeDashArray',[2,2]);
		}else{
			obj.set('strokeDashArray',[]);
		}
	};

	obj.update_attribute(obj);
}

function item_action_line_set_types(obj,menuItemTypeSelect,menuItemSubTypeSelect)
{
	var line_types=[['width:1px',1],['width:2px',2],['width:3px',3],['width:4px',4],['width:5px',5],];
	
	menuItemTypeSelect.options.length = 0;
	for (let line_type of line_types) {
		menuItemTypeSelect.innerHTML+='<option value="'+line_type[1]+'">'+line_type[0]+'</option>';
	}
	menuItemTypeSelect.value = obj.strokeWidth;
	item_action_line_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);

	menuItemTypeSelect.onchange = function(e) {
		const selectedOption = menuItemTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemTypeSelect.selectedIndex=menuItemTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			item_action_line_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect);
			obj.set('strokeWidth',selectedOption);
			obj.line_type=menuItemSubTypeSelect.value;
			item_line_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}

function item_action_line_set_sub_types(obj,menuItemTypeSelect,menuItemSubTypeSelect)
{
	menuItemSubTypeSelect.options.length = 0;
	menuItemSubTypeSelect.innerHTML+='<option value="'+0+'">'+'实线'+'</option>';
	menuItemSubTypeSelect.innerHTML+='<option value="'+1+'">'+'虚线'+'</option>';

	menuItemSubTypeSelect.value = obj.line_type;

	menuItemSubTypeSelect.onchange = function(e) {
		var selectedOption = menuItemSubTypeSelect.value;
		var locked=(obj.opacity!=1);
		if(locked){
			menuItemSubTypeSelect.selectedIndex=menuItemSubTypeSelect.defaultIndex;
			mui.toast("内容被锁定，解锁后再修改");
		}else{
			obj.line_type=selectedOption;
			item_line_update_attribute(obj);
			label.canvas.renderAll();
			label.save_to_session();
		}
	};
}

function item_line_add()
{
	const obj = new fabric.Line([50, 50, 200, 50],{
		originX: "left",
        originY: "top",
		fill:'transparent',
		stroke:'#000000',
		strokeWidth:2,
		padding:4,
		line_type:0,
	});
	item_line_update_attribute(obj);
	label.canvas.add(obj);
	label.canvas.renderAll();
	label.save_to_session();
}


